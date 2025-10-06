use std::{
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::{Emitter, RunEvent, State};

#[derive(Default)]
struct OpenWithState {
    pending: Mutex<Vec<OpenWithFile>>,
}

#[derive(Clone, serde::Serialize)]
struct OpenWithFile {
    path: String,
    mode: String,
}

#[tauri::command]
fn get_pending_open_with_files(state: State<OpenWithState>) -> Vec<OpenWithFile> {
    let mut pending = state.pending.lock().expect("open-with mutex poisoned");
    pending.drain(..).collect()
}

fn classify_mode(path: &Path) -> &'static str {
    let extension = path.extension().and_then(|ext| ext.to_str());

    match extension {
        Some(ext) if ext.eq_ignore_ascii_case("jsonl") => "jsonl",
        Some(ext) if ext.eq_ignore_ascii_case("json") => "json",
        Some(ext) if ext.eq_ignore_ascii_case("geojson") => "json",
        _ => "json",
    }
}

fn to_open_with_files<I>(paths: I) -> Vec<OpenWithFile>
where
    I: IntoIterator<Item = PathBuf>,
{
    paths
        .into_iter()
        .map(|path| OpenWithFile {
            mode: classify_mode(&path).to_string(),
            path: path.to_string_lossy().to_string(),
        })
        .collect()
}

fn queue_open_with_files(app: &tauri::AppHandle, files: Vec<OpenWithFile>) {
    if files.is_empty() {
        return;
    }

    if let Some(state) = app.try_state::<OpenWithState>() {
        let mut pending = state.pending.lock().expect("open-with mutex poisoned");
        pending.extend(files.clone());
    }

    if let Err(err) = app.emit_all("open-with", &files) {
        log::error!("Failed to emit open-with event: {err}");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .manage(OpenWithState::default())
        .invoke_handler(tauri::generate_handler![get_pending_open_with_files])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Handle "Open with" functionality - Windows passes file paths as CLI args
            let paths: Vec<PathBuf> = std::env::args_os().skip(1).map(PathBuf::from).collect();
            if !paths.is_empty() {
                let files_with_mode = to_open_with_files(paths);
                queue_open_with_files(&app.handle(), files_with_mode);
            }

            Ok(())
        });

    builder
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            #[cfg(any(target_os = "macos", target_os = "ios"))]
            {
                if let RunEvent::Opened { urls } = event {
                    let paths = urls
                        .into_iter()
                        .filter_map(|url| url.to_file_path().ok())
                        .collect::<Vec<_>>();
                    let files_with_mode = to_open_with_files(paths);
                    queue_open_with_files(app_handle, files_with_mode);
                }
            }

            #[cfg(not(any(target_os = "macos", target_os = "ios")))]
            {
                let _ = app_handle;
                let _ = event;
            }
        });
}

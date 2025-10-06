use std::path::PathBuf;
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
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
        // Emit to frontend with file paths and determine mode based on extension
        let files_with_mode: Vec<serde_json::Value> = paths.into_iter().map(|path| {
          let extension = path.extension().and_then(|ext| ext.to_str()).unwrap_or("");
          let mode = match extension.to_lowercase().as_str() {
            "jsonl" => "jsonl",
            "json" | "geojson" => "json",
            _ => "json" // default to json mode
          };
          serde_json::json!({
            "path": path.to_string_lossy(),
            "mode": mode
          })
        }).collect();
        
        app.emit("open-with", &files_with_mode)?;
      }
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

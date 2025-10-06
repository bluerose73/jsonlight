let long_demo = {
    "string": "This is a string value\nThis the second line",
    "number": 123.456,
    "list": ["elem1", "elem2", "elem3", "elem4", "elem5", "elem6",
             "elem7", "elem8", "elem9", "elem10", "elem11", "elem12",
             "elem13", "elem14", "elem15", "elem16", "elem17", "elem18"],
    "boolean": true,
    "null": null
};

let demo = {
    "string": "This is a string value\nThis the second line\n" +
              "Test HTML tags: <span> content </span>\n",
    "number": 123.456,
    "list": ["elem1", "elem2"],
    "boolean": true,
    "null": null,
    "long-demo": long_demo,
    "empty-list": [],
    "empty-object": {},
    "long-string": "Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long Very Long "
};

let welcome = {
    "title": "JSON Light",
    "description": "A JSON viewer that displays multi-line strings in its raw format!",
    "tip": "Click the R (view raw) button in the following line",
    "banner": "\n       _  _____  ____  _   _   _      _       _     _   \n      | |/ ____|/ __ \\| \\ | | | |    (_)     | |   | |  \n      | | (___ | |  | |  \\| | | |     _  __ _| |__ | |_ \n  _   | |\\___ \\| |  | | . ` | | |    | |/ _` | '_ \\| __|\n | |__| |____) | |__| | |\\  | | |____| | (_| | | | | |_ \n  \\____/|_____/ \\____/|_| \\_| |______|_|\\__, |_| |_|\\__|\n                                         __/ |          \n                                        |___/           \n"
}

/*************************************
 *              Renderer             *
 *************************************/

// JSON key-value pair -> HTML element
// for a key-value pair in an object, key is a string.
// for elements in a list, key is a number "index".
// for the root-level value, key is null.
function renderKV(key, loader) {
    let kvRoot = newKV(loader);
    let kvText = kvRoot.querySelector(".kv .kv-text");
    kvText.appendChild(renderKey(key));

    let colonSpan = document.createElement("span");
    colonSpan.innerText = ": ";
    kvText.appendChild(colonSpan);

    value = loader.getValue();
    let valueSpan = null;
    switch (typeof value) {
        case "string":
            valueSpan = renderString(kvRoot, value);
            break;
        case "number":
            valueSpan = renderNumber(kvRoot, value);
            break;
        case "boolean":
            valueSpan = renderBool(kvRoot, value);
            break;
        case "object":
            if (value == null) {
                valueSpan = renderNull(kvRoot, value);
            }
            else if (Array.isArray(value)) {
                valueSpan = renderArray(kvRoot, value);
            }
            else {
                valueSpan = renderObject(kvRoot, value);
            }
    }
    kvText.appendChild(valueSpan);
    return kvRoot;
}

function newKV(loader) {
    let kvRoot = document.createElement("div");
    kvRoot.loader = loader;
    kvRoot.classList.add("kv-root");
    let kv = document.createElement("div");
    kv.classList.add("kv", "d-flex", "align-items-center", "mb-1");
    let kvText = document.createElement("div");
    kvText.classList.add("kv-text");
    kv.appendChild(kvText);
    kvRoot.appendChild(kv);
    return kvRoot;
}

function newToggleButton(text) {
    let toggleButton = document.createElement("button");
    toggleButton.classList.add("btn", "btn-light", "btn-sm");
    toggleButton.setAttribute("data-bs-toggle", "button");
    toggleButton.setAttribute("type", "button");
    toggleButton.innerHTML = text;
    return toggleButton;
}

// Adds a collapse button and a collapsed child list to kvRoot.
// The child list is initially empty,
// When the button is hit, the child list is rendered from dataRef
function addCollapse(kvRoot, dataRef) {
    kvRoot.dataRef = dataRef

    let kv = kvRoot.querySelector(".kv");
    
    let collapseButton = newToggleButton("+");
    collapseButton.classList.add("toggle-button", "collapse-button");
    kv.insertBefore(collapseButton, kv.firstChild);
    
    let collapseWrapper = document.createElement("div");
    collapseWrapper.classList.add("collapse");
    let childBlock = document.createElement("div");
    childBlock.classList.add("child-block", "d-flex", "gap-2");
    let indent = document.createElement("div");
    indent.classList.add("indent", "border-end", "pe-5", "flex-shrink-0");
    let childList = document.createElement("div");
    childList.classList.add("child-list");
    childBlock.appendChild(indent);
    childBlock.appendChild(childList);
    collapseWrapper.appendChild(childBlock);
    kvRoot.appendChild(collapseWrapper);
    
    collapseButton.addEventListener("click", (ev) => {
        if (!collapseWrapper.classList.contains("collapsing")) {
            new bootstrap.Collapse(collapseWrapper);
        }
    });

    collapseWrapper.addEventListener('show.bs.collapse', (ev) => {
        ev.stopPropagation();
        for (const childKV of kvRoot.loader.getChild()) {
            childList.appendChild(
                renderKV(...childKV)
            )
        }
        collapseButton.innerHTML = "-";
    });
    collapseWrapper.addEventListener('hidden.bs.collapse', (ev) => {
        ev.stopPropagation();
        childList.replaceChildren();
        collapseButton.innerHTML = "+";
    })
}

// for a key-value pair in an object, key is a string.
// for elements in a list, key is a number "index".
// for the root-level value, key is null.
function renderKey(key) {
    let keystr = "key error";
    if (key == null) keystr = "root";
    else if (typeof(key) == "number") {
        keystr = "[" + key.toString() + "]";
    }
    else if (typeof(key) == "string") {
        keystr = JSON.stringify(key);
    }
    let keySpan = document.createElement("span");
    keySpan.classList.add("text-primary");
    keySpan.innerText = keystr;
    return keySpan;
}

function addViewRaw(kvRoot) {
    let viewRawButton = newToggleButton("R");
    viewRawButton.classList.add("toggle-button", "view-raw-button");
    viewRawButton.addEventListener("click", (ev) => {
        if (viewRawButton.classList.contains("active")) {
            renderRawString(kvRoot);
        }
        else {
            cancelRawString(kvRoot);
        }
    });
    
    let kv = kvRoot.querySelector(".kv");
    kv.insertBefore(viewRawButton, kv.firstChild);
}

function renderRawString(kvRoot) {
    let jsonValue = kvRoot.querySelector(".kv .kv-text .json-value");
    jsonValue.style.display = "none";

    let rawString = document.createElement("pre");
    rawString.classList.add("raw-string", "mb-1");

    // The last trailing new line is not rendered by the browser.
    // Fix it by appending an extra newline character.
    rawString.textContent = kvRoot.loader.getValue() + "\n";
    kvRoot.appendChild(rawString);
}

function cancelRawString(kvRoot) {
    let rawString = kvRoot.querySelector(".raw-string");
    kvRoot.removeChild(rawString);
    let jsonValue = kvRoot.querySelector(".kv .kv-text .json-value");
    jsonValue.style.display = "initial";
}

function renderStringify(jobj) {
    let valueSpan = document.createElement("span");
    valueSpan.classList.add("json-value");
    valueSpan.textContent = JSON.stringify(jobj);
    return valueSpan;
}

function renderString(kvRoot, jobj) {
    addViewRaw(kvRoot);
    return renderStringify(jobj);
}

function renderNumber(kvRoot, jobj) {
    return renderStringify(jobj);
}

function renderBool(kvRoot, jobj) {
    return renderStringify(jobj);
}

function renderNull(kvRoot, jobj) {
    return renderStringify(jobj);
}

function renderArray(kvRoot, jobj) {
    let valueSpan = document.createElement("span");
    valueSpan.classList.add("json-value");
    if (jobj.length == 0) {
        valueSpan.textContent = "[]";
        return valueSpan;
    }
    addCollapse(kvRoot, jobj);
    valueSpan.textContent = "[...]";
    return valueSpan;
}

function renderObject(kvRoot, jobj) {
    let valueSpan = document.createElement("span");
    valueSpan.classList.add("json-value");
    if (Object.keys(jobj).length == 0) {
        valueSpan.textContent = "{}"
        return valueSpan;
    }
    addCollapse(kvRoot, jobj);
    valueSpan.textContent = "{...}"
    return valueSpan;
}

/*************************************
 *           Data Loader             *
 *************************************/

// base class for dataloaders
// A dataloader corresponds to an array or an object,
// and is responsible to load its children.
class DataLoader {
    constructor() {
        this.value = undefined;
    }

    loadString() {}
    async loadFile() {}
    loadObject(obj) {
        this.value = obj;
    }
    getValue() {
        return this.value;
    }
    // Returns a list of (key, dataloader).
    getChild() {}
}


class WebDataLoader extends DataLoader {
    constructor() {
        super();
    }

    loadString(jsonStr) {
        console.log(jsonStr);
        try {
            this.value = JSON.parse(jsonStr);
            return { success: true };
        }
        catch (exception) {
            return { 
                success: false, 
                error: exception.message,
                type: 'JSON Parse Error'
            };
        }
    }

    async loadFile(file) {
        if (file.name.endsWith(".json") || file.name.endsWith(".geojson"))
            return this.loadString(await file.text());
        if (file.name.endsWith(".jsonl")) {
            try {
                let fileText = await file.text();
                let lines = fileText.split(/[\r\n]+/);
                this.value = lines.filter(line => line).map((line, index) => {
                    try {
                        return JSON.parse(line);
                    } catch (exception) {
                        throw new Error(`Line ${index + 1}: ${exception.message}`);
                    }
                });
                return { success: true };
            }
            catch (exception) {
                return { 
                    success: false, 
                    error: exception.message,
                    type: 'JSONL Parse Error'
                };
            }
        }
        return { 
            success: false, 
            error: `Unsupported file type: ${file.name}`,
            type: 'File Type Error'
        };
    }

    getChild() {
        if (this.value == null || typeof this.value != "object") return [];
        let ret = []
        if (Array.isArray(this.value)) {
            for (const [i, v] of this.value.entries()) {
                let childLoader = new WebDataLoader();
                childLoader.loadObject(v);
                ret.push([i, childLoader]);
            }
            return ret;
        }
        
        // Object
        for (const [k, v] of Object.entries(this.value)) {
            let childLoader = new WebDataLoader();
            childLoader.loadObject(v);
            ret.push([k, childLoader]);
        }
        return ret;
    }
}

class JsonlDataLoader extends DataLoader {
    constructor() {
        super();
        this.lines = [];
        this.currentLine = 0;
    }

    async loadFile(file) {
        if (!file.name.endsWith(".jsonl") && !file.name.endsWith(".json") && !file.name.endsWith(".geojson")) {
            return { 
                success: false, 
                error: `Expected .json .jsonl .geojson file, got: ${file.name}`,
                type: 'File Type Error'
            };
        }
        
        try {
            let fileText = await file.text();
            this.lines = fileText.split(/[\r\n]+/).filter(line => line.trim());
            if (this.lines.length === 0) {
                return { 
                    success: false, 
                    error: 'File is empty or contains no valid lines',
                    type: 'JSONL File Error'
                };
            }
            return this.loadLine(0);
        }
        catch (exception) {
            return { 
                success: false, 
                error: exception.message,
                type: 'File Read Error'
            };
        }
    }

    loadLine(lineIndex) {
        if (lineIndex < 0 || lineIndex >= this.lines.length) {
            return { 
                success: false, 
                error: `Line ${lineIndex + 1} is out of range (1-${this.lines.length})`,
                type: 'Line Index Error'
            };
        }
        
        try {
            this.currentLine = lineIndex;
            this.value = JSON.parse(this.lines[lineIndex]);
            return { success: true };
        }
        catch (exception) {
            return { 
                success: false, 
                error: `Line ${lineIndex + 1}: ${exception.message}`,
                type: 'JSON Parse Error'
            };
        }
    }

    getTotalLines() {
        return this.lines.length;
    }

    getCurrentLine() {
        return this.currentLine;
    }

    getChild() {
        if (this.value == null || typeof this.value != "object") return [];
        let ret = []
        if (Array.isArray(this.value)) {
            for (const [i, v] of this.value.entries()) {
                let childLoader = new WebDataLoader();
                childLoader.loadObject(v);
                ret.push([i, childLoader]);
            }
            return ret;
        }
        
        // Object
        for (const [k, v] of Object.entries(this.value)) {
            let childLoader = new WebDataLoader();
            childLoader.loadObject(v);
            ret.push([k, childLoader]);
        }
        return ret;
    }
}

class DesktopDataLoader extends DataLoader {

}


/*************************************
 *           File Name Display       *
 *************************************/

function updateFileNameDisplay(fileName) {
    const fileNameElement = document.querySelector("#file-name-display");
    if (fileName) {
        fileNameElement.textContent = fileName;
        fileNameElement.title = fileName; // Show full name on hover
        fileNameElement.style.display = "block";
    } else {
        fileNameElement.textContent = "No file selected";
        fileNameElement.title = "";
        fileNameElement.style.display = "none";
    }
}

function clearFileNameDisplay() {
    updateFileNameDisplay(null);
}

/*************************************
 *           Controls                *
 *************************************/

let g_platform = "web";
let g_jsonlLoader = null; // Global JSONL loader for line navigation

function newDataLoader() {
    if (g_platform == "web") {
        return new WebDataLoader();
    }
    else {
        return new DesktopDataLoader();
    }
}

function renderJSON(loader) {
    let rootJson = renderKV(null, loader);
    document.querySelector("#view").appendChild(rootJson);
    let rootButton = rootJson.querySelector(".collapse-button");
    if (rootButton) {
        rootButton.style.display = "none";
        rootButton.click();
    }
}

function displayParseError(errorInfo) {
    let errorContainer = document.createElement("div");
    errorContainer.classList.add("alert", "alert-danger", "m-3");
    
    let errorTitle = document.createElement("h5");
    errorTitle.classList.add("alert-heading");
    errorTitle.innerText = errorInfo?.type || "Error";
    errorContainer.appendChild(errorTitle);
    
    let errorMessage = document.createElement("p");
    errorMessage.classList.add("mb-0");
    errorMessage.innerText = errorInfo?.error || "An unknown error occurred";
    errorContainer.appendChild(errorMessage);
    
    document.querySelector("#view").appendChild(errorContainer);
}

function renderJsonStr(jsonStr) {
    document.querySelector("#view").replaceChildren();

    let loader = newDataLoader();
    let result = loader.loadString(jsonStr);
    if (!result.success) {
        displayParseError(result);
        return;
    }
    renderJSON(loader);
}

async function renderJsonFile(file) {
    document.querySelector("#view").replaceChildren();

    let loader = newDataLoader();
    let result = await loader.loadFile(file);
    if (!result.success) {
        displayParseError(result);
        return;
    }
    renderJSON(loader);
}

async function renderJsonlFile(file) {
    document.querySelector("#view").replaceChildren();
    
    g_jsonlLoader = new JsonlDataLoader();
    let result = await g_jsonlLoader.loadFile(file);
    if (!result.success) {
        displayParseError(result);
        return;
    }
    
    // Show JSONL controls
    showJsonlControls();
    updateJsonlControls();
    renderCurrentJsonlLine();
}

function showJsonlControls() {
    document.querySelector("#jsonl-controls").style.display = "block";
}

function hideJsonlControls() {
    document.querySelector("#jsonl-controls").style.display = "none";
    g_jsonlLoader = null;
}

function updateJsonlControls() {
    if (!g_jsonlLoader) return;
    
    const totalLines = g_jsonlLoader.getTotalLines();
    const currentLine = g_jsonlLoader.getCurrentLine() + 1; // 1-indexed for display
    
    document.querySelector("#total-lines").textContent = `/ ${totalLines}`;
    document.querySelector("#line-input").value = currentLine;
    document.querySelector("#line-input").max = totalLines;
    
    // Update button states
    document.querySelector("#prev-line").disabled = currentLine <= 1;
    document.querySelector("#next-line").disabled = currentLine >= totalLines;
}

function renderCurrentJsonlLine() {
    if (!g_jsonlLoader) return;
    
    document.querySelector("#view").replaceChildren();
    
    // Create a temporary loader with the current line's data
    let loader = new WebDataLoader();
    loader.loadObject(g_jsonlLoader.getValue());
    renderJSON(loader);
}

function navigateToLine(lineNumber) {
    if (!g_jsonlLoader) return;
    
    const lineIndex = lineNumber - 1; // Convert to 0-indexed
    let result = g_jsonlLoader.loadLine(lineIndex);
    if (result.success) {
        updateJsonlControls();
        renderCurrentJsonlLine();
    } else {
        // Display error in a temporary alert
        let errorAlert = document.createElement("div");
        errorAlert.classList.add("alert", "alert-warning", "alert-dismissible", "fade", "show", "m-2");
        errorAlert.innerHTML = `
            <strong>Navigation Error:</strong> ${result.error}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector("#view").insertBefore(errorAlert, document.querySelector("#view").firstChild);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (errorAlert.parentNode) {
                errorAlert.parentNode.removeChild(errorAlert);
            }
        }, 3000);
        
        // Reset input to current line
        updateJsonlControls();
    }
}

let pasteArea = document.querySelector("#paste");
pasteArea.addEventListener("change", (ev) => {
    hideJsonlControls(); // Hide JSONL controls when using paste
    clearFileNameDisplay(); // Clear file name when using paste
    renderJsonStr(pasteArea.value);
});
if (pasteArea.value != "") {
    renderJsonStr(pasteArea.value);
}

let filePicker = document.querySelector("#filepicker");
filePicker.addEventListener("change", (ev) => {
    hideJsonlControls(); // Hide JSONL controls when using regular file picker
    if (filePicker.files[0]) {
        updateFileNameDisplay(filePicker.files[0].name);
        renderJsonFile(filePicker.files[0]);
    } else {
        clearFileNameDisplay();
    }
})

let jsonlPicker = document.querySelector("#jsonlpicker");
jsonlPicker.addEventListener("change", (ev) => {
    if (jsonlPicker.files[0]) {
        updateFileNameDisplay(jsonlPicker.files[0].name);
        renderJsonlFile(jsonlPicker.files[0]);
    } else {
        clearFileNameDisplay();
    }
})

// JSONL navigation controls
let prevButton = document.querySelector("#prev-line");
prevButton.addEventListener("click", (ev) => {
    if (g_jsonlLoader) {
        const currentLine = g_jsonlLoader.getCurrentLine() + 1;
        if (currentLine > 1) {
            navigateToLine(currentLine - 1);
        }
    }
});

let nextButton = document.querySelector("#next-line");
nextButton.addEventListener("click", (ev) => {
    if (g_jsonlLoader) {
        const currentLine = g_jsonlLoader.getCurrentLine() + 1;
        const totalLines = g_jsonlLoader.getTotalLines();
        if (currentLine < totalLines) {
            navigateToLine(currentLine + 1);
        }
    }
});

let lineInput = document.querySelector("#line-input");
lineInput.addEventListener("change", (ev) => {
    if (g_jsonlLoader) {
        const lineNumber = parseInt(lineInput.value);
        const totalLines = g_jsonlLoader.getTotalLines();
        if (lineNumber >= 1 && lineNumber <= totalLines) {
            navigateToLine(lineNumber);
        } else {
            // Reset to current line if invalid input
            updateJsonlControls();
        }
    }
});

lineInput.addEventListener("keypress", (ev) => {
    if (ev.key === "Enter") {
        ev.target.blur(); // Trigger change event
    }
});

// Expand All / Collapse All functionality
let expandAllButton = document.querySelector("#expand-all");
expandAllButton.addEventListener("click", async (ev) => {
    await expandAll();
});

let collapseAllButton = document.querySelector("#collapse-all");
collapseAllButton.addEventListener("click", (ev) => {
    collapseAll();
});

async function expandAll() {
    let foundCollapsed = true;
    
    // Keep expanding until no more collapsed items are found
    while (foundCollapsed) {
        foundCollapsed = false;
        const collapseButtons = document.querySelectorAll(".collapse-button");
        
        // Create an array of promises for all the expansions in this level
        const expansionPromises = [];
        
        collapseButtons.forEach(button => {
            const kvRoot = button.closest(".kv-root");
            const collapseWrapper = kvRoot.querySelector(".collapse");
            
            // Only expand if it's currently collapsed
            if (!collapseWrapper.classList.contains("show")) {
                foundCollapsed = true;
                
                // Create a promise that resolves when the collapse is fully shown
                const expansionPromise = new Promise((resolve) => {
                    const onShown = () => {
                        collapseWrapper.removeEventListener('shown.bs.collapse', onShown);
                        resolve();
                    };
                    collapseWrapper.addEventListener('shown.bs.collapse', onShown);
                    button.click();
                });
                
                expansionPromises.push(expansionPromise);
            }
        });
        
        // Wait for all expansions in this level to complete before moving to the next level
        if (expansionPromises.length > 0) {
            await Promise.all(expansionPromises);
        }
    }
}

function collapseAll() {
    const collapseButtons = document.querySelectorAll(".collapse-button");
    collapseButtons.forEach(button => {
        const kvRoot = button.closest(".kv-root");
        const collapseWrapper = kvRoot.querySelector(".collapse");
        
        // Skip the root level collapse button (it should stay expanded)
        // The root level button has display: none style applied
        const isRootLevel = button.style.display === "none";
        
        // Only collapse if it's currently expanded and not the root level
        if (collapseWrapper.classList.contains("show") && !isRootLevel) {
            button.click();
        }
    });
}

// Handle "open with" functionality from Tauri
async function handleOpenWithFile(filePath, mode) {
    try {
        console.log(`Opening file: ${filePath} in ${mode} mode`);

        // Use Tauri's fs API to read the file
        if (window.__TAURI__) {
            const { readTextFile } = await import('https://cdn.jsdelivr.net/npm/@tauri-apps/api@2/fs');
            const fileContent = await readTextFile(filePath);
            const fileName = filePath.split(/[\\/]/).pop(); // Extract filename from path
            
            // Update file name display
            updateFileNameDisplay(fileName);
            
            if (mode === 'jsonl') {
                // Create a temporary blob to simulate a file for JSONL processing
                const blob = new Blob([fileContent], { type: 'text/plain' });
                const file = new File([blob], fileName, { type: 'text/plain' });
                await renderJsonlFile(file);
            } else {
                // JSON mode (includes .json and .geojson)
                hideJsonlControls();
                renderJsonStr(fileContent);
            }
        }
    } catch (error) {
        console.error('Error opening file:', error);
        
        // Display error to user
        document.querySelector("#view").replaceChildren();
        displayParseError({
            type: 'File Open Error',
            error: `Failed to open file: ${error.message}`
        });
    }
}

if (typeof window !== 'undefined') {
    window.handleOpenWithFile = handleOpenWithFile;
}

let loader = new WebDataLoader();
loader.loadObject(welcome);
renderJSON(loader);

if (typeof window !== 'undefined' && typeof window.__JSONLIGHT_DRAIN_OPEN_WITH_QUEUE === 'function') {
    window.__JSONLIGHT_DRAIN_OPEN_WITH_QUEUE();
}

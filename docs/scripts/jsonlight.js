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
    rawString.innerText = kvRoot.loader.getValue();
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
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    async loadFile(file) {
        if (file.name.endsWith(".json") || file.name.endsWith(".geojson"))
            return this.loadString(await file.text());
        if (file.name.endsWith(".jsonl")) {
            let fileText = await file.text();
            let lines = fileText.split(/[\r\n]+/);
            try {
                this.value = lines.filter(line => line).map((line) => JSON.parse(line));
                return true;
            }
            catch (exception) {
                return false;
            }
        }
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
 *           Controls                *
 *************************************/

let g_platform = "web";
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

function displayParseError() {
    let errorMsg = document.createElement("div");
    errorMsg.classList.add("text-danger");
    errorMsg.innerText = "Syntax Error";
    document.querySelector("#view").appendChild(errorMsg);
}

function renderJsonStr(jsonStr) {
    document.querySelector("#view").replaceChildren();

    let loader = newDataLoader();
    let success = loader.loadString(jsonStr);
    if (!success) {
        displayParseError();
        return;
    }
    renderJSON(loader);
}

async function renderJsonFile(file) {
    document.querySelector("#view").replaceChildren();

    let loader = newDataLoader();
    let success = await loader.loadFile(file);
    if (!success) {
        displayParseError();
        return;
    }
    renderJSON(loader);
}

// let loader = new WebDataLoader();
// loader.loadObject(demo);
// renderJSON(loader);

let pasteArea = document.querySelector("#paste");
pasteArea.addEventListener("change", (ev) => {
    renderJsonStr(pasteArea.value);
});
if (pasteArea.value != "") {
    renderJsonStr(pasteArea.value);
}

let filePicker = document.querySelector("#filepicker");
filePicker.addEventListener("change", (ev) => {
    renderJsonFile(filePicker.files[0]);
    filePicker.value = "";
})
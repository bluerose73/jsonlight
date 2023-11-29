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
    "string": "This is a string value\nThis the second line",
    "number": 123.456,
    "list": ["elem1", "elem2"],
    "boolean": true,
    "null": null,
    "long-demo": long_demo,
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
    kvText.innerHTML = renderKey(key);
    value = loader.getValue()
    switch (typeof value) {
        case "string":
            renderString(kvRoot, value);
            break;
        case "number":
            renderNumber(kvRoot, value);
            break;
        case "boolean":
            renderBool(kvRoot, value);
            break;
        case "object":
            if (value == null) {
                renderNull(kvRoot, value);
            }
            else if (Array.isArray(value)) {
                renderArray(kvRoot, value);
            }
            else {
                renderObject(kvRoot, value);
            }
    }
    return kvRoot;
}

function newKV(loader) {
    let kvRoot = document.createElement("div");
    kvRoot.loader = loader;
    kvRoot.classList.add("kv-root", "d-flex", "flex-column");
    let kv = document.createElement("div");
    kv.classList.add("kv", "d-flex", "gap-2", "align-items-center", "mb-1");
    let kvText = document.createElement("div");
    kvText.classList.add("kv-text");
    kv.appendChild(kvText);
    kvRoot.appendChild(kv);
    return kvRoot;
}

function newToggleButton(text) {
    let toggleButton = document.createElement("button");
    toggleButton.classList.add("btn", "btn-light", "btn-sm", "pt-0", "pb-0");
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
    collapseButton.classList.add("collapseButton");
    kv.insertBefore(collapseButton, kv.firstChild);
    
    let collapseWrapper = document.createElement("div");
    collapseWrapper.classList.add("collapse");
    let childBlock = document.createElement("div");
    childBlock.classList.add("child-block", "d-flex", "gap-2");
    let indent = document.createElement("div");
    indent.classList.add("indent", "border-end", "pe-5", "flex-shrink-0");
    let childList = document.createElement("div");
    childList.classList.add("child-list", "d-flex", "flex-column");
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
        console.log("show event received");
        ev.stopPropagation();
        for (const childKV of kvRoot.loader.loadChild()) {
            childList.appendChild(
                renderKV(...childKV)
            )
        }
        collapseButton.innerHTML = "-";
    });
    collapseWrapper.addEventListener('hidden.bs.collapse', (ev) => {
        console.log("hide event received");
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
    return '<span class="text-primary">' + keystr + "</span>: ";
}

function addViewRaw(kvRoot) {
    let viewRawButton = newToggleButton("R");
    viewRawButton.classList.add("viewRawButton");
    
    let kv = kvRoot.querySelector(".kv");
    kv.insertBefore(viewRawButton, kv.firstChild);
}

function renderString(kvRoot, jobj) {
    addViewRaw(kvRoot);
    kvRoot.querySelector(".kv .kv-text").innerHTML += JSON.stringify(jobj);
}

function renderNumber(kvRoot, jobj) {
    kvRoot.querySelector(".kv .kv-text").innerHTML += JSON.stringify(jobj);
}

function renderBool(kvRoot, jobj) {
    kvRoot.querySelector(".kv .kv-text").innerHTML += JSON.stringify(jobj);
}

function renderNull(kvRoot, jobj) {
    kvRoot.querySelector(".kv .kv-text").innerHTML += JSON.stringify(jobj);
}

function renderArray(kvRoot, jobj) {
    kvRoot.querySelector(".kv .kv-text").innerHTML += "[...]";
    addCollapse(kvRoot, jobj);
}

function renderObject(kvRoot, jobj) {
    kvRoot.querySelector(".kv .kv-text").innerHTML += "{...}";
    addCollapse(kvRoot, jobj);
}

/*************************************
 *           Data Loader             *
 *************************************/

// base class for dataloaders
// A dataloader corresponds to an array or an object,
// and is responsible to load its children.
class DataLoader {
    constructor(value) {
        this.value = value;
    }

    getValue() {
        return this.value;
    }
    // Returns a list of (key, dataloader).
    loadChild() {}
}


class WebDataLoader extends DataLoader {
    constructor(value) {
        super(value);
    }

    loadChild() {
        if (this.value == null || typeof this.value != "object") return [];
        let ret = []
        if (Array.isArray(this.value)) {
            for (const [i, v] of this.value.entries()) {
                ret.push([i, new WebDataLoader(v)]);
            }
            return ret;
        }
        
        // Object
        for (const [k, v] of Object.entries(this.value)) {
            ret.push([k, new WebDataLoader(v)]);
        }
        return ret;
    }
}

class DesktopDataLoader extends DataLoader {

}


/*************************************
 *           Entry Point             *
 *************************************/

let rootJson = renderKV(null, new WebDataLoader(demo));
document.querySelector("#view").appendChild(rootJson);
let rootButton = rootJson.querySelector(".collapseButton");
rootButton.style.display = "none";
rootButton.click();
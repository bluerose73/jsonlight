let demo = {
    "string": "This is a string value\nThis the second line",
    "number": 123.456,
    "list": ["elem1", "elem2"],
    "boolean": true,
    "null": null
};

// JSON key-value pair -> HTML element
// for a key-value pair in an object, key is a string.
// for elements in a list, key is a number "index".
// for the root-level value, key is null.
function renderKV(key, value) {
    kvRoot = newKV();
    kvRoot.querySelector(".kv .kv-text").innerHTML = renderKey(key) + " : ";
    switch (typeof value) {
        case "string":
            console.log("string");
            renderString(kvRoot, value);
            break;
        case "number":
            console.log("number");
            renderNumber(kvRoot, value);
            break;
        case "boolean":
            console.log("boolean");
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
                renderDict(kvRoot, value);
            }
    }
}

function newKV() {
    let kvRoot = document.createElement("div");
    kvRoot.classList.add("kv-root", "d-flex", "flex-column", "gap-2");
    let kv = document.createElement("div");
    kv.classList.add("kv", "d-flex", "gap-2", "align-items-center");
    let kvText = document.createElement("div");
    kvText.classList.add("kv-text");
    kv.appendChild(kvText);
    kvRoot.appendChild(kv);
    return kvRoot;
}

function addCollapse(kvRoot) {
    let kv = kvRoot.querySelector(".kv");
    
    let collapseButton = document.createElement("button");
    collapseButton.classList.add("btn", "btn-light", "btn-sm");
    collapseButton.setAttribute("data-bs-toggle", "collapse");
    kv.insertBefore(collapseButton);
    
    let collapseWrapper = document.createElement("div");
    collapseWrapper.classList.add("collapse");
    let childBlock = document.createElement("div");
    childBlock.classList.add("child-block", "d-flex", "gap-2");
    let indent = document.createElement("div");
    indent.classList.add("indent", "border-end", "pe-5", "flex-shrink-0");
    let childList = document.createElement("div");
    childList.classList.add("child-list", "d-flex", "flex-column", "gap-2");
    childBlock.appendChild(indent);
    childBlock.appendChild(childList);
    collapseWrapper.appendChild(childBlock);
    kvRoot.appendChild(collapseWrapper);
    
    collapseButton.addEventListener("click", (ev) => {
        collapseWrapper = new bootstrap.Collapse(collapseWrapper);
    });
}

// for a key-value pair in an object, key is a string.
// for elements in a list, key is a number "index".
// for the root-level value, key is null.
function renderKey(key) {
    let keystr = "key error";
    if (key == null) keystr = "root";
    else if (typeof(key) == "number") {
        keystr = "[" + string(number) + "]";
    }
    else if (typeof(key) == "string") {
        keystr = JSON.stringify(key);
    }
    return keystr;
}

renderKV(null, demo);
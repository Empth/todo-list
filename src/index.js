import "./style.css";
import "./template.html";

function Card(inTitle, inDesc, inDueDate, inPriority, inNotes="", inChecklist=[]) {
    let _title = inTitle; // str
    let _desc = inDesc; // str
    let _dueDate = inDueDate; // Date
    let _priority = inPriority; // integer from 1-5 (1 is least important, 5 most
    let _notes = inNotes; // str
    let _checklist = inChecklist; // TODO implement me

    let complete = false;
    const id = crypto.randomUUID();
    let parentId = null; // uuid of parent

    const getCard = () => { return {title: _title, desc: _desc, due: _dueDate, 
                                    priority: _priority, notes: _notes, checklist: _checklist}; }; // TODO
    const getId = () => id;
    const getParentId = () => parentId;
    const setParentId = (newParentId) => { parentId = newParentId }; 
    
    function editCard(newTitle=_title, newDesc=_desc, newDueDate=_dueDate,
     newPriority=_priority, newNotes=_notes, newChecklist=_checklist) {
        _title=newTitle;
        _desc=newDesc;
        _dueDate=newDueDate;
        _priority=newPriority;
        _notes=newNotes;
        _checklist=newChecklist;
    }

    const toggleComplete = () => {complete = !complete};

    return { getCard, getId, editCard, toggleComplete, getParentId, setParentId };
}


function Collection() {
    // Abstract Collection factory which describes a collection of some Items.
    // These Items must support having uuid's for their identification/search (and must be named id).
    const collection = [];

    const addItem = (item) => {collection.push(item)};
    const removeItem = (uuid) => {
        for (let i = 0; i < collection.length; i++) {
            const item = collection[i]
        if (item.id === uuid) {
            collection.splice(i, 1);
            break;
        }
    }
    };
    const getItem = (uuid) => {
        for (const item of collection) {
            if (item.id === uuid) {
                return item;
            }
        }
        return null
    }; // get item with uuid ow returns null
    const retrieveAllItems = () => [...collection];

    return { addItem, removeItem, getItem, retrieveAllItems };
}

function Project(name) {
    // Named Collection of Cards
    let _name = name;
    const id = crypto.randomUUID();
    const base = Collection();
    const getName = () => _name;
    const editName = (newName) => { _name=newName };
    const getId = () => id;
    const addCard = base.addItem;
    const removeCard = base.removeItem;
    const getCard = base.getItem;
    const retrieveAllCards = base.retrieveAllItems;

    return { getName, editName, getId, addCard, removeCard, getCard, retrieveAllCards };
}

function Page() {
    // Named Collection of Projects
    const base = Collection();
    const addProject = base.addItem;
    const removeProject = base.removeItem;
    const getProject = base.getItem;
    const retrieveAllProjects = base.retrieveAllItems;

    return { addProject, removeProject, getProject, retrieveAllProjects };
}


function createProject(name) {
    // Adds new Project to global Page.
}


function DisplayController() {

}


let testProject = Project("default"); // TODO remove

function runner() {
    // misc

    document.getElementById("add-card").addEventListener("submit", e => {
        e.preventDefault();
        let form = document.querySelector("#add-card");
        let formData = new FormData(form);
        let fmObj = Object.fromEntries(formData); // {'title', 'desc', 'due', "priority", 
                                                    // (opt) "notes", (opt) "checklist",  "project" (object) <-- TODO}
        let newCard = Card(fmObj.title, fmObj.desc, fmObj.due,
            +fmObj.priority, fmObj.notes, fmObj.checklist);

        addCardToProject(newCard, testProject); // TODO refactor
        displayProject();
        e.target.reset();
    });

}

function addCardToProject(card, project) {
    // card and project are objects
    project.addCard(card);
    const projectId = project.getId();
    card.setParentId(projectId);
}

function displayProject() {
    // Display project on main tab
    resetDisplay();
    const container = document.querySelector(".container");
    for (const card of testProject.retrieveAllCards()) { // <-- TODO refactor
        container.appendChild(createTodoDiv(card.getCard()));
    }
}

function resetDisplay() {
    // reset cards in container DOM
    const container = document.querySelector(".container");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function createTodoDiv(card) {
    const priorityMap = {
        0: ["No Priority", "#000000"],
        1: ["Low Priority", "#32CD32"], 
        2: ["Slight Priority", "#9ACD32"], 
        3: ["Moderate Priority", "#fffdaf"], 
        4: ["Heavy Priority", "#FFAA33"], 
        5: ["Highest Priority", "#FF5733"]};
    const todoDiv = Object.assign(document.createElement("div"), {className: "card"});
    const titleDiv = Object.assign(document.createElement("p"), {
        className: "title", textContent: `${card.title}`
    });
    const dueDiv = Object.assign(document.createElement("p"), {
        className: "due", textContent: card.due === "" ? "" : `Due: ${card.due}`
    });
    const priorityAndColor = priorityMap[card.priority];
    if (card.priority != 0) {
        const priorityDiv = Object.assign(document.createElement("p"), {
            className: "priority", textContent: `${priorityAndColor[0]}`
        });
        todoDiv.style.backgroundImage = `linear-gradient(to bottom right, ${priorityAndColor[1]} 1%, white 90%)`;
    }
    todoDiv.append(titleDiv, dueDiv)
    return todoDiv;
}

runner();

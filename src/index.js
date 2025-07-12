import "./style.css";
import "./template.html";

function Card(inTitle, inDesc, inDueDate, inPriority, init={}) {
    // init: initializer object with initId, initDate fields.

    let _title = inTitle; // str
    let _desc = inDesc; // str
    let _dueDate = inDueDate; // Date
    let _priority = inPriority; // integer from 1-5 (1 is least important, 5 most

    let complete = false;
    const id = ("initId" in init) ? init.initId : crypto.randomUUID();

    const getCard = () => { return {title: _title, desc: _desc, due: _dueDate, priority: _priority}; };
    const getId = () => id;
    
    function editCard(newTitle=_title, newDesc=_desc, 
        newDueDate=_dueDate, newPriority=_priority) {
        _title=newTitle;
        _desc=newDesc;
        _dueDate=newDueDate;
        _priority=newPriority;
    }

    const toggleComplete = () => { complete = !complete };

    return { getCard, getId, editCard, toggleComplete };
}

function Collection() {
    // Abstract Collection factory which describes a collection of some Items.
    // These Items must support having uuid's for their identification/search 
    // (must be retrieved by getId getter).
    const collection = [];

    const addItem = (item) => {collection.push(item)};
    const removeItem = (uuid) => {
        for (let i = 0; i < collection.length; i++) {
            const item = collection[i]
        if (item.getId() === uuid) {
            collection.splice(i, 1);
            break;
        }
    }
    };
    const getItem = (uuid) => {
        for (const item of collection) {
            if (item.getId() === uuid) {
                return item;
            }
        }
        return null
    }; // get item with uuid ow returns null
    const retrieveAllItems = () => [...collection];

    return { addItem, removeItem, getItem, retrieveAllItems };
}

function Project(name, init={}) {
    // Named Collection of Cards
    // init: initializer object with initId, initDate fields.
    let _name = name;
    const id = ("initId" in init) ? init.initId : crypto.randomUUID();
    const storageRunner = Storage();
    const base = Collection();
    const getName = () => _name;
    const editName = (newName) => { _name=newName };
    const getId = () => id;
    const addCard = (card) => {
        storageRunner.addCardToProject(card.getId(), card.getCard(), id);
        base.addItem(card);
    };
    const removeCard = (cardId) => {
        storageRunner.removeCardfromProject(cardId, id);
        base.removeItem(id);
    };

    return { getName, editName, getId, addCard, removeCard, getCard: base.getItem, 
                retrieveAllCards: base.retrieveAllItems, addItem: base.addItem };
}

function Page() {
    // Named Collection of Projects
    const base = Collection();
    const storageRunner = Storage();
    const addProject = (project) => {
        storageRunner.addNewProject(project.getId(), project.getName())
        base.addItem(project);
    };
    const removeProject = (projectId) => {
        storageRunner.removeProject(projectId);
        base.removeItem(projectId);
    };

    return { addProject, removeProject, getProject: base.getItem, 
                retrieveAllProjects: base.retrieveAllItems, addItem: base.addItem };
}


function Storage() {
    // localStorage for global page Collection.
    // We represent storage = {project1id: "{name: project1name, card1id: {card1rawdata}, 
    // card2id: {card2rawdata} ...}", project2id: "{}",...}
    // and cardXrawdata = {title:, desc:, due:, priority: }
    const storage = localStorage;
    const addNewProject = (projectId, projectName) => {storage.setItem(projectId, JSON.stringify({"name": projectName}))};
    const removeProject = (projectId) => {storage.removeItem(projectId)};
    const addCardToProject = (cardId, cardRawObj, projectId) => {
        const projectCardListJson = JSON.parse(storage.getItem(projectId));
        projectCardListJson[cardId] = cardRawObj;
        storage.setItem(projectId, JSON.stringify(projectCardListJson));
    };
    const removeCardfromProject = (cardId, projectId) => {
        const projectCardListJson = JSON.parse(storage.getItem(projectId));
        delete projectCardListJson[cardId];
        storage.setItem(projectId, JSON.stringify(projectCardListJson));
    };

    return { addNewProject, removeProject, addCardToProject, removeCardfromProject };
}

function repopulateAndReturnPage() {
    // repopulates a page from localStorage and returns the page.
    const storage = localStorage;
    const page = Page();
    // vvv repopulates page
    for (let i = 0; i < storage.length; i++) {
        const projectId = storage.key(i);
        const projectJson = JSON.parse(storage.getItem(projectId));
        const project = Project(projectJson.name, {"initId": projectId });
        delete projectJson.name;
        Object.keys(projectJson).forEach(cardId => {
            const rawCard = projectJson[cardId];
            const card = Card(rawCard.title, rawCard.desc, 
                                rawCard.due, rawCard.priority, 
                                {"initId": cardId });
            project.addItem(card);
        });
        page.addItem(project)
    }
    return page;
}

function CurrentProjectId() {
    let curId = null;
    const getCurId = () => curId;
    const setCurId = (newId) => { curId = newId };
    return { getCurId, setCurId };
}

function numProjects(page) {
    return page.retrieveAllProjects().length;
}

function getNextProjectBesidesCurrent(page, curUuid) {
    // Gets a different project from page besides the current one with id curUuid
    // if none exist return null
    for (const project of page.retrieveAllProjects()) {
        if (project.getId() !== curUuid) {
            return project;
        }
    }
    return null;
}

// -------------------------- DOM functions ----------------------------------

function runner() {
    // Runs remaining logic
    const mainPage = repopulateAndReturnPage();
    const curProjectIdCallback = CurrentProjectId();
    if (numProjects(mainPage) == 0) { // default intialization of webpage when starting out
        const defaultProject = Project("default"); 
        const defaultCard = Card("I'm a Todo!", "", "", 0);
        curProjectIdCallback.setCurId(defaultProject.getId());
        mainPage.addProject(defaultProject);
        defaultProject.addCard(defaultCard);
    } else {
        curProjectIdCallback.setCurId(getNextProjectBesidesCurrent(mainPage, null).getId());  // hack
    }

    displayListOfProjects(mainPage, curProjectIdCallback);
    updateProjectDropdown(mainPage);

    document.getElementById("add-card").addEventListener("submit", e => {
        e.preventDefault();
        let form = document.querySelector("#add-card");
        let formData = new FormData(form);
        let fmObj = Object.fromEntries(formData); // {'title', 'desc', 'due', "priority", 
                                                    // (opt) "notes", (opt) "checklist",  "project" (object) <-- TODO}
        let newCard = Card(fmObj.title, fmObj.desc, fmObj.due, +fmObj.priority);
        const parentProject = mainPage.getProject(fmObj.project); // <-- project id
        parentProject.addCard(newCard);
        displayProject(parentProject);
        e.target.reset();
    });

    document.getElementById("add-project").addEventListener("submit", e => {
        e.preventDefault();
        let form = document.querySelector("#add-project");
        let formData = new FormData(form);
        let fmObj = Object.fromEntries(formData);
        const newProject = Project(fmObj.name);
        mainPage.addProject(newProject);
        displayListOfProjects(mainPage, curProjectIdCallback);
        updateProjectDropdown(mainPage);
        e.target.reset();
    });

}

function displayProject(project) {
    // Display project on main tab
    const container = document.querySelector(".container");
    resetDisplay(container);
    container.appendChild(Object.assign(document.createElement("p"), {textContent: `${project.getName()}`}));
    for (const card of project.retrieveAllCards()) {
        container.appendChild(createTodoDiv(card, project));
    }
}

function resetDisplay(domElt) {
    // reset display of domElt
    while (domElt.firstChild) {
        domElt.removeChild(domElt.firstChild);
    }
}

function createTodoDiv(cardFactory, parentProject) {
    // card as factory
    const card = cardFactory.getCard();
    const priorityMap = {
        0: ["No Priority", "#000000"],
        1: ["Low Priority", "#32CD32"], 
        2: ["Slight Priority", "#9ACD32"], 
        3: ["Moderate Priority", "#fffdaf"], 
        4: ["Heavy Priority", "#FFAA33"], 
        5: ["Highest Priority", "#FF5733"]};
    const todoDiv = Object.assign(document.createElement("div"), {className: "card"});
    todoDiv.setAttribute("data-carduuid", cardFactory.getId());

    const titleDiv = Object.assign(document.createElement("p"), {
        className: "title", textContent: `${card.title}`
    });
    const dueDiv = Object.assign(document.createElement("p"), {
        className: "due", textContent: card.due === "" ? "" : `Due: ${card.due}`
    });
    const descDiv = Object.assign(document.createElement("p"), {
        className: "card-desc", textContent: card.desc === "" ? "" : `${card.desc}`
    });
    const priorityAndColor = priorityMap[card.priority];
    if (card.priority != 0) {
        const priorityDiv = Object.assign(document.createElement("p"), {
            className: "priority", textContent: `${priorityAndColor[0]}`
        });
        todoDiv.style.backgroundImage = `linear-gradient(to bottom right, ${priorityAndColor[1]} 5%, white 90%)`;
        todoDiv.append(priorityDiv)
    }
    const deleteButton = Object.assign(document.createElement("button"), { className: "delete-card", textContent: "X"});
    deleteButton.addEventListener("click", e => {
        let parentCard = deleteButton.parentElement;
        let uuid = parentCard.dataset.carduuid;
        parentProject.removeCard(uuid);
        displayProject(parentProject);
    });

    todoDiv.append(deleteButton, titleDiv, descDiv, dueDiv)
    return todoDiv;
}

function displayListOfProjects(page, curProjectIdCallback) {
    const projectListDiv = document.querySelector(".project-tab > .project-list");
    resetDisplay(projectListDiv);
    if (curProjectIdCallback.getCurId() !== null) {
        const curId = curProjectIdCallback.getCurId();
        const curProject = page.getProject(curId);
        displayProject(curProject);
    }
    for (const project of page.retrieveAllProjects()) {
        const projectDividerDiv = Object.assign(document.createElement("div"), {className: "project-divider"});
        projectDividerDiv.setAttribute("data-uuid", project.getId());
        const projectButton = Object.assign(document.createElement("button"), 
        {className: "project-button", textContent: project.getName()});
        projectButton.addEventListener("click", e => {
            displayProject(project);
            const projectButtonArray = Array.prototype.slice.call(projectListDiv.children);
            curProjectIdCallback.setCurId(project.getId()); // <--- maybe antipattern
        })
        const deleteButton = Object.assign(document.createElement("button"), {className: "delete-project", textContent: "X"});
        deleteButton.addEventListener("click", e => {
            if (numProjects(page) > 1) {
                let thisProjectDividerDiv = deleteButton.parentElement;
                let uuid = thisProjectDividerDiv.dataset.uuid;
                if (uuid === curProjectIdCallback.getCurId()) {
                    const nextProjectFallback = getNextProjectBesidesCurrent(page, uuid);
                    curProjectIdCallback.setCurId(nextProjectFallback === null ? null : nextProjectFallback.getId());
                }
                page.removeProject(uuid);
                updateProjectDropdown(page);
                displayListOfProjects(page, curProjectIdCallback);
            }
        });
        projectDividerDiv.append(deleteButton, projectButton);
        projectListDiv.appendChild(projectDividerDiv);
    }
}

function updateProjectDropdown(page) {
    const projectDropdownSelect = document.querySelector("#project-field");
    resetDisplay(projectDropdownSelect);
    for (const project of page.retrieveAllProjects()) {
        const option = Object.assign(document.createElement("option"), {
            value: `${project.getId()}`, textContent: `${project.getName()}`
        });
        projectDropdownSelect.appendChild(option);
    }
}


runner();

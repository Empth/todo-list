function Card(title, desc, dueDate, priority, notes="", checklist=[]) {
    let _title = title; // str
    let _desc = desc; // str
    let _dueDate = dueDate; // Date
    let _priority = priority; // integer from 1-5 (1 is least important, 5 most
    let _notes = notes; // str
    let _checklist = checklist; // TODO implement me

    let complete = false;
    const id = crypto.randomUUID();
    let parentId = null; // uuid of parent

    const getCard = () => {}; // TODO
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
    const printCard = () => { console.log(`Title: ${_title}, Desc: ${_desc}, DueDate: ${_dueDate}, 
                            Priority: ${_priority}, Notes: ${_notes}, Checklist: ${_checklist}`) };

    return { getCard, getId, editCard, toggleComplete, printCard, getParentId, setParentId };
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


let card1 = Card("I'm a card", "none", "6/13", "5");
let card2 = Card("I'm also a card", "none", "2/13", "1");

let testProject = Project("default");
testProjectId = testProject.getId();

card1.setParentId(testProjectId);
card2.setParentId(testProjectId);

testProject.addCard(card1);
testProject.addCard(card2);

let globalPage = Page();
globalPage.addProject(testProject)

let allCards = testProject.retrieveAllCards();
allCards[0].printCard();
allCards[1].printCard();

function runner() {
    // misc

    document.getElementById("add-card").addEventListener("submit", e => {
        e.preventDefault();
        form = document.querySelector("#add-card");
        let formData = new FormData(form);
        let formObject = Object.fromEntries(formData); // {'title', 'desc', 'dueDate', "priority", 
                                                    // (opt) "notes", (opt) "checklist",  "project" (object)}
        let newCard = Card(...formObject.slice(0, 6)) // FIXME Will this work?????

        addCardToProject(newCard, formObject.project);
        displayProject();
        e.target.reset();
    });

}

function addCardToProject(card, project) {
    // card and project are objects
    project.addCard(card);
    projectId = project.getId();
    card.setParentId(projectId);
}
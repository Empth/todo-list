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


function Deck() {
    // Abstract Deck factory which describes a collection of some Items.
    // These Items must support having uuid's for their identification/search (and must be named id).
    const deck = [];

    const addItem = (item) => {deck.push(item)};
    const removeItem = (uuid) => {
        for (let i = 0; i < deck.length; i++) {
            const item = deck[i]
        if (item.id === uuid) {
            deck.splice(i, 1);
            break;
        }
    }
    };
    const getItem = (uuid) => {
        for (const item of deck) {
            if (item.id === uuid) {
                return item;
            }
        }
        return null
    }; // get item with uuid ow returns null
    const retrieveAllItems = () => [...deck];

    return { addItem, removeItem, getItem, retrieveAllItems };
}

function Project(name) {
    // Named Deck of Cards
    let _name = name;
    const id = crypto.randomUUID();
    const base = Deck();
    const getName = () => _name;
    const editName = (newName) => { _name=newName };
    const getId = () => id;
    const addCard = base.addItem;
    const removeCard = base.removeItem;
    const getCard = base.getItem;
    const retrieveAllCards = base.retrieveAllItems;

    return { getName, editName, getId, addCard, removeCard, getCard, retrieveAllCards };
}


let card1 = Card("I'm a card", "none", "6/13", "5");
let card2 = Card("I'm also a card", "none", "2/13", "1");

let testProject = Project("default");
testProject.addCard(card1);
testProject.addCard(card2);
let allCards = testProject.retrieveAllCards();
allCards[0].printCard();
allCards[1].printCard();

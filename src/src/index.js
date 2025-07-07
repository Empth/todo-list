function Card(title, desc, dueDate, priority, parentId, notes="", checklist=[], parentId) {
    let _title = title; // str
    let _desc = desc; // str
    let _dueDate = dueDate; // Date
    let _priority = priority; // integer from 1-5 (1 is least important, 5 most
    let _parentId = parentId; // uuid of parent Project
    let _notes = notes; // str
    let _checklist = checklist; // TODO implement me

    let complete = false;
    const id = crypto.randomUUID();

    const getCard = () => {}; // TODO
    const getId = () => id;
    
    function editCard(newTitle=_title, newDesc=_desc, newDueDate=_dueDate,
     newPriority=_priority, newParentId=_parentId, newNotes=_notes, newChecklist=_checklist) {
        _title=newTitle;
        _desc=newDesc;
        _dueDate=newDueDate;
        _priority=newPriority;
        _parentId=newParentId;
        _notes=newNotes;
        _checklist=newChecklist;
    }

    const toggleComplete = () => {complete = !complete};
    const printCard = () => { console.log(card) };

    return { getCard, getId, editCard, toggleComplete, printCard };
}

function Deck(name) {
    // named collection of Cards
    const deck = [];

    let _name = name;
    const id = crypto.randomUUID();

    const addCard = (card) => {deck.push(card)};
    const removeCard = (uuid) => {
        for (let i = 0; i < deck.length; i++) {
            const card = deck[i]
        if (card.id === uuid) {
            deck.splice(i, 1);
            break;
        }
    }
    };
    const getCard = (uuid) => {
        for (const card of deck) {
            if (card.id === uuid) {
                return card
            }
        }
        return null
    }; // get card with uuid ow returns null

    const printDeck = () => { deck.forEach(card => {card.printCard()}) };
    const getName = () => _name;
    const editName = (newName) => { _name=newName };
    const getId = () => id;

    return { addCard, removeCard, getCard, printDeck, getName, editName, getId };
}

// TODO make Deck into abstract Collection function, then compose specifics for Project (collection of Card) and
// the whole TODO list (collection of Projects)
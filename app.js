const data = [];

// Elements (safe)
const thead = document.getElementById("table-head");
const tbody = document.getElementById("table-body");

const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');

let editIndex = null;

// Unique ID generator
const generateId = () => Date.now().toString() + Math.floor(Math.random() * 10000);

// Header
const loadHeader = () => `
    <h1>Expense Manager</h1>
    <hr>
`;

// Navigation
const getNavLinks = () => `
    <a href="home.html">home</a>
    <a href="filters.html">filters</a>
    <a href="graphs.html">graphs</a>
    <a href="about.html">about</a>
`;

// UI INJECTION
const nav = document.getElementById("nav");
if (nav) nav.innerHTML = getNavLinks();

const header = document.getElementById("myHeader");
if (header) header.innerHTML = loadHeader();

// Validation
const isDescriptionValid = (category, description) =>
    !(category === "other" && description === "");

const isDateValid = dateStr => {
    const today = new Date().toLocaleDateString('en-CA');
    return dateStr <= today;
};

// Load from LocalStorage
const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('data');
    if (saved) {
        const parsed = JSON.parse(saved);

        // הוספת ID לפריטים ישנים
        parsed.forEach(item => {
            if (!item.id) item.id = generateId();
        });

        data.push(...parsed);
        saveToLocalStorage();
    }

    if (thead && tbody) renderTable();
};

// Save to LocalStorage
const saveToLocalStorage = () =>
    localStorage.setItem('data', JSON.stringify(data));


// DELETE
const deleteItem = id => {
    if (!confirm(`Are you sure you want to delete item ID: ${id}?`)) return;

    const index = data.findIndex(item => item.id === id);
    if (index === -1) return;

    data.splice(index, 1);
    saveToLocalStorage();

    if (thead && tbody) renderTable();
};


// EDIT
function editItem(id) {
    if (!confirm(`Are you sure you want to edit item ID: ${id}?`)) return;

    const index = data.findIndex(item => item.id === id);
    if (index === -1) return;

    const item = data[index];

    if (!categoryInput || !descriptionInput || !amountInput || !dateInput) return;

    categoryInput.value = item.category;
    descriptionInput.value = item.description;
    amountInput.value = item.amount;
    dateInput.value = item.date;

    editIndex = index;
}


// ADD / UPDATE
function getUserInputs(event) {
    event.preventDefault();

    const form = document.getElementById("myForm");
    if (!form) return;

    if (!categoryInput || !descriptionInput || !amountInput || !dateInput) return;

    if (!isDescriptionValid(categoryInput.value, descriptionInput.value.trim())) {
        alert("Please enter a description for the 'Other' expense.");
        return;
    }

    if (!isDateValid(dateInput.value)) {
        alert("Do not enter a future date");
        return;
    }

    // UPDATE
    if (editIndex !== null) {
        if (!confirm("Are you sure you want to update this item?")) return;

        data[editIndex] = {
            ...data[editIndex],
            date: dateInput.value,
            description: descriptionInput.value.trim(),
            amount: +amountInput.value,
            category: categoryInput.value
        };

        editIndex = null;
    }

    // ADD
    else {
        data.push({
            id: generateId(),
            date: dateInput.value,
            description: descriptionInput.value.trim(),
            amount: +amountInput.value,
            category: categoryInput.value
        });
    }

    saveToLocalStorage();

    if (thead && tbody) renderTable();

    form.reset();
    categoryInput.focus();
}


// TABLE RENDER FUNCTIONS
const renderTableHeader = () => {
    if (!thead) return;
    if (thead.innerHTML.trim() !== "") return;

    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Edit</th>
            <th>Delete</th>
        </tr>
    `;
};

const renderTableRows = () => {
    if (!tbody) return;

    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.description}</td>
            <td>${item.amount}</td>
            <td>${item.category}</td>
            <td><button onclick="editItem('${item.id}')">Edit</button></td>
            <td><button onclick="deleteItem('${item.id}')">Delete</button></td>
        </tr>
    `).join("");
};

const renderTable = () => {
    if (!thead || !tbody) return;

    if (data.length === 0) {
        thead.innerHTML = "";
        tbody.innerHTML = "";
        return;
    }

    renderTableHeader();
    renderTableRows();
};


// INITIAL LOAD
loadFromLocalStorage();
const data = [];
const thead = document.getElementById("table-head");
const tbody = document.getElementById("table-body");

// Inputs (global)
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
        data.push(...JSON.parse(saved));
    }
    renderTable();
};

// Save to LocalStorage
const saveToLocalStorage = () =>
    localStorage.setItem('data', JSON.stringify(data));


// ----------------------
// DELETE
// ----------------------
const deleteItem = id => {
    if (!confirm(`Are you sure you want to delete item ID: ${id}?`)) return;

    const index = data.findIndex(item => item.id === id);
    if (index === -1) return;

    data.splice(index, 1);
    saveToLocalStorage();
    renderTable();
};


// ----------------------
// EDIT
// ----------------------
const editItem = id => {
    if (!confirm(`Are you sure you want to edit item ID: ${id}?`)) return;

    const index = data.findIndex(item => item.id === id);
    if (index === -1) return;

    const item = data[index];

    categoryInput.value = item.category;
    descriptionInput.value = item.description;
    amountInput.value = item.amount;
    dateInput.value = item.date;

    editIndex = index;
};


// ----------------------
// UPDATE (SAVE EDIT)
// ----------------------
const updateItem = () => {
    data[editIndex] = {
        ...data[editIndex], // keep ID
        date: dateInput.value,
        description: descriptionInput.value.trim(),
        amount: +amountInput.value,
        category: categoryInput.value
    };

    saveToLocalStorage();
    renderTable();

    document.getElementById("myForm").reset();
    editIndex = null;
};


// ----------------------
// TABLE RENDER FUNCTIONS
// ----------------------
const renderTableHeader = () => {
    if (thead.innerHTML.trim() !== "") return;

    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th></th>
            <th></th>
        </tr>
    `;
};

const renderTableRows = () => {
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
    if (data.length === 0) {
        thead.innerHTML = "";
        tbody.innerHTML = "";
        return;
    }

    renderTableHeader();
    renderTableRows();
};


// ----------------------
// FORM HANDLING
// ----------------------
document.getElementById("myForm").addEventListener("submit", event => {
    event.preventDefault();

    if (editIndex === null) {
        // Add new item
        if (!isDescriptionValid(categoryInput.value, descriptionInput.value.trim())) {
            alert("Please enter a description for the 'Other' expense.");
            return;
        }

        if (!isDateValid(dateInput.value)) {
            alert("Do not enter a future date");
            return;
        }

        data.push({
            id: generateId(),
            date: dateInput.value,
            description: descriptionInput.value.trim(),
            amount: +amountInput.value,
            category: categoryInput.value
        });

        saveToLocalStorage();
        renderTable();
        document.getElementById("myForm").reset();
    } else {
        // Update existing item
        updateItem();
    }
});


// ----------------------
// UI INJECTION (exactly like you wanted)
// ----------------------
const nav = document.getElementById("nav");
nav.innerHTML = getNavLinks();

const header = document.getElementById("myHeader");
header.innerHTML = loadHeader();



// ----------------------
// INITIAL LOAD
// ----------------------
loadFromLocalStorage();
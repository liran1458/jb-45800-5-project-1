const data = [];

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
// ---------------- FILTER PAGE ----------------

// DOM elements for filters
const filterThead = document.getElementById("filter-table-head");
const filterTbody = document.getElementById("filter-table-body");

const filterYear = document.getElementById("filter-year");
const filterMonth = document.getElementById("filter-month");
const filterDay = document.getElementById("filter-day");
const filterMax = document.getElementById("filter-max");
const applyFiltersBtn = document.getElementById("apply-filters");
const filterSummary = document.getElementById("filter-summary");

const getUnique = arr => [...new Set(arr)];


// Populate years
const populateYears = () => {
    if (!filterYear) return;

    const years = getUnique(
        data.map(item => item.date.slice(0, 4))
    );

    filterYear.innerHTML += years
        .map(y => `<option value="${y}">${y}</option>`)
        .join("");
};


// Populate months based on selected year
const populateMonths = () => {
    if (!filterMonth) return;

    const year = filterYear.value;

    filterMonth.innerHTML = `<option value="">All</option>`;
    filterDay.innerHTML = `<option value="">All</option>`;

    if (!year) return;

    const months = getUnique(
        data
            .filter(item => item.date.startsWith(year))
            .map(item => item.date.slice(5, 7))
    );

    filterMonth.innerHTML += months
        .map(m => `<option value="${m}">${m}</option>`)
        .join("");
};


// Populate days based on selected year + month
const populateDays = () => {
    if (!filterDay) return;

    const year = filterYear.value;
    const month = filterMonth.value;

    filterDay.innerHTML = `<option value="">All</option>`;

    if (!year || !month) return;

    const days = getUnique(
        data
            .filter(item => item.date.startsWith(`${year}-${month}`))
            .map(item => item.date.slice(8, 10))
    );

    filterDay.innerHTML += days
        .map(d => `<option value="${d}">${d}</option>`)
        .join("");
};


// Apply filters
const applyFilters = () => {
    if (!filterThead || !filterTbody) return;

    const year = filterYear.value;
    const month = filterMonth.value;
    const day = filterDay.value;
    const maxAmount = filterMax.value;

    let filtered = [...data];

    if (year) filtered = filtered.filter(item => item.date.startsWith(year));
    if (month) filtered = filtered.filter(item => item.date.slice(5, 7) === month);
    if (day) filtered = filtered.filter(item => item.date.slice(8, 10) === day);
    if (maxAmount) filtered = filtered.filter(item => item.amount <= +maxAmount);

    // Summary above table
    if (filterSummary) {
        filterSummary.innerHTML = `
            Filters applied:
            Year: ${year || "All"} |
            Month: ${month || "All"} |
            Day: ${day || "All"} |
            Max Amount: ${maxAmount || "No limit"}
        `;
    }

    // Render table
    renderFilterTable(filtered);

    // Reset inputs
    filterYear.value = "";
    filterMonth.value = "";
    filterDay.value = "";
    filterMax.value = "";
};


// Render table for filters page
const renderFilterTable = list => {
    if (!filterThead || !filterTbody) return;

    filterThead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
        </tr>
    `;

    filterTbody.innerHTML = list
        .map(item => `
            <tr>
                <td>${item.date}</td>
                <td>${item.description}</td>
                <td>${item.amount}</td>
                <td>${item.category}</td>
            </tr>
        `)
        .join("");
};


// Event listeners
if (filterYear) {
    populateYears();
    filterYear.addEventListener("change", populateMonths);
    filterMonth.addEventListener("change", populateDays);
}

if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters);
}

// ---------------- GRAPHS PAGE ----------------

// DOM elements for graphs page
const pieCanvas = document.getElementById("pieChart");
const barCanvas = document.getElementById("barChart");

const downloadPDF = document.getElementById("download-pdf");
const downloadCSV = document.getElementById("download-csv");


// PIE CHART DATA (dynamic categories)
const getPieData = () => {
    const categories = [...new Set(data.map(item => item.category))];

    const values = categories.map(cat =>
        data
            .filter(item => item.category === cat)
            .reduce((sum, item) => sum + item.amount, 0)
    );

    return { categories, values };
};


// BAR CHART DATA (dynamic months)
const getBarData = () => {
    const months = [...new Set(data.map(item => item.date.slice(0, 7)))];

    const values = months.map(month =>
        data
            .filter(item => item.date.startsWith(month))
            .reduce((sum, item) => sum + item.amount, 0)
    );

    return { months, values };
};


// RENDER PIE CHART
const renderPieChart = () => {
    if (!pieCanvas) return;

    const { categories, values } = getPieData();

    new Chart(pieCanvas, {
        type: "pie",
        data: {
            labels: categories,
            datasets: [{
                data: values
            }]
        }
    });
};


// RENDER BAR CHART
const renderBarChart = () => {
    if (!barCanvas) return;

    const { months, values } = getBarData();

    new Chart(barCanvas, {
        type: "bar",
        data: {
            labels: months,
            datasets: [{
                label: "Expenses per Month",
                data: values
            }]
        }
    });
};


// GENERATE PDF
const generatePDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Expenses Report", 10, 10);

    data.forEach((item, i) => {
        doc.text(
            `${item.date} | ${item.category} | ${item.description} | ${item.amount}`,
            10,
            20 + i * 10
        );
    });

    doc.save("expenses.pdf");
};


// GENERATE CSV
const generateCSV = () => {
    const header = "Date,Category,Description,Amount\n";

    const rows = data
        .map(item => `${item.date},${item.category},${item.description},${item.amount}`)
        .join("\n");

    const csv = header + rows;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
};


// EVENT LISTENERS
if (pieCanvas) renderPieChart();
if (barCanvas) renderBarChart();

if (downloadPDF) downloadPDF.addEventListener("click", generatePDF);
if (downloadCSV) downloadCSV.addEventListener("click", generateCSV);
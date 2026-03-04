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

const loadHeader = () => `
    <header class="bg-white text-gray-900 text-3xl font-bold text-center py-6 shadow">
        Expense Manager
    </header>
`;

const getNavLinks = () => `
    <nav class="bg-blue-800 text-white py-4 flex justify-center gap-10 text-xl font-medium shadow">
        <a href="home.html" class="hover:text-blue-300 transition">Home</a>
        <a href="filters.html" class="hover:text-blue-300 transition">Filters</a>
        <a href="graphs.html" class="hover:text-blue-300 transition">Graphs</a>
        <a href="about.html" class="hover:text-blue-300 transition">About</a>
    </nav>
`;

// UI INJECTION
const nav = document.getElementById("nav");
if (nav) nav.outerHTML = getNavLinks();

const header = document.getElementById("myHeader");
if (header) header.outerHTML = loadHeader();

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
    Swal.fire({
        title: "Delete Item?",
        text: `Are you sure you want to delete item ID: ${id}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Delete"
    }).then(result => {
        if (!result.isConfirmed) return;

        const index = data.findIndex(item => item.id === id);
        if (index === -1) return;

        data.splice(index, 1);
        saveToLocalStorage();

        if (thead && tbody) renderTable();

        Swal.fire("Deleted!", "The item has been removed.", "success");
    });
};


// EDIT
function editItem(id) {
    Swal.fire({
        title: "Edit Item?",
        text: `Are you sure you want to edit item ID: ${id}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#facc15",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Edit"
    }).then(result => {
        if (!result.isConfirmed) return;

        const index = data.findIndex(item => item.id === id);
        if (index === -1) return;

        const item = data[index];

        categoryInput.value = item.category;
        descriptionInput.value = item.description;
        amountInput.value = item.amount;
        dateInput.value = item.date;

        editIndex = index;
    });
}


// ADD / UPDATE
function getUserInputs(event) {
    event.preventDefault();

    const form = document.getElementById("myForm");
    if (!form) return;

    if (!isDescriptionValid(categoryInput.value, descriptionInput.value.trim())) {
        Swal.fire("Missing Description", "Please enter a description for the 'Other' expense.", "error");
        return;
    }

    if (!isDateValid(dateInput.value)) {
        Swal.fire("Invalid Date", "Do not enter a future date.", "error");
        return;
    }

    // UPDATE
    if (editIndex !== null) {
        Swal.fire({
            title: "Update Item?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Update"
        }).then(result => {
            if (!result.isConfirmed) return;

            data[editIndex] = {
                ...data[editIndex],
                date: dateInput.value,
                description: descriptionInput.value.trim(),
                amount: +amountInput.value,
                category: categoryInput.value
            };

            editIndex = null;
            saveToLocalStorage();
            renderTable();
            form.reset();
            categoryInput.focus();

            Swal.fire("Updated!", "The item has been updated.", "success");
        });

        return;
    }

    // ADD
    data.push({
        id: generateId(),
        date: dateInput.value,
        description: descriptionInput.value.trim(),
        amount: +amountInput.value,
        category: categoryInput.value
    });

    saveToLocalStorage();
    renderTable();

    form.reset();
    categoryInput.focus();

    Swal.fire("Saved!", "The expense has been added.", "success");
}


// TABLE RENDER FUNCTIONS
const renderTableHeader = () => {
    if (!thead) return;

    thead.innerHTML = `
        <tr class="bg-gray-200 text-gray-900">
            <th class="border px-4 py-2">Date</th>
            <th class="border px-4 py-2">Description</th>
            <th class="border px-4 py-2">Amount</th>
            <th class="border px-4 py-2">Category</th>
            <th class="border px-4 py-2"></th>
            <th class="border px-4 py-2"></th>
        </tr>
    `;
};

const renderTableRows = () => {
    if (!tbody) return;

    tbody.innerHTML = data.map(item => `
        <tr class="border-b hover:bg-gray-50">
            <td class="border px-4 py-2">${item.date}</td>
            <td class="border px-4 py-2">${item.description}</td>
            <td class="border px-4 py-2">${item.amount}</td>
            <td class="border px-4 py-2">${item.category}</td>

            <td class="border px-4 py-2">
                <button onclick="editItem('${item.id}')"
                    class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition">
                    Edit
                </button>
            </td>

            <td class="border px-4 py-2">
                <button onclick="deleteItem('${item.id}')"
                    class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
};

const renderTable = () => {
    if (!thead || !tbody) return;

    if (data.length === 0) {
        thead.innerHTML = "";
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-gray-400 py-6">
                    No expenses yet. Add your first one!
                </td>
            </tr>
        `;
        return;
    }

    renderTableHeader();
    renderTableRows();
};


// INITIAL LOAD
loadFromLocalStorage();

// ---------------- FILTER PAGE ----------------

// elements for filters
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
            <div class="bg-gray-100 p-3 rounded border text-gray-700">
                <span class="font-semibold">Filters applied:</span><br>
                Year: ${year || "All"} |
                Month: ${month || "All"} |
                Day: ${day || "All"} |
                Max Amount: ${maxAmount || "No limit"}
            </div>
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
        <tr class="bg-gray-200 text-gray-900">
            <th class="border px-4 py-2">Date</th>
            <th class="border px-4 py-2">Description</th>
            <th class="border px-4 py-2">Amount</th>
            <th class="border px-4 py-2">Category</th>
        </tr>
    `;

    filterTbody.innerHTML = list
        .map(item => `
            <tr class="border-b hover:bg-gray-50">
                <td class="border px-4 py-2">${item.date}</td>
                <td class="border px-4 py-2">${item.description}</td>
                <td class="border px-4 py-2">${item.amount}</td>
                <td class="border px-4 py-2">${item.category}</td>
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

    doc.setFontSize(18);
    doc.text("Expenses Report", 10, 10);

    doc.setFontSize(12);

    data.forEach((item, i) => {
        doc.text(
            `${item.date} | ${item.category} | ${item.description} | ${item.amount}`,
            10,
            20 + i * 8
        );
    });

    doc.save("expenses.pdf");

    Swal.fire("PDF Ready", "Your PDF report has been downloaded.", "success");
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

    Swal.fire("CSV Ready", "Your CSV file has been downloaded.", "success");
};


// EVENT LISTENERS
if (pieCanvas) renderPieChart();
if (barCanvas) renderBarChart();

if (downloadPDF) downloadPDF.addEventListener("click", generatePDF);
if (downloadCSV) downloadCSV.addEventListener("click", generateCSV);
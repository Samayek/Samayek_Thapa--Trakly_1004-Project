import { storage } from "./storage.js";

const CATEGORY_OPTIONS = {
    income: ["Salary", "Allowance", "Bonus", "Freelance", "Investment", "Other"],
    expense: ["Bills", "Food", "Entertainment", "Education", "Transport", "Apparel", "Household", "Other"]
};

const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer"];
const TYPE_OPTIONS = ["expense", "income"];

export function renderFinance() {
    return `
        <div class="container finance-shell">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4 finance-head-row">
                <div>
                    <h2 class="mb-1">Finance Tracker</h2>
                    <p class="text-muted mb-0">Track your income, expenses, and monthly budget</p>
                </div>
                <button class="btn btn-add-action" id="addTransactionBtn" type="button">
                    <i class="bi bi-plus-lg me-1"></i>Add Transaction
                </button>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-lg-4">
                    <div class="card finance-summary-card finance-summary-income p-4 h-100">
                        <div class="finance-summary-icon"><i class="bi bi-arrow-down-circle"></i></div>
                        <h6 class="finance-summary-title">Total Income</h6>
                        <h3 id="totalIncome" class="finance-summary-value">&pound;0.00</h3>
                        <small id="incomeMeta" class="text-muted">All income</small>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card finance-summary-card finance-summary-expense p-4 h-100">
                        <div class="finance-summary-icon"><i class="bi bi-arrow-up-circle"></i></div>
                        <h6 class="finance-summary-title">Total Expenses</h6>
                        <h3 id="totalExpense" class="finance-summary-value">&pound;0.00</h3>
                        <small id="expenseMeta" class="text-muted">All outflow</small>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card finance-summary-card finance-summary-balance p-4 h-100">
                        <div class="finance-summary-icon"><i class="bi bi-wallet2"></i></div>
                        <h6 class="finance-summary-title">Net Balance</h6>
                        <h3 id="netBalance" class="finance-summary-value">&pound;0.00</h3>
                        <small id="netMeta" class="text-muted">Balance status</small>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-lg-6">
                    <div class="card finance-panel h-100">
                        <div class="finance-panel-head">
                            <h5 class="mb-0"><i class="bi bi-speedometer2 me-2"></i>Budget Progress</h5>
                        </div>
                        <div class="finance-panel-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <small class="text-muted d-block">Monthly Budget</small>
                                    <h3 class="mb-0" id="monthlyBudgetValue">&pound;0.00</h3>
                                </div>
                                <button class="btn btn-sm btn-outline-secondary" id="openBudgetModalBtn" type="button">
                                    <i class="bi bi-pencil me-1"></i>Edit Budget
                                </button>
                            </div>

                            <div class="progress mb-2 finance-budget-progress">
                                <div class="progress-bar" id="budgetProgressBar" style="width: 0%"></div>
                            </div>

                            <div class="d-flex justify-content-between text-muted mb-2">
                                <span id="monthlySpentValue">&pound;0.00</span>
                                <span id="budgetPercentLabel">0.0%</span>
                                <span id="monthlyRemainingValue">&pound;0.00 left</span>
                            </div>

                            <div id="budgetStatusBadgeWrap">
                                <span class="finance-budget-badge" id="budgetStatusBadge">Set a monthly budget to track usage.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-6">
                    <div class="card finance-panel h-100">
                        <div class="finance-panel-head">
                            <h5 class="mb-0"><i class="bi bi-tags me-2"></i>Top Categories</h5>
                        </div>
                        <div class="finance-panel-body finance-top-categories-scroll" id="topCategoriesList">
                            <p class="text-muted mb-0">No data yet</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card finance-panel mb-4">
                <div class="finance-panel-head">
                    <h5 class="mb-0"><i class="bi bi-funnel me-2"></i>Filters</h5>
                </div>
                <div class="finance-panel-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Month</label>
                            <input type="month" class="form-control" id="filterMonth">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Category</label>
                            <select class="form-control" id="filterCategory">
                                <option value="all">All categories</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card finance-transactions-card">
                <div class="finance-transactions-head">
                    <h5 class="mb-0"><i class="bi bi-receipt me-2"></i>Transactions</h5>
                    <div class="finance-transactions-actions">
                        <span class="finance-record-pill" id="transactionRecordCount">0 records</span>
                        <button class="btn btn-add-action btn-add-action-sm" id="addTransactionInlineBtn" type="button">
                            <i class="bi bi-plus-lg me-1"></i>Add Transaction
                        </button>
                    </div>
                </div>

                <div class="table-responsive finance-transactions-scroll">
                    <table class="table finance-table mb-0">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Method</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactionTable">
                            <tr>
                                <td colspan="7" class="text-center text-muted">No transactions yet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <dialog id="transactionModal" class="finance-modal">
                <div class="modal-header">
                    <h2 id="transactionModalTitle">Add Transaction</h2>
                    <button type="button" id="closeTransactionModal">&times;</button>
                </div>

                <form id="transactionForm">
                    <input type="hidden" id="transId">
                    <div class="finance-form-grid">
                        <div class="field-group">
                            <label for="transDate" class="form-label">DATE <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" id="transDate" required>
                        </div>
                        <div class="field-group">
                            <label for="transType" class="form-label">TYPE <span class="text-danger">*</span></label>
                            <select class="form-control" id="transType" required>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div class="field-group finance-col-span-2">
                            <label for="transDesc" class="form-label">DESCRIPTION</label>
                            <input type="text" class="form-control" id="transDesc" placeholder="e.g. Monthly salary">
                        </div>
                        <div class="field-group">
                            <label for="transAmount" class="form-label">AMOUNT (&pound;) <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" id="transAmount" min="0.01" step="0.01" placeholder="0.00" required>
                        </div>
                        <div class="field-group">
                            <label for="transCategory" class="form-label">CATEGORY</label>
                            <select class="form-control" id="transCategory" required></select>
                        </div>
                        <div class="field-group finance-col-span-2">
                            <label for="transMethod" class="form-label">PAYMENT METHOD</label>
                            <select class="form-control" id="transMethod" required>
                                ${PAYMENT_METHODS.map((method) => `<option value="${method.toLowerCase()}">${method}</option>`).join("")}
                            </select>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" id="cancelTransactionBtn" class="btn-cancel">Cancel</button>
                        <button type="submit" class="saveTaskEventBtn" id="saveTransactionBtnLabel">
                            <i class="bi bi-check-lg me-1"></i>Save Transaction
                        </button>
                    </div>
                </form>
            </dialog>

            <dialog id="budgetModal" class="finance-modal">
                <div class="modal-header">
                    <h2 id="budgetModalTitle">Edit Budget</h2>
                    <button type="button" id="closeBudgetModal">&times;</button>
                </div>
                <form id="budgetForm">
                    <div class="field-group">
                        <label for="budgetModalInput" class="form-label">Monthly Budget (&pound;)</label>
                        <input
                            type="number"
                            id="budgetModalInput"
                            class="form-control"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            required
                        >
                    </div>

                    <div class="modal-footer">
                        <button type="button" id="cancelBudgetModalBtn" class="btn-cancel">Cancel</button>
                        <button type="submit" class="saveTaskEventBtn" id="saveBudgetBtn">
                            <i class="bi bi-check-lg me-1"></i>Save Budget
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    `;
}

export function setupFinanceForm() {
    const addBtn = document.getElementById("addTransactionBtn");
    const addInlineBtn = document.getElementById("addTransactionInlineBtn");
    const modal = document.getElementById("transactionModal");
    const closeBtn = document.getElementById("closeTransactionModal");
    const cancelBtn = document.getElementById("cancelTransactionBtn");
    const form = document.getElementById("transactionForm");
    const transType = document.getElementById("transType");
    const transCategory = document.getElementById("transCategory");
    const table = document.getElementById("transactionTable");
    const budgetModal = document.getElementById("budgetModal");
    const budgetForm = document.getElementById("budgetForm");
    const openBudgetModalBtn = document.getElementById("openBudgetModalBtn");
    const closeBudgetModal = document.getElementById("closeBudgetModal");
    const cancelBudgetModalBtn = document.getElementById("cancelBudgetModalBtn");
    const budgetModalInput = document.getElementById("budgetModalInput");
    const filterMonth = document.getElementById("filterMonth");
    const filterCategory = document.getElementById("filterCategory");

    if (!addBtn || !modal || !form || !transType || !transCategory || !table || !budgetModal || !budgetForm || !openBudgetModalBtn || !budgetModalInput || !filterMonth || !filterCategory) {
        console.error("Finance setup error: required elements missing.");
        return;
    }

    filterMonth.value = getCurrentMonthValue();
    renderCategoryFilterOptions(filterCategory);
    renderTypeCategoryOptions(transType.value, transCategory);
    budgetModalInput.value = storage.getMonthlyBudget() > 0 ? String(storage.getMonthlyBudget()) : "";

    addBtn.addEventListener("click", openTransactionModal);
    addInlineBtn?.addEventListener("click", openTransactionModal);
    closeBtn?.addEventListener("click", closeAndResetTransactionModal);
    cancelBtn?.addEventListener("click", closeAndResetTransactionModal);

    transType.addEventListener("change", () => {
        renderTypeCategoryOptions(transType.value, transCategory);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const transaction = collectTransactionFormData();
        if (!transaction) {
            alert("Please fill all required fields with valid values.");
            return;
        }

        storage.upsertTransaction(transaction);
        closeAndResetTransactionModal();
        renderTransactions();
    });

    table.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-transaction-btn");
        const deleteBtn = e.target.closest(".delete-transaction-btn");
        if (editBtn) {
            const id = Number(editBtn.dataset.id);
            if (!Number.isFinite(id)) return;

            const transaction = getTransactions().find((item) => item.id === id);
            if (!transaction) return;
            openEditTransactionModal(transaction);
            return;
        }

        if (!deleteBtn) return;

        const id = Number(deleteBtn.dataset.id);
        if (!Number.isFinite(id)) return;

        const confirmed = window.confirm("Delete this transaction?");
        if (!confirmed) return;

        storage.deleteTransactionById(id);
        renderTransactions();
    });

    openBudgetModalBtn.addEventListener("click", () => {
        budgetModalInput.value = storage.getMonthlyBudget() > 0 ? String(storage.getMonthlyBudget()) : "";
        budgetModal.showModal();
    });

    closeBudgetModal?.addEventListener("click", () => budgetModal.close());
    cancelBudgetModalBtn?.addEventListener("click", () => budgetModal.close());

    budgetForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const budgetValue = Number(budgetModalInput.value);
        if (!Number.isFinite(budgetValue) || budgetValue < 0) {
            alert("Please enter a valid budget amount.");
            return;
        }

        storage.setMonthlyBudget(budgetValue);
        budgetModal.close();
        renderTransactions();
    });

    filterMonth.addEventListener("change", renderTransactions);
    filterCategory.addEventListener("change", renderTransactions);
    renderTransactions();
}

function openTransactionModal() {
    const modal = document.getElementById("transactionModal");
    const form = document.getElementById("transactionForm");
    const modalTitle = document.getElementById("transactionModalTitle");
    const saveLabel = document.getElementById("saveTransactionBtnLabel");
    const transType = document.getElementById("transType");
    const transCategory = document.getElementById("transCategory");
    const transDate = document.getElementById("transDate");
    const transId = document.getElementById("transId");

    form?.reset();
    if (transId) transId.value = "";
    if (modalTitle) modalTitle.textContent = "Add Transaction";
    if (saveLabel) saveLabel.innerHTML = `<i class="bi bi-check-lg me-1"></i>Save Transaction`;
    if (transDate) transDate.value = getTodayDateString();
    if (transType) transType.value = "expense";
    if (transCategory && transType) renderTypeCategoryOptions(transType.value, transCategory);
    modal?.showModal();
}

function openEditTransactionModal(transaction) {
    const modal = document.getElementById("transactionModal");
    const modalTitle = document.getElementById("transactionModalTitle");
    const saveLabel = document.getElementById("saveTransactionBtnLabel");
    const transId = document.getElementById("transId");
    const transDate = document.getElementById("transDate");
    const transDesc = document.getElementById("transDesc");
    const transAmount = document.getElementById("transAmount");
    const transType = document.getElementById("transType");
    const transCategory = document.getElementById("transCategory");
    const transMethod = document.getElementById("transMethod");

    if (modalTitle) modalTitle.textContent = "Edit Transaction";
    if (saveLabel) saveLabel.innerHTML = `<i class="bi bi-check-lg me-1"></i>Update Transaction`;
    if (transId) transId.value = String(transaction.id);
    if (transDate) transDate.value = transaction.date;
    if (transDesc) transDesc.value = transaction.desc || "";
    if (transAmount) transAmount.value = String(transaction.amount);
    if (transType) transType.value = transaction.type;

    if (transCategory && transType) {
        renderTypeCategoryOptions(transType.value, transCategory);
        transCategory.value = transaction.category;
    }

    if (transMethod) transMethod.value = transaction.method;

    modal?.showModal();
}

function closeAndResetTransactionModal() {
    const modal = document.getElementById("transactionModal");
    const form = document.getElementById("transactionForm");
    form?.reset();
    modal?.close();
}

function collectTransactionFormData() {
    const idValue = document.getElementById("transId")?.value;
    const date = document.getElementById("transDate")?.value;
    const desc = document.getElementById("transDesc")?.value.trim() || "";
    const amountValue = Number(document.getElementById("transAmount")?.value);
    const type = String(document.getElementById("transType")?.value || "").toLowerCase();
    const category = document.getElementById("transCategory")?.value || "";
    const method = String(document.getElementById("transMethod")?.value || "").toLowerCase();

    if (!date || !TYPE_OPTIONS.includes(type) || !Number.isFinite(amountValue) || amountValue <= 0 || !category || !method) {
        return null;
    }

    return normalizeTransaction({
        id: idValue ? Number(idValue) : Date.now(),
        date,
        desc,
        amount: amountValue,
        type,
        category,
        method
    });
}

function getTransactions() {
    return storage.getTransactions().map(normalizeTransaction);
}

function renderTransactions() {
    const table = document.getElementById("transactionTable");
    const filterMonth = document.getElementById("filterMonth");
    const filterCategory = document.getElementById("filterCategory");
    const recordCount = document.getElementById("transactionRecordCount");
    const topCategoriesList = document.getElementById("topCategoriesList");

    if (!table || !filterMonth || !filterCategory || !recordCount || !topCategoriesList) return;

    const allTransactions = getTransactions();
    const selectedMonth = filterMonth.value;
    const selectedCategory = filterCategory.value;

    const monthScoped = selectedMonth
        ? allTransactions.filter((item) => item.date.startsWith(selectedMonth))
        : allTransactions.filter((item) => item.date.startsWith(getCurrentMonthValue()));

    let displayTransactions = [...allTransactions];
    if (selectedMonth) {
        displayTransactions = displayTransactions.filter((item) => item.date.startsWith(selectedMonth));
    }
    if (selectedCategory && selectedCategory !== "all") {
        displayTransactions = displayTransactions.filter((item) => item.category === selectedCategory);
    }

    displayTransactions.sort((a, b) => {
        const first = `${a.date}T00:00:00`;
        const second = `${b.date}T00:00:00`;
        const byDate = new Date(second) - new Date(first);
        if (byDate !== 0) return byDate;
        return Number(b.id) - Number(a.id);
    });

    const totalSummary = calculateSummary(allTransactions);
    updateSummary(totalSummary, allTransactions);

    const budget = storage.getMonthlyBudget();
    const monthExpense = monthScoped.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    updateBudgetPanel({
        budget,
        monthExpense
    });

    renderTopCategories(topCategoriesList, monthScoped);

    recordCount.textContent = `${displayTransactions.length} record${displayTransactions.length === 1 ? "" : "s"}`;

    if (displayTransactions.length === 0) {
        table.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No transactions found</td></tr>`;
        return;
    }

    table.innerHTML = displayTransactions.map((item) => {
        const typeLabel = item.type === "income" ? "Income" : "Expense";
        const typeClass = item.type === "income" ? "is-income" : "is-expense";
        const amountSign = item.type === "income" ? "+" : "-";

        return `
            <tr data-id="${item.id}">
                <td>${formatReadableDate(item.date)}</td>
                <td>${escapeHtml(item.desc || "-")}</td>
                <td><span class="finance-pill finance-pill-category">${escapeHtml(toTitle(item.category))}</span></td>
                <td>${escapeHtml(toTitle(item.method))}</td>
                <td><span class="finance-pill ${typeClass}">${typeLabel}</span></td>
                <td class="finance-amount-cell ${typeClass}">${amountSign}${formatCurrency(item.amount)}</td>
                <td>
                    <div class="finance-row-actions">
                        <button type="button" class="btn btn-sm btn-outline-primary edit-transaction-btn" data-id="${item.id}" aria-label="Edit transaction">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger delete-transaction-btn" data-id="${item.id}" aria-label="Delete transaction">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

export function calculateSummary(transactions) {
    let income = 0;
    let expense = 0;

    transactions.forEach((item) => {
        if (item.type === "income") income += item.amount;
        if (item.type === "expense") expense += item.amount;
    });

    return { income, expense, netBalance: income - expense };
}

function updateSummary(summary, source) {
    const totalIncomeEl = document.getElementById("totalIncome");
    const totalExpenseEl = document.getElementById("totalExpense");
    const netBalanceEl = document.getElementById("netBalance");
    const incomeMeta = document.getElementById("incomeMeta");
    const expenseMeta = document.getElementById("expenseMeta");
    const netMeta = document.getElementById("netMeta");

    if (!totalIncomeEl || !totalExpenseEl || !netBalanceEl || !incomeMeta || !expenseMeta || !netMeta) return;

    const incomeCount = source.filter((t) => t.type === "income").length;
    const expenseCount = source.filter((t) => t.type === "expense").length;

    totalIncomeEl.textContent = formatCurrency(summary.income);
    totalExpenseEl.textContent = formatCurrency(summary.expense);
    netBalanceEl.textContent = formatCurrency(summary.netBalance);

    incomeMeta.textContent = incomeCount > 0 ? "All income" : "No income yet";
    expenseMeta.textContent = expenseCount > 0 ? "All outflow" : "No expenses yet";
    netMeta.textContent = summary.netBalance < 0 ? "Over spending" : "Healthy balance";

    totalIncomeEl.classList.toggle("text-success", summary.income > 0);
    totalExpenseEl.classList.toggle("text-danger", summary.expense > 0);
    netBalanceEl.classList.toggle("text-danger", summary.netBalance < 0);
    netBalanceEl.classList.toggle("text-success", summary.netBalance >= 0);
}

function updateBudgetPanel({ budget, monthExpense }) {
    const budgetValue = document.getElementById("monthlyBudgetValue");
    const spentValue = document.getElementById("monthlySpentValue");
    const remainingValue = document.getElementById("monthlyRemainingValue");
    const percentLabel = document.getElementById("budgetPercentLabel");
    const progressBar = document.getElementById("budgetProgressBar");
    const badge = document.getElementById("budgetStatusBadge");

    if (!budgetValue || !spentValue || !remainingValue || !percentLabel || !progressBar || !badge) return;

    const percent = budget > 0 ? Math.min((monthExpense / budget) * 100, 100) : 0;
    const remaining = Math.max(budget - monthExpense, 0);
    const overBy = Math.max(monthExpense - budget, 0);

    budgetValue.textContent = formatCurrency(budget);
    spentValue.textContent = formatCurrency(monthExpense);
    percentLabel.textContent = `${percent.toFixed(1)}%`;
    remainingValue.textContent = `${formatCurrency(remaining)} left`;
    progressBar.style.width = `${percent}%`;

    if (budget <= 0) {
        badge.className = "finance-budget-badge is-neutral";
        badge.textContent = "Set monthly budget to activate progress.";
        return;
    }

    if (monthExpense > budget) {
        badge.className = "finance-budget-badge is-danger";
        badge.textContent = `Over by ${formatCurrency(overBy)}`;
        return;
    }

    badge.className = "finance-budget-badge is-good";
    badge.textContent = `${formatCurrency(remaining)} remaining`;
}

function renderTopCategories(container, transactions) {
    const expenses = transactions.filter((item) => item.type === "expense");
    if (expenses.length === 0) {
        container.innerHTML = `<p class="text-muted mb-0">No expense data for this month.</p>`;
        return;
    }

    const totals = {};
    let highest = 0;
    expenses.forEach((item) => {
        totals[item.category] = (totals[item.category] || 0) + item.amount;
        highest = Math.max(highest, totals[item.category]);
    });

    const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);

    container.innerHTML = top.map(([category, total]) => {
        const width = highest > 0 ? (total / highest) * 100 : 0;
        return `
            <div class="finance-top-item">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="finance-top-name"><i class="bi bi-record-circle me-1"></i>${escapeHtml(toTitle(category))}</span>
                    <span class="finance-top-value">${formatCurrency(total)}</span>
                </div>
                <div class="finance-top-bar">
                    <span style="width:${width.toFixed(2)}%"></span>
                </div>
            </div>
        `;
    }).join("");
}

function renderTypeCategoryOptions(type, targetSelect) {
    if (!targetSelect) return;
    const normalizedType = TYPE_OPTIONS.includes(type) ? type : "expense";
    const options = CATEGORY_OPTIONS[normalizedType];

    targetSelect.innerHTML = options
        .map((category) => `<option value="${category.toLowerCase()}">${category}</option>`)
        .join("");
}

function renderCategoryFilterOptions(targetSelect) {
    if (!targetSelect) return;
    const allCategories = [...CATEGORY_OPTIONS.income, ...CATEGORY_OPTIONS.expense].map((c) => c.toLowerCase());
    const uniqueCategories = [...new Set(allCategories)];

    targetSelect.innerHTML = `
        <option value="all">All categories</option>
        ${uniqueCategories.map((category) => `<option value="${category}">${toTitle(category)}</option>`).join("")}
    `;
}

function normalizeTransaction(raw) {
    const normalizedType = TYPE_OPTIONS.includes(String(raw?.type || "").toLowerCase())
        ? String(raw.type).toLowerCase()
        : "expense";
    const normalizedAmount = Math.abs(Number(raw?.amount) || 0);
    const fallbackCategory = CATEGORY_OPTIONS[normalizedType][0].toLowerCase();
    const category = String(raw?.category || fallbackCategory).toLowerCase();
    const method = String(raw?.method || "cash").toLowerCase();
    const date = raw?.date || getTodayDateString();

    return {
        id: Number(raw?.id) || Date.now(),
        date,
        desc: String(raw?.desc || "").trim(),
        amount: normalizedAmount,
        type: normalizedType,
        category,
        method
    };
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value) || 0);
}

function formatReadableDate(yyyyMmDd) {
    const [year, month, day] = String(yyyyMmDd || "").split("-").map(Number);
    if (!year || !month || !day) return "-";
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function toTitle(value) {
    return String(value || "")
        .split(" ")
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(" ");
}

function getTodayDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getCurrentMonthValue() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}


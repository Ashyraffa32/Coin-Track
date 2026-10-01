document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL SETTINGS & LANGUAGE ---
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const currentLang = settings.language || 'id';
    const translation = translations[currentLang] || translations.id;

    // --- ELEMENT SELECTION ---
    const formTransaksi = document.getElementById('form-transaksi');
    const deskripsiInput = document.getElementById('deskripsi');
    const kategoriInput = document.getElementById('kategori');
    const jumlahInput = document.getElementById('jumlah');
    const kuantitasInput = document.getElementById('kuantitas');
    const tipeInput = document.getElementById('tipe');
    const tanggalInput = document.getElementById('tanggal');
    const searchInput = document.getElementById('search-transactions');
    const categoryFilterInput = document.getElementById('filter-category');
    const amountFilterInput = document.getElementById('filter-amount');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const categoryOptions = document.getElementById('category-options');
    const tabelTransaksiBody = document.getElementById('tabel-transaksi');
    const totalPemasukanEl = document.getElementById('total-pemasukan');
    const totalPengeluaranEl = document.getElementById('total-pengeluaran');
    const saldoAkhirEl = document.getElementById('saldo-akhir');
    const quickCalculatorSection = document.getElementById('quick-calculator-section');
    const transactionsSection = document.getElementById('transactions-section');
    const navNotes = document.getElementById('nav-notes');
    const notesSection = document.getElementById('notes-section');
    const navCalculator = document.getElementById('nav-calculator');
    const navTransactions = document.getElementById('nav-transactions');
    const calcDisplay = document.getElementById('calc-display');
    const notesTextarea = document.getElementById('notes-textarea');
    const saveLocalBtn = document.getElementById('save-local-btn');

    // Load saved notes
    const savedNotes = localStorage.getItem('userNotes');
    if (savedNotes) {
        notesTextarea.value = savedNotes;
    }

    // Save to LocalStorage
    saveLocalBtn.addEventListener('click', () => {
        const content = notesTextarea.value;
        localStorage.setItem('userNotes', content);
        alert(translation.notesSavedAlert || "Notes Saved!");
    });

    // --- APP STATE ---
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // --- FUNCTIONS ---
    const simpanKeLocalStorage = () => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    };

    const formatCurrency = (angka) => {
        const currencySymbol = settings.currency || 'Rp';
        const formattedNumber = new Intl.NumberFormat('id-ID').format(angka);
        return `${currencySymbol} ${formattedNumber}`;
    };

    const getFilteredTransactions = () => {
        const searchTerm = (searchInput?.value || '').trim().toLowerCase();
        const categoryTerm = (categoryFilterInput?.value || '').trim().toLowerCase();
        const maxAmount = parseFloat(amountFilterInput?.value || '');

        return transactions.filter((trx) => {
            const searchableText = [trx.deskripsi, trx.kategori].join(' ').toLowerCase();
            const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
            const matchesCategory = !categoryTerm || (trx.kategori || '').toLowerCase().includes(categoryTerm);
            const matchesAmount = Number.isNaN(maxAmount) || trx.jumlah <= maxAmount;
            return matchesSearch && matchesCategory && matchesAmount;
        });
    };

    const renderTable = () => {
        tabelTransaksiBody.innerHTML = '';

        const categoryNames = {
            food: translation.categoryFood || 'Food',
            bills: translation.categoryBills || 'Bills',
            transport: translation.categoryTransport || 'Transport',
            savings: translation.categorySavings || 'Savings',
            other: translation.categoryOther || 'Other',
        };

        const visibleTransactions = getFilteredTransactions();
        visibleTransactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        const existingCategories = new Set();
        transactions.forEach((trx) => {
            if (trx.kategori) {
                existingCategories.add(trx.kategori);
            }
        });

        if (categoryOptions) {
            categoryOptions.innerHTML = '';
            Array.from(existingCategories)
                .filter(Boolean)
                .forEach((value) => {
                    const option = document.createElement('option');
                    option.value = value;
                    categoryOptions.appendChild(option);
                });
        }

        const formKategoriList = document.getElementById('kategori-list');
        if (formKategoriList) {
            formKategoriList.innerHTML = '';
            Array.from(existingCategories)
                .filter(Boolean)
                .forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    formKategoriList.appendChild(option);
                });
        }

        if (visibleTransactions.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 7;
            cell.textContent = translation.noMatchingTransactions || translation.noTransactions;
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tabelTransaksiBody.appendChild(row);
            return;
        }

        visibleTransactions.forEach((trx) => {
            const row = document.createElement('tr');
            const displayTotal = formatCurrency(trx.jumlah);
            const displayCategory = categoryNames[trx.kategori?.toLowerCase()] || trx.kategori || '-';

            [
                trx.tanggal,
                trx.deskripsi,
                displayCategory,
                displayTotal,
                trx.kuantitas || 1,
                trx.tipe === 'pemasukan' ? translation.incomeOption : translation.expenseOption,
            ].forEach((value) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.dataset.id = trx.id;
            deleteButton.textContent = translation.deleteButton;
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
            tabelTransaksiBody.appendChild(row);
        });
    };

    const updateSummary = () => {
        const totalPemasukan = transactions
            .filter(trx => trx.tipe === 'pemasukan')
            .reduce((total, trx) => total + trx.jumlah, 0);
        
        const totalPengeluaran = transactions
            .filter(trx => trx.tipe === 'pengeluaran')
            .reduce((total, trx) => total + trx.jumlah, 0);

        const saldoAkhir = totalPemasukan - totalPengeluaran;

        totalPemasukanEl.textContent = formatCurrency(totalPemasukan);
        totalPengeluaranEl.textContent = formatCurrency(totalPengeluaran);
        saldoAkhirEl.textContent = formatCurrency(saldoAkhir);
    };

    const hapusTransaksi = (id) => {
        if (confirm(translation.deleteConfirm)) {
            transactions = transactions.filter(trx => trx.id !== id);
            simpanKeLocalStorage();
            renderTable();
            updateSummary();
        }
    };
    
    tabelTransaksiBody.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const id = Number(e.target.getAttribute('data-id'));
            hapusTransaksi(id);
        }
    });

    [searchInput, categoryFilterInput, amountFilterInput].forEach((input) => {
        if (input) {
            input.addEventListener('input', renderTable);
        }
    });

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (categoryFilterInput) categoryFilterInput.value = '';
            if (amountFilterInput) amountFilterInput.value = '';
            renderTable();
        });
    }

    formTransaksi.addEventListener('submit', function(e) {
        e.preventDefault();
        const deskripsi = deskripsiInput.value.trim();
        const kategori = kategoriInput.value;
        const hargaSatuan = parseFloat(jumlahInput.value) || 0;
        const kuantitas = parseInt(kuantitasInput.value, 10) || 1;
        const tipe = tipeInput.value;
        const tanggal = tanggalInput.value;

        if (!deskripsi || !kategori || !tanggal || !tipe || jumlahInput.value === '') {
            alert(translation.validationAlert);
            return;
        }

        const totalHarga = hargaSatuan * kuantitas;

        transactions.push({
            id: Date.now(),
            deskripsi,
            kategori,
            jumlah: totalHarga,
            kuantitas,
            tipe,
            tanggal
        });

        simpanKeLocalStorage();
        renderTable();
        updateSummary();
        formTransaksi.reset();
        kuantitasInput.value = 1;
    });
    
    const calcButtonsContainer = document.querySelector('.calc-buttons');

    const appendToDisplay = (value) => {
        calcDisplay.value += value;
    };

    const clearDisplay = () => {
        calcDisplay.value = '';
    };

    const calculateResult = () => {
        const expression = calcDisplay.value;
        if (!/^[0-9+*/.()\s-]+$/.test(expression)) {
            calcDisplay.value = 'Error';
            return;
        }

        try {
            const result = Function(`"use strict"; return (${expression})`)();
            calcDisplay.value = Number.isFinite(result) ? result : 'Error';
        } catch (error) {
            calcDisplay.value = 'Error';
        }
    };

    calcButtonsContainer.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            return;
        }

        const buttonValue = e.target.textContent;

        if (buttonValue === '=') {
            calculateResult();
        } else if (buttonValue === 'C') {
            clearDisplay();
        } else {
            appendToDisplay(buttonValue);
        }
    });

    // Function to switch sections

const switchSection = (sectionToShow) => {
    // Hide all sections by adding the 'hidden' class
    quickCalculatorSection.classList.add('hidden');
    transactionsSection.classList.add('hidden');
    notesSection.classList.add('hidden'); // Fixed: changed from notesNav to notesSection

    // Remove active class from all nav buttons
    navCalculator.classList.remove('active');
    navTransactions.classList.remove('active');
    navNotes.classList.remove('active');

    // Show the selected section and activate the corresponding nav button
    if (sectionToShow === 'calculator') {
        quickCalculatorSection.classList.remove('hidden');
        navCalculator.classList.add('active');
    } else if (sectionToShow === 'transactions') {
        transactionsSection.classList.remove('hidden');
        navTransactions.classList.add('active');
    } else if (sectionToShow === 'notes') {
        notesSection.classList.remove('hidden'); // Now this variable is defined!
        navNotes.classList.add('active');
    }
};

    // Event listeners for navigation buttons
    navCalculator.addEventListener('click', () => switchSection('calculator'));
    navTransactions.addEventListener('click', () => switchSection('transactions'));
    navNotes.addEventListener('click', () => switchSection('notes'));

    // Initialize by showing the transactions section
    switchSection('transactions');

    // --- INITIALIZATION ---
    renderTable();
    updateSummary();
});



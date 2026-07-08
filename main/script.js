document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL SETTINGS & LANGUAGE ---
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const currentLang = settings.language || 'id';
    const translation = translations[currentLang];

    // --- ELEMENT SELECTION ---
    const formTransaksi = document.getElementById('form-transaksi');
    const deskripsiInput = document.getElementById('deskripsi');
    const kategoriInput = document.getElementById('kategori');
    const tagsInput = document.getElementById('tags');
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
    const dlTxtBtn = document.getElementById('dl-txt-btn');
    const dlMdBtn = document.getElementById('dl-md-btn');

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

    // Helper Functions
    const downloadFile = (content, filename, contentType) => {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(a.href);
        }, 0);
    };

    // Event Listeners to save Files
    dlTxtBtn.addEventListener('click', () => {
        const content = notesTextarea.value;
        const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        downloadFile(content, `cointrack-notes-${date}.txt`, 'text/plain');
    });

    dlMdBtn.addEventListener('click', () => {
        const content = notesTextarea.value;
        const date = new Date().toISOString().split('T')[0];
        downloadFile(content, `cointrack-notes-${date}.md`, 'text/markdown');
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
        const maxAmount = parseInt(amountFilterInput?.value || '', 10);

        return transactions.filter((trx) => {
            const searchableText = [trx.deskripsi, trx.kategori, ...(trx.tags || [])].join(' ').toLowerCase();
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

        if (visibleTransactions.length === 0) {
            tabelTransaksiBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">${translation.noMatchingTransactions || translation.noTransactions}</td></tr>`;
            return;
        }

        const existingCategories = new Set();
        transactions.forEach((trx) => {
            if (trx.kategori) {
                existingCategories.add(trx.kategori);
            }
        });

        if (categoryOptions) {
            categoryOptions.innerHTML = '';
            ['Food', 'Bills', 'Transport', 'Savings', 'Other', ...Array.from(existingCategories)]
                .filter(Boolean)
                .forEach((value) => {
                    const option = document.createElement('option');
                    option.value = value;
                    categoryOptions.appendChild(option);
                });
        }

        visibleTransactions.forEach((trx) => {
            const row = document.createElement('tr');
            const displayTotal = formatCurrency(trx.jumlah);
            const displayCategory = categoryNames[trx.kategori?.toLowerCase()] || trx.kategori || '-';
            const displayTags = trx.tags && trx.tags.length ? trx.tags.join(', ') : '-';
            
            row.innerHTML = `
                <td>${trx.tanggal}</td>
                <td>${trx.deskripsi}</td>
                <td>${displayCategory}</td>
                <td>${displayTags}</td>
                <td>${displayTotal}</td>
                <td>${trx.kuantitas || 1}</td>
                <td>${trx.tipe === 'pemasukan' ? translation.incomeOption : translation.expenseOption}</td>
                <td><button class="delete-btn" data-id="${trx.id}">Hapus</button></td>
            `;
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
        const tags = tagsInput.value.trim();
        const hargaSatuan = parseInt(jumlahInput.value, 10) || 0;
        const kuantitas = parseInt(kuantitasInput.value, 10) || 1;
        const tipe = tipeInput.value;
        const tanggal = tanggalInput.value;

        if (!deskripsi || !kategori || !hargaSatuan || !tanggal || !tipe) {
            alert(translation.validationAlert);
            return;
        }

        const totalHarga = hargaSatuan * kuantitas;

        transactions.push({
            id: Date.now(),
            deskripsi,
            kategori,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
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
    try {
        // eval() is a simple way to compute the math string.
        // It's fine for a simple project like this!
        const result = eval(calcDisplay.value);
        calcDisplay.value = result;
    } catch (error) {
        calcDisplay.value = 'Error';
    }
};

calcButtonsContainer.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
        return; // Didn't click a button
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



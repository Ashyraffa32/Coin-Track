document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL SETTINGS & LANGUAGE ---
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const currentLang = settings.language || 'id';
    const translation = translations[currentLang];

    // --- ELEMENT SELECTION ---
    const formTransaksi = document.getElementById('form-transaksi');
    const deskripsiInput = document.getElementById('deskripsi');
    const jumlahInput = document.getElementById('jumlah');
    const kuantitasInput = document.getElementById('kuantitas');
    const tipeInput = document.getElementById('tipe');
    const tanggalInput = document.getElementById('tanggal');
    const tabelTransaksiBody = document.getElementById('tabel-transaksi');
    const totalPemasukanEl = document.getElementById('total-pemasukan');
    const totalPengeluaranEl = document.getElementById('total-pengeluaran');
    const saldoAkhirEl = document.getElementById('saldo-akhir');

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

    const renderTable = () => {
        tabelTransaksiBody.innerHTML = '';

        if (transactions.length === 0) {
            tabelTransaksiBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">${translation.noTransactions}</td></tr>`;
            return;
        }
        
        transactions.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

        transactions.forEach((trx) => {
            const row = document.createElement('tr');
            const displayTotal = formatCurrency(trx.jumlah);
            
            row.innerHTML = `
                <td>${trx.tanggal}</td>
                <td>${trx.deskripsi}</td>
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

    formTransaksi.addEventListener('submit', function(e) {
        e.preventDefault();
        const deskripsi = deskripsiInput.value.trim();
        const hargaSatuan = parseInt(jumlahInput.value, 10) || 0;
        const kuantitas = parseInt(kuantitasInput.value, 10) || 1;
        const tipe = tipeInput.value;
        const tanggal = tanggalInput.value;

        if (!deskripsi || !hargaSatuan || !tanggal || !tipe) {
            alert(translation.validationAlert);
            return;
        }

        const totalHarga = hargaSatuan * kuantitas;

        transactions.push({
            id: Date.now(),
            deskripsi,
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
    
    // --- INITIALIZATION ---
    renderTable();
    updateSummary();
});


// --- CALCULATOR LOGIC (This was missing) ---
const display = document.getElementById('calc-display');

function appendToDisplay(input) {
    display.value += input;
}

function clearDisplay() {
    display.value = '';
}

function calculateResult() {
    try {
        // Replace 'x' with '*' for evaluation
        const expression = display.value.replace(/x/g, '*');
        display.value = eval(expression);
    } catch (error) {
        display.value = 'Error';
    }
}
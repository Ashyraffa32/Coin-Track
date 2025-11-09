document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTION ---
    const themeSelector = document.getElementById('theme-selector');
    const currencyInput = document.getElementById('currency-input');
    const saveCurrencyBtn = document.getElementById('save-currency-btn');
    const resetBtn = document.getElementById('reset-btn');
    const showCalculatorCheckbox = document.getElementById('show-calculator-checkbox');
    const body = document.body;
    // New selectors for language buttons
    const langIdBtn = document.getElementById('lang-id-btn');
    const langEnBtn = document.getElementById('lang-en-btn');


    // --- STATE & LOCAL STORAGE ---
    let settings = JSON.parse(localStorage.getItem('settings')) || {};
    const currentLang = settings.language || 'id'; // Get current lang for alerts
    const translation = translations[currentLang];

    // --- FUNCTIONS ---
    const applySettings = () => {
        // Apply theme
        if (settings.theme === 'dark') {
            body.classList.add('dark-mode');
            themeSelector.value = 'dark';
        } else {
            body.classList.remove('dark-mode');
            themeSelector.value = 'light';
        }
        
        // **UPDATED**: Apply active style to the correct language button
        document.querySelectorAll('.language-buttons button').forEach(btn => btn.classList.remove('active-lang'));
        if (settings.language === 'en') {
            langEnBtn.classList.add('active-lang');
        } else {
            langIdBtn.classList.add('active-lang');
        }

        // Display saved currency symbol
        currencyInput.value = settings.currency || '';

        // Apply calculator visibility
        showCalculatorCheckbox.checked = settings.showCalculator !== false; // default to true
    };

    const saveSettings = () => {
        localStorage.setItem('settings', JSON.stringify(settings));
    };
    
    // **NEW**: Helper function to handle language change
    const handleLanguageChange = (selectedLang) => {
        settings.language = selectedLang;
        saveSettings();
        setLanguage(selectedLang); // Update UI text instantly
        window.location.reload(); // Reload to ensure all parts of the app use the new language
    };


    // --- EVENT LISTENERS ---

    // Change Theme
    themeSelector.addEventListener('change', () => {
        settings.theme = themeSelector.value;
        saveSettings();
        applySettings();
    });

    // **UPDATED**: Change Language via Buttons
    langIdBtn.addEventListener('click', () => handleLanguageChange('id'));
    langEnBtn.addEventListener('click', () => handleLanguageChange('en'));

    // Save Currency
    saveCurrencyBtn.addEventListener('click', () => {
        const newCurrency = currencyInput.value.trim();
        if (newCurrency) {
            settings.currency = newCurrency;
            saveSettings();
            alert(translation.currencySavedAlert);
        } else {
            alert(translation.currencyEmptyAlert);
        }
    });

    // Reset All Data
    resetBtn.addEventListener('click', () => {
        if (confirm(translation.resetConfirm1)) {
            if (confirm(translation.resetConfirm2)) {
                localStorage.removeItem('transactions');
                alert(translation.resetSuccessAlert);
            }
        }
    });

    // Toggle Calculator
    showCalculatorCheckbox.addEventListener('change', () => {
        settings.showCalculator = showCalculatorCheckbox.checked;
        saveSettings();
    });

    // --- INITIALIZATION ---
    applySettings();
});
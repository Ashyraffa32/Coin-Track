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
    let currencySymbols;
    let currencyCodes;

    // --- FUNCTIONS ---
    const getCurrencySymbols = () => {
        if (currencySymbols) return currencySymbols;

        const fallbackSymbols = [
            '$', '¢', '£', '¥', '€', '₹', '₽', '₩', '₺', '₫', '฿', '₪', '₦', '₱', '₴',
            '₡', '₲', '₵', '₸', '₮', '₭', '₨', '₼', '₾', '₿', '֏', '؋', '৳', '៛', 'ƒ',
            'Rp', 'RM', 'R$', 'kr', 'kr.', 'zł', 'Kč', 'Ft', 'lei', 'лв', 'ден', 'د.إ.',
            'ر.س.', 'د.ك.', 'د.ب.', 'ر.ع.', 'ر.ق.', 'ج.م.'
        ];
        const symbols = new Set(fallbackSymbols);
        currencyCodes = typeof Intl.supportedValuesOf === 'function'
            ? Intl.supportedValuesOf('currency')
            : [];
        const locales = [
            'en-US', 'en-CA', 'en-AU', 'en-GB', 'en-NZ', 'en-SG', 'en-HK', 'en-ZA',
            'id-ID', 'ms-MY', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'hi-IN', 'bn-BD',
            'ur-PK', 'ne-NP', 'fr-FR', 'fr-CA', 'de-DE', 'es-ES', 'pt-BR', 'ru-RU',
            'uk-UA', 'pl-PL', 'cs-CZ', 'hu-HU', 'ro-RO', 'bg-BG', 'sr-RS', 'da-DK',
            'sv-SE', 'nb-NO', 'is-IS', 'tr-TR', 'th-TH', 'vi-VN', 'ar-SA', 'ar-AE',
            'ar-EG', 'ar-KW', 'fa-IR', 'he-IL', 'sw-KE'
        ];

        currencyCodes.forEach((code) => {
            locales.forEach((locale) => {
                const symbol = new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: code
                }).formatToParts(1).find((part) => part.type === 'currency')?.value.trim();

                if (symbol && symbol !== code) symbols.add(symbol);
            });
        });

        currencySymbols = symbols;
        return currencySymbols;
    };

    const isCurrencySymbol = (value) => {
        const symbol = value.trim();
        const symbols = getCurrencySymbols();
        const supportedCodes = currencyCodes || [];
        return !supportedCodes.includes(symbol.toUpperCase()) && symbols.has(symbol);
    };

    const applySettings = () => {
        // Apply theme
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            themeSelector.value = 'dark';
        } else {
            document.documentElement.classList.remove('dark-mode');
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
            if (isCurrencySymbol(newCurrency)) {
                settings.currency = newCurrency;
                saveSettings();
                alert(translation.currencySavedAlert);
            } else {
                alert(translation.currencyInvalidAlert);
            }
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
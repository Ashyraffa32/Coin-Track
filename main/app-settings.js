// Function to set the language on the page
const setLanguage = (lang) => {
    // Fallback to 'id' if the selected language or its translations don't exist
    const translation = translations[lang] || translations['id'];

    // Select all elements that need text content updated
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translation[key]) {
            el.textContent = translation[key];
        }
    });

    // Select all elements that need placeholder updated
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translation[key]) {
            el.placeholder = translation[key];
        }
    });
};

// This single listener will run on every page to apply all global settings
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    let settings = JSON.parse(localStorage.getItem('settings')) || {};

    // 1. Apply Language
    const currentLang = settings.language || 'id'; // Default to Indonesian
    setLanguage(currentLang);

    // 2. Apply theme
    if (settings.theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }

    // 3. Show/hide calculator based on settings
    const quickCalculator = document.getElementById('quick-calculator');
    if (quickCalculator) {
        // Default to 'block' if the setting doesn't exist yet
        quickCalculator.style.display = (settings.showCalculator === false) ? 'none' : 'block';
    }
});
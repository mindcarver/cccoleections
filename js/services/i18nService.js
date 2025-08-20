/**
 * Internationalization Service for Claude Code Features Collection
 * Handles language switching, translation loading, and UI updates
 */

class I18nService {
    constructor() {
        this.translations = {};
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'zh'];
        this.fallbackLanguage = 'en';
        this.initialized = false;
        
        // Translation cache
        this.cache = new Map();
        
        // Observer pattern for language change events
        this.observers = [];
    }
    
    /**
     * Initialize the internationalization service
     */
    async init() {
        if (this.initialized) return;
        
        try {
            await this.loadTranslations();
            
            // Set initial language from localStorage or browser preference
            const savedLanguage = localStorage.getItem('claude-code-language');
            const browserLanguage = this.getBrowserLanguage();
            const initialLanguage = savedLanguage || browserLanguage;
            
            await this.setLanguage(initialLanguage);
            
            this.initialized = true;
            console.log('✅ I18nService initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize I18nService:', error);
            throw error;
        }
    }
    
    /**
     * Load translation data from JSON
     */
    async loadTranslations() {
        try {
            const cacheKey = 'translations-data';
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                this.translations = this.cache.get(cacheKey);
                return this.translations;
            }
            
            const response = await fetch('./data/i18n.json');
            if (!response.ok) {
                throw new Error(`Failed to load translations: ${response.status}`);
            }
            
            const data = await response.json();
            this.translations = data;
            
            // Cache the data
            this.cache.set(cacheKey, this.translations);
            
            console.log('🌐 Loaded translations for languages:', Object.keys(this.translations));
            return this.translations;
            
        } catch (error) {
            console.error('Failed to load translations:', error);
            throw error;
        }
    }
    
    /**
     * Set the current language
     */
    async setLanguage(language) {
        // Validate language
        if (!this.isLanguageSupported(language)) {
            console.warn(`Language '${language}' not supported, falling back to '${this.fallbackLanguage}'`);
            language = this.fallbackLanguage;
        }
        
        const previousLanguage = this.currentLanguage;
        this.currentLanguage = language;
        
        // Save to localStorage
        localStorage.setItem('claude-code-language', language);
        
        // Update HTML lang attribute
        document.documentElement.lang = language;
        
        // Apply translations to the DOM
        this.applyTranslations();
        
        // Notify observers
        this.notifyLanguageChange(language, previousLanguage);
        
        console.log(`🌐 Language changed to: ${language}`);
    }
    
    /**
     * Get the current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }
    
    /**
     * Check if a language is supported
     */
    isLanguageSupported(language) {
        return this.supportedLanguages.includes(language);
    }
    
    /**
     * Get browser's preferred language
     */
    getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const langCode = browserLang.split('-')[0]; // Extract language code (e.g., 'zh' from 'zh-CN')
        
        return this.isLanguageSupported(langCode) ? langCode : this.fallbackLanguage;
    }
    
    /**
     * Get translation for a key
     */
    t(key, params = {}) {
        const translation = this.getTranslation(key, this.currentLanguage);
        return this.interpolate(translation, params);
    }
    
    /**
     * Get translation with fallback
     */
    getTranslation(key, language = this.currentLanguage) {
        const keys = key.split('.');
        let current = this.translations[language];
        
        // Navigate through the translation object
        for (const k of keys) {
            if (current && typeof current === 'object' && current[k] !== undefined) {
                current = current[k];
            } else {
                // Fallback to default language
                if (language !== this.fallbackLanguage) {
                    return this.getTranslation(key, this.fallbackLanguage);
                }
                console.warn(`Translation not found for key: ${key}`);
                return key; // Return the key itself as fallback
            }
        }
        
        return current;
    }
    
    /**
     * Interpolate variables in translation strings
     */
    interpolate(template, params) {
        if (typeof template !== 'string') {
            return template;
        }
        
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }
    
    /**
     * Apply translations to all elements with data-i18n attributes
     */
    applyTranslations() {
        // Text content translations
        const textElements = document.querySelectorAll('[data-i18n]');
        textElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = this.t(key);
            }
        });
        
        // Placeholder translations
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                element.placeholder = this.t(key);
            }
        });
        
        // Title translations
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                element.title = this.t(key);
            }
        });
        
        // Alt text translations
        const altElements = document.querySelectorAll('[data-i18n-alt]');
        altElements.forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            if (key) {
                element.alt = this.t(key);
            }
        });
        
        // Aria-label translations
        const ariaElements = document.querySelectorAll('[data-i18n-aria]');
        ariaElements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            if (key) {
                element.setAttribute('aria-label', this.t(key));
            }
        });
    }
    
    /**
     * Get all translations for a specific language
     */
    getLanguageTranslations(language = this.currentLanguage) {
        return this.translations[language] || {};
    }
    
    /**
     * Add observer for language change events
     */
    addLanguageChangeObserver(callback) {
        if (typeof callback === 'function') {
            this.observers.push(callback);
        }
    }
    
    /**
     * Remove observer for language change events
     */
    removeLanguageChangeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    
    /**
     * Notify all observers about language change
     */
    notifyLanguageChange(newLanguage, previousLanguage) {
        this.observers.forEach(callback => {
            try {
                callback(newLanguage, previousLanguage);
            } catch (error) {
                console.error('Error in language change observer:', error);
            }
        });
    }
    
    /**
     * Get localized date format
     */
    formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            return dateObj.toLocaleDateString(this.getLocale(), formatOptions);
        } catch (error) {
            console.warn('Date formatting failed, using fallback:', error);
            return dateObj.toLocaleDateString('en-US', formatOptions);
        }
    }
    
    /**
     * Get locale string for current language
     */
    getLocale() {
        const localeMap = {
            'en': 'en-US',
            'zh': 'zh-CN'
        };
        
        return localeMap[this.currentLanguage] || 'en-US';
    }
    
    /**
     * Get number format for current locale
     */
    formatNumber(number, options = {}) {
        try {
            return new Intl.NumberFormat(this.getLocale(), options).format(number);
        } catch (error) {
            console.warn('Number formatting failed, using fallback:', error);
            return number.toString();
        }
    }
    
    /**
     * Get relative time format (e.g., "2 days ago")
     */
    formatRelativeTime(date) {
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diff = now - dateObj;
        
        const units = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 }
        ];
        
        const diffSeconds = Math.abs(diff / 1000);
        
        for (const unit of units) {
            const value = Math.floor(diffSeconds / unit.seconds);
            if (value >= 1) {
                try {
                    const rtf = new Intl.RelativeTimeFormat(this.getLocale(), { 
                        numeric: 'auto',
                        style: 'long'
                    });
                    
                    const multiplier = diff < 0 ? 1 : -1;
                    return rtf.format(value * multiplier, unit.label);
                } catch (error) {
                    // Fallback for browsers without RelativeTimeFormat
                    const suffix = diff < 0 ? 'from now' : 'ago';
                    return `${value} ${unit.label}${value > 1 ? 's' : ''} ${suffix}`;
                }
            }
        }
        
        return 'just now';
    }
    
    /**
     * Detect text direction for current language
     */
    getTextDirection() {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(this.currentLanguage) ? 'rtl' : 'ltr';
    }
    
    /**
     * Update document direction
     */
    updateDocumentDirection() {
        document.documentElement.dir = this.getTextDirection();
    }
    
    /**
     * Get language display name
     */
    getLanguageDisplayName(language) {
        const displayNames = {
            'en': 'English',
            'zh': '中文'
        };
        
        return displayNames[language] || language;
    }
    
    /**
     * Validate translation completeness
     */
    validateTranslations() {
        const languages = Object.keys(this.translations);
        const issues = [];
        
        if (languages.length === 0) {
            issues.push('No translations loaded');
            return issues;
        }
        
        // Check if all languages have the same keys structure
        const referenceKeys = this.getDeepKeys(this.translations[this.fallbackLanguage]);
        
        languages.forEach(lang => {
            if (lang === this.fallbackLanguage) return;
            
            const langKeys = this.getDeepKeys(this.translations[lang]);
            const missingKeys = referenceKeys.filter(key => !langKeys.includes(key));
            const extraKeys = langKeys.filter(key => !referenceKeys.includes(key));
            
            if (missingKeys.length > 0) {
                issues.push(`Language '${lang}' missing keys: ${missingKeys.join(', ')}`);
            }
            
            if (extraKeys.length > 0) {
                issues.push(`Language '${lang}' has extra keys: ${extraKeys.join(', ')}`);
            }
        });
        
        return issues;
    }
    
    /**
     * Get all deep keys from an object
     */
    getDeepKeys(obj, prefix = '') {
        let keys = [];
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    keys = keys.concat(this.getDeepKeys(obj[key], fullKey));
                } else {
                    keys.push(fullKey);
                }
            }
        }
        
        return keys;
    }
    
    /**
     * Clear translation cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 I18nService cache cleared');
    }
    
    /**
     * Export current translations
     */
    exportTranslations(language = this.currentLanguage) {
        return JSON.stringify(this.getLanguageTranslations(language), null, 2);
    }
    
    /**
     * Get service statistics
     */
    getStats() {
        const validationIssues = this.validateTranslations();
        
        return {
            currentLanguage: this.currentLanguage,
            supportedLanguages: this.supportedLanguages,
            totalTranslations: Object.keys(this.translations).length,
            validationIssues: validationIssues,
            observers: this.observers.length,
            cacheSize: this.cache.size
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nService;
} else {
    window.I18nService = I18nService;
}
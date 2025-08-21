/**
 * Utility functions for Claude Code Features Collection
 * Common helper functions used across the application
 */

/**
 * Utility class with static helper methods
 */
class Utils {
    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately
     * @returns {Function} Debounced function
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }
    
    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = Utils.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    }
    
    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    static generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @param {string} locale - Locale for formatting
     * @returns {string} Formatted date
     */
    static formatDate(date, locale = 'en-US') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        return d.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    /**
     * Convert string to kebab-case
     * @param {string} str - String to convert
     * @returns {string} Kebab-case string
     */
    static toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/\s+/g, '-')
            .toLowerCase();
    }
    
    /**
     * Convert string to camelCase
     * @param {string} str - String to convert
     * @returns {string} CamelCase string
     */
    static toCamelCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '');
    }
    
    /**
     * Check if string is valid URL
     * @param {string} str - String to validate
     * @returns {boolean} Is valid URL
     */
    static isValidUrl(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Get nested object property safely
     * @param {object} obj - Object to query
     * @param {string} path - Property path (e.g., 'user.profile.name')
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Property value or default
     */
    static getNestedProperty(obj, path, defaultValue = undefined) {
        if (!obj || !path) return defaultValue;
        
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current[key] === undefined || current[key] === null) {
                return defaultValue;
            }
            current = current[key];
        }
        
        return current;
    }
    
    /**
     * Set nested object property safely
     * @param {object} obj - Object to modify
     * @param {string} path - Property path
     * @param {*} value - Value to set
     */
    static setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    }
    
    /**
     * Remove duplicates from array
     * @param {Array} array - Array with potential duplicates
     * @param {string|Function} key - Key to check for uniqueness or comparison function
     * @returns {Array} Array without duplicates
     */
    static removeDuplicates(array, key = null) {
        if (!Array.isArray(array)) return [];
        
        if (key === null) {
            return [...new Set(array)];
        }
        
        if (typeof key === 'string') {
            const seen = new Set();
            return array.filter(item => {
                const val = item[key];
                if (seen.has(val)) return false;
                seen.add(val);
                return true;
            });
        }
        
        if (typeof key === 'function') {
            const seen = new Set();
            return array.filter(item => {
                const val = key(item);
                if (seen.has(val)) return false;
                seen.add(val);
                return true;
            });
        }
        
        return array;
    }
    
    /**
     * Sort array by multiple criteria
     * @param {Array} array - Array to sort
     * @param {Array} criteria - Sort criteria
     * @returns {Array} Sorted array
     */
    static multiSort(array, criteria) {
        if (!Array.isArray(array) || !Array.isArray(criteria)) return array;
        
        return array.sort((a, b) => {
            for (const criterion of criteria) {
                const { key, order = 'asc' } = criterion;
                let valueA = Utils.getNestedProperty(a, key);
                let valueB = Utils.getNestedProperty(b, key);
                
                // Handle null/undefined values
                if (valueA == null && valueB == null) continue;
                if (valueA == null) return 1;
                if (valueB == null) return -1;
                
                // Convert to comparable types
                if (typeof valueA === 'string') valueA = valueA.toLowerCase();
                if (typeof valueB === 'string') valueB = valueB.toLowerCase();
                
                let comparison = 0;
                if (valueA < valueB) comparison = -1;
                else if (valueA > valueB) comparison = 1;
                
                if (comparison !== 0) {
                    return order === 'desc' ? -comparison : comparison;
                }
            }
            return 0;
        });
    }
    
    /**
     * Fuzzy search in text
     * @param {string} needle - Search term
     * @param {string} haystack - Text to search in
     * @returns {number} Match score (0-1, higher is better match)
     */
    static fuzzySearch(needle, haystack) {
        if (!needle || !haystack) return 0;
        
        needle = needle.toLowerCase();
        haystack = haystack.toLowerCase();
        
        // Exact match
        if (haystack === needle) return 1;
        
        // Contains match
        if (haystack.includes(needle)) {
            return 0.8 - (haystack.length - needle.length) / haystack.length * 0.3;
        }
        
        // Fuzzy match using character matching
        let score = 0;
        let needleIndex = 0;
        
        for (let i = 0; i < haystack.length && needleIndex < needle.length; i++) {
            if (haystack[i] === needle[needleIndex]) {
                score++;
                needleIndex++;
            }
        }
        
        return needleIndex === needle.length ? score / needle.length * 0.6 : 0;
    }
    
    /**
     * Format file size
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback method
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
                return true;
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    }
    
    /**
     * Get browser information
     * @returns {object} Browser info
     */
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = '';
        
        if (ua.includes('Firefox')) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/(\d+)/)?.[1] || '';
        } else if (ua.includes('Chrome')) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/(\d+)/)?.[1] || '';
        } else if (ua.includes('Safari')) {
            browser = 'Safari';
            version = ua.match(/Version\/(\d+)/)?.[1] || '';
        } else if (ua.includes('Edge')) {
            browser = 'Edge';
            version = ua.match(/Edge\/(\d+)/)?.[1] || '';
        }
        
        return {
            browser,
            version,
            userAgent: ua,
            platform: navigator.platform,
            language: navigator.language
        };
    }
    
    /**
     * Check if device is mobile
     * @returns {boolean} Is mobile device
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * Check if reduced motion is preferred
     * @returns {boolean} Prefers reduced motion
     */
    static prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    /**
     * Get scroll position
     * @returns {object} Scroll position {x, y}
     */
    static getScrollPosition() {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    }
    
    /**
     * Smooth scroll to element
     * @param {string|Element} target - Target element or selector
     * @param {object} options - Scroll options
     */
    static scrollToElement(target, options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;
        
        const defaultOptions = {
            behavior: Utils.prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
            inline: 'nearest'
        };
        
        element.scrollIntoView({ ...defaultOptions, ...options });
    }
    
    /**
     * Wait for specified time
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after delay
     */
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Retry async operation with exponential backoff
     * @param {Function} operation - Async operation to retry
     * @param {number} maxRetries - Maximum retry attempts
     * @param {number} baseDelay - Base delay in milliseconds
     * @returns {Promise} Operation result
     */
    static async retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) throw error;
                
                const delay = baseDelay * Math.pow(2, attempt);
                console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, error);
                await Utils.wait(delay);
            }
        }
    }
    
    /**
     * LocalStorage utilities
     */
    static localStorage = {
        /**
         * Get item from localStorage with fallback
         * @param {string} key - Storage key
         * @param {*} defaultValue - Default value if not found
         * @returns {*} Stored value or default
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item !== null ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn(`Failed to get localStorage item '${key}':`, error);
                return defaultValue;
            }
        },
        
        /**
         * Set item in localStorage
         * @param {string} key - Storage key
         * @param {*} value - Value to store
         * @returns {boolean} Success status
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn(`Failed to set localStorage item '${key}':`, error);
                return false;
            }
        },
        
        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         * @returns {boolean} Success status
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn(`Failed to remove localStorage item '${key}':`, error);
                return false;
            }
        },
        
        /**
         * Clear all localStorage
         * @returns {boolean} Success status
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('Failed to clear localStorage:', error);
                return false;
            }
        }
    };
    
    /**
     * URL parameter utilities
     */
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
    
    /**
     * Set URL parameter without page reload
     * @param {string} key - Parameter key
     * @param {string} value - Parameter value
     */
    static setUrlParam(key, value) {
        const url = new URL(window.location);
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
        window.history.replaceState({}, '', url);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}
/**
 * Utils - Utility Functions
 * AndalusAI - Prompt
 * 
 * @description Comprehensive utility library for the extension
 * @version 1.0.0
 */

/**
 * Main utility object
 */
export const Utils = {
    // ============================================
    // ID Generation
    // ============================================

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    },

    /**
     * Generate UUID v4
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // ============================================
    // Text Processing
    // ============================================

    /**
     * Format text as a prompt
     * @param {string} text - Input text
     * @returns {string} Formatted text
     */
    formatAsPrompt(text) {
        if (!text) return '';
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\n{3,}/g, '\n\n');
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add
     * @returns {string}
     */
    truncate(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) return text || '';
        return text.substring(0, maxLength - suffix.length).trim() + suffix;
    },

    /**
     * Sanitize text to prevent XSS
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeText(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return String(text).replace(/[&<>"'`=/]/g, char => map[char]);
    },

    /**
     * Strip HTML tags from text
     * @param {string} html - HTML string
     * @returns {string} Plain text
     */
    stripHtml(html) {
        if (!html) return '';
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    },

    /**
     * Convert text to slug (URL-friendly)
     * @param {string} text - Text to convert
     * @returns {string} Slug
     */
    slugify(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .trim()
            .replace(/[\s_]+/g, '-')
            .replace(/[^\w\u0621-\u064A-]+/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    // ============================================
    // Text Analysis
    // ============================================

    /**
     * Count words in text
     * @param {string} text - Text to analyze
     * @returns {number} Word count
     */
    countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    },

    /**
     * Count characters in text
     * @param {string} text - Text to analyze
     * @param {boolean} includeSpaces - Include spaces
     * @returns {number} Character count
     */
    countCharacters(text, includeSpaces = true) {
        if (!text) return 0;
        return includeSpaces ? text.length : text.replace(/\s/g, '').length;
    },

    /**
     * Count lines in text
     * @param {string} text - Text to analyze
     * @returns {number} Line count
     */
    countLines(text) {
        if (!text) return 0;
        return text.split('\n').length;
    },

    /**
     * Detect text language (Arabic or English)
     * @param {string} text - Text to analyze
     * @returns {'ar'|'en'|'mixed'} Detected language
     */
    detectLanguage(text) {
        if (!text) return 'en';
        const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
        const englishPattern = /[a-zA-Z]/;

        const hasArabic = arabicPattern.test(text);
        const hasEnglish = englishPattern.test(text);

        if (hasArabic && hasEnglish) return 'mixed';
        if (hasArabic) return 'ar';
        return 'en';
    },

    // ============================================
    // Prompt Improvement
    // ============================================

    /**
     * Improve prompt with structure
     * @param {string} text - Original prompt
     * @param {object} options - Options
     * @returns {string} Improved prompt
     */
    improvePrompt(text, options = {}) {
        if (!text) return '';

        const {
            addContext = true,
            addOutput = true,
            addConstraints = false,
            language = 'en'
        } = options;

        let improved = text.trim();
        const isArabic = language === 'ar';

        // Add task section if not present
        if (!improved.includes('##') && improved.length > 30) {
            improved = (isArabic ? '## المهمة\n' : '## Task\n') + improved;
        }

        // Add context section
        if (addContext && !improved.toLowerCase().includes('context') && !improved.includes('السياق')) {
            const contextSection = isArabic
                ? '\n\n## السياق\n[أضف السياق هنا]'
                : '\n\n## Context\n[Add context here]';
            improved += contextSection;
        }

        // Add output section
        if (addOutput && !improved.toLowerCase().includes('output') && !improved.includes('الإخراج')) {
            const outputSection = isArabic
                ? '\n\n## الإخراج المتوقع\n[حدد التنسيق المطلوب]'
                : '\n\n## Expected Output\n[Specify desired format]';
            improved += outputSection;
        }

        // Add constraints section
        if (addConstraints) {
            const constraintsSection = isArabic
                ? '\n\n## القيود\n- '
                : '\n\n## Constraints\n- ';
            improved += constraintsSection;
        }

        return improved;
    },

    /**
     * Analyze prompt structure
     * @param {string} text - Prompt text
     * @returns {object} Analysis result
     */
    analyzePromptStructure(text) {
        if (!text) {
            return { score: 0, suggestions: [], wordCount: 0 };
        }

        const lower = text.toLowerCase();
        const analysis = {
            hasContext: /context|background|given|سياق|خلفية/i.test(lower),
            hasInstructions: /instructions?|steps?|تعليمات|خطوات/i.test(lower),
            hasExamples: /example|sample|نموذج|مثال/i.test(lower),
            hasOutputFormat: /output|format|result|إخراج|تنسيق|نتيجة/i.test(lower),
            hasConstraints: /constraints?|limits?|rules?|قيود|حدود|قواعد/i.test(lower),
            wordCount: this.countWords(text),
            score: 0,
            suggestions: []
        };

        // Calculate score
        let score = 0;
        if (analysis.hasContext) score += 20;
        if (analysis.hasInstructions) score += 25;
        if (analysis.hasExamples) score += 20;
        if (analysis.hasOutputFormat) score += 20;
        if (analysis.hasConstraints) score += 15;

        analysis.score = score;

        // Generate suggestions
        if (!analysis.hasContext) {
            analysis.suggestions.push('Add clear context for better results');
        }
        if (!analysis.hasInstructions) {
            analysis.suggestions.push('Add specific instructions');
        }
        if (!analysis.hasOutputFormat) {
            analysis.suggestions.push('Specify expected output format');
        }
        if (!analysis.hasExamples && analysis.wordCount > 50) {
            analysis.suggestions.push('Consider adding examples');
        }

        return analysis;
    },

    // ============================================
    // Date & Time
    // ============================================

    /**
     * Format date
     * @param {Date|number|string} date - Date to format
     * @param {string} locale - Locale
     * @returns {string} Formatted date
     */
    formatDate(date, locale = 'en-US') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        return d.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format relative time (e.g., "5 minutes ago")
     * @param {Date|number|string} date - Date
     * @param {string} lang - Language (ar/en)
     * @returns {string} Relative time
     */
    formatRelativeTime(date, lang = 'en') {
        const now = Date.now();
        const then = new Date(date).getTime();
        const diff = now - then;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const isArabic = lang === 'ar';

        if (seconds < 60) {
            return isArabic ? 'الآن' : 'Just now';
        }
        if (minutes < 60) {
            return isArabic ? `منذ ${minutes} دقيقة` : `${minutes} min ago`;
        }
        if (hours < 24) {
            return isArabic ? `منذ ${hours} ساعة` : `${hours} hours ago`;
        }
        if (days < 7) {
            return isArabic ? `منذ ${days} يوم` : `${days} days ago`;
        }

        return this.formatDate(date, isArabic ? 'ar-SA' : 'en-US');
    },

    // ============================================
    // Clipboard
    // ============================================

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback for older browsers
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch {
                console.error('Copy failed:', error);
                return false;
            }
        }
    },

    /**
     * Read text from clipboard
     * @returns {Promise<string>} Clipboard text
     */
    async readFromClipboard() {
        try {
            return await navigator.clipboard.readText();
        } catch (error) {
            console.error('Read clipboard failed:', error);
            return '';
        }
    },

    // ============================================
    // Export & Import
    // ============================================

    /**
     * Export data as JSON file
     * @param {object} data - Data to export
     * @param {string} filename - File name
     */
    exportAsJson(data, filename = 'export.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    },

    /**
     * Export data as text file
     * @param {string} text - Text to export
     * @param {string} filename - File name
     */
    exportAsText(text, filename = 'export.txt') {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    },

    /**
     * Read file as text
     * @param {File} file - File to read
     * @returns {Promise<string>} File content
     */
    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    },

    // ============================================
    // Execution Control
    // ============================================

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /**
     * Sleep for specified time
     * @param {number} ms - Milliseconds
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ============================================
    // Validation
    // ============================================

    /**
     * Validate email
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    },

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean}
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Check if value is empty
     * @param {any} value - Value to check
     * @returns {boolean}
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    // ============================================
    // DOM Helpers
    // ============================================

    /**
     * Create HTML element safely
     * @param {string} tag - Tag name
     * @param {object} attrs - Attributes
     * @param {string|HTMLElement|Array} children - Children
     * @returns {HTMLElement}
     */
    createElement(tag, attrs = {}, children = null) {
        const element = document.createElement(tag);

        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                const event = key.substring(2).toLowerCase();
                element.addEventListener(event, value);
            } else if (key === 'dataset' && typeof value === 'object') {
                Object.assign(element.dataset, value);
            } else {
                element.setAttribute(key, value);
            }
        }

        if (children !== null) {
            if (typeof children === 'string') {
                element.textContent = children;
            } else if (children instanceof HTMLElement) {
                element.appendChild(children);
            } else if (Array.isArray(children)) {
                children.forEach(child => {
                    if (typeof child === 'string') {
                        element.appendChild(document.createTextNode(child));
                    } else if (child instanceof HTMLElement) {
                        element.appendChild(child);
                    }
                });
            }
        }

        return element;
    },

    // ============================================
    // Storage Helpers
    // ============================================

    /**
     * Set item in local storage with JSON
     * @param {string} key - Key
     * @param {any} value - Value
     */
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('LocalStorage set error:', error);
        }
    },

    /**
     * Get item from local storage with JSON parse
     * @param {string} key - Key
     * @param {any} defaultValue - Default value
     * @returns {any}
     */
    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('LocalStorage get error:', error);
            return defaultValue;
        }
    }
};

// Default export for compatibility
export default Utils;

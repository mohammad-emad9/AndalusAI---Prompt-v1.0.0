/**
 * Language Support - Multi-language Support
 * AndalusAI - Prompt
 * 
 * @description Comprehensive language and localization system
 * @version 1.0.0
 */

/**
 * @typedef {Object} LanguageConfig
 * @property {string} name - Language name
 * @property {string} nativeName - Native name
 * @property {string} dir - Text direction (rtl/ltr)
 * @property {string} code - Language code
 * @property {string} flag - Flag emoji
 */

/**
 * Main language support object
 */
export const LanguageSupport = {
    // ============================================
    // Supported Languages
    // ============================================

    /** @type {Object.<string, LanguageConfig>} */
    supportedLanguages: {
        ar: {
            name: 'Arabic',
            nativeName: 'العربية',
            dir: 'rtl',
            code: 'ar',
            flag: '🇸🇦',
            dateLocale: 'ar-SA'
        },
        en: {
            name: 'English',
            nativeName: 'English',
            dir: 'ltr',
            code: 'en',
            flag: '🇺🇸',
            dateLocale: 'en-US'
        },
        fr: {
            name: 'French',
            nativeName: 'Français',
            dir: 'ltr',
            code: 'fr',
            flag: '🇫🇷',
            dateLocale: 'fr-FR'
        },
        es: {
            name: 'Spanish',
            nativeName: 'Español',
            dir: 'ltr',
            code: 'es',
            flag: '🇪🇸',
            dateLocale: 'es-ES'
        },
        de: {
            name: 'German',
            nativeName: 'Deutsch',
            dir: 'ltr',
            code: 'de',
            flag: '🇩🇪',
            dateLocale: 'de-DE'
        },
        tr: {
            name: 'Turkish',
            nativeName: 'Türkçe',
            dir: 'ltr',
            code: 'tr',
            flag: '🇹🇷',
            dateLocale: 'tr-TR'
        }
    },

    // ============================================
    // Translations Dictionary
    // ============================================

    translations: {
        ar: {
            // General
            appName: 'أندلس AI - برومبت',
            loading: 'جاري التحميل...',
            error: 'حدث خطأ',
            success: 'تم بنجاح',
            confirm: 'تأكيد',

            // Actions
            actions: {
                search: 'بحث',
                copy: 'نسخ',
                copied: 'تم النسخ!',
                paste: 'لصق',
                save: 'حفظ',
                saved: 'تم الحفظ!',
                cancel: 'إلغاء',
                delete: 'حذف',
                edit: 'تعديل',
                add: 'إضافة',
                close: 'إغلاق',
                clear: 'مسح',
                improve: 'تحسين',
                export: 'تصدير',
                import: 'استيراد',
                reset: 'إعادة تعيين'
            },

            // UI
            ui: {
                settings: 'الإعدادات',
                history: 'السجل',
                favorites: 'المفضلة',
                templates: 'القوالب الجاهزة',
                addTemplate: 'إضافة قالب',
                noResults: 'لا توجد نتائج',
                noData: 'لا توجد بيانات',
                searchPlaceholder: 'ابحث في البرومبتات...',
                promptPlaceholder: 'اكتب البرومبت هنا أو اختر من القوالب...'
            },

            // Categories
            categories: {
                all: 'الكل',
                general: 'عام',
                coding: 'برمجة',
                writing: 'كتابة',
                analysis: 'تحليل',
                creative: 'إبداعي',
                translation: 'ترجمة',
                education: 'تعليم',
                business: 'أعمال'
            },

            // Settings
            settings: {
                language: 'اللغة',
                theme: 'السمة',
                dark: 'داكن',
                light: 'فاتح',
                auto: 'تلقائي',
                autoSave: 'حفظ تلقائي',
                notifications: 'الإشعارات',
                shortcuts: 'الاختصارات',
                data: 'البيانات',
                about: 'حول',
                version: 'الإصدار'
            },

            // Forms
            forms: {
                title: 'العنوان',
                description: 'الوصف',
                category: 'التصنيف',
                content: 'المحتوى',
                tags: 'الوسوم',
                required: 'مطلوب'
            },

            // Messages
            messages: {
                confirmDelete: 'هل أنت متأكد من الحذف؟',
                confirmClear: 'هل أنت متأكد من مسح جميع البيانات؟',
                exportSuccess: 'تم تصدير البيانات بنجاح',
                importSuccess: 'تم استيراد البيانات بنجاح',
                saveSuccess: 'تم الحفظ بنجاح',
                copySuccess: 'تم النسخ إلى الحافظة',
                errorOccurred: 'حدث خطأ، يرجى المحاولة مرة أخرى',
                fillRequired: 'يرجى ملء الحقول المطلوبة'
            },

            // Prompt Improvement
            promptImprovement: {
                addContext: 'أضف سياقاً',
                addExamples: 'أضف أمثلة',
                addConstraints: 'أضف قيوداً',
                addOutput: 'حدد الإخراج',
                analyzing: 'جاري التحليل...',
                score: 'النتيجة',
                suggestions: 'اقتراحات'
            }
        },

        en: {
            // General
            appName: 'AndalusAI - Prompt',
            loading: 'Loading...',
            error: 'An error occurred',
            success: 'Success',
            confirm: 'Confirm',

            // Actions
            actions: {
                search: 'Search',
                copy: 'Copy',
                copied: 'Copied!',
                paste: 'Paste',
                save: 'Save',
                saved: 'Saved!',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                add: 'Add',
                close: 'Close',
                clear: 'Clear',
                improve: 'Improve',
                export: 'Export',
                import: 'Import',
                reset: 'Reset'
            },

            // UI
            ui: {
                settings: 'Settings',
                history: 'History',
                favorites: 'Favorites',
                templates: 'Ready Templates',
                addTemplate: 'Add Template',
                noResults: 'No results',
                noData: 'No data',
                searchPlaceholder: 'Search prompts...',
                promptPlaceholder: 'Type your prompt here or choose from templates...'
            },

            // Categories
            categories: {
                all: 'All',
                general: 'General',
                coding: 'Coding',
                writing: 'Writing',
                analysis: 'Analysis',
                creative: 'Creative',
                translation: 'Translation',
                education: 'Education',
                business: 'Business'
            },

            // Settings
            settings: {
                language: 'Language',
                theme: 'Theme',
                dark: 'Dark',
                light: 'Light',
                auto: 'Auto',
                autoSave: 'Auto Save',
                notifications: 'Notifications',
                shortcuts: 'Shortcuts',
                data: 'Data',
                about: 'About',
                version: 'Version'
            },

            // Forms
            forms: {
                title: 'Title',
                description: 'Description',
                category: 'Category',
                content: 'Content',
                tags: 'Tags',
                required: 'Required'
            },

            // Messages
            messages: {
                confirmDelete: 'Are you sure you want to delete?',
                confirmClear: 'Are you sure you want to clear all data?',
                exportSuccess: 'Data exported successfully',
                importSuccess: 'Data imported successfully',
                saveSuccess: 'Saved successfully',
                copySuccess: 'Copied to clipboard',
                errorOccurred: 'An error occurred, please try again',
                fillRequired: 'Please fill in the required fields'
            },

            // Prompt Improvement
            promptImprovement: {
                addContext: 'Add context',
                addExamples: 'Add examples',
                addConstraints: 'Add constraints',
                addOutput: 'Specify output',
                analyzing: 'Analyzing...',
                score: 'Score',
                suggestions: 'Suggestions'
            }
        }
    },

    // ============================================
    // Current Language Cache
    // ============================================

    _currentLanguage: null,
    _cachedSettings: null,

    // ============================================
    // Main Functions
    // ============================================

    /**
     * Get current language
     * @returns {Promise<string>} Language code
     */
    async getCurrentLanguage() {
        // Use cache if available
        if (this._currentLanguage) {
            return this._currentLanguage;
        }

        try {
            const data = await chrome.storage.sync.get('settings');
            this._currentLanguage = data.settings?.language || 'ar';
            this._cachedSettings = data.settings;
            return this._currentLanguage;
        } catch (error) {
            console.warn('Failed to get language setting:', error);
            return 'ar';
        }
    },

    /**
     * Get current language synchronously (from cache)
     * @returns {string} Language code
     */
    getCurrentLanguageSync() {
        return this._currentLanguage || 'ar';
    },

    /**
     * Update language cache
     * @param {string} lang - Language code
     */
    updateLanguageCache(lang) {
        if (this.supportedLanguages[lang]) {
            this._currentLanguage = lang;
        }
    },

    /**
     * Get translation by nested key
     * @param {string} key - Key (e.g., 'actions.copy')
     * @param {string} [lang] - Language code (optional)
     * @returns {string} Translated text
     * @example
     * LanguageSupport.getText('actions.copy', 'ar'); // "نسخ"
     */
    getText(key, lang = null) {
        const currentLang = lang || this.getCurrentLanguageSync();
        const keys = key.split('.');

        let result = this.translations[currentLang];

        for (const k of keys) {
            if (result && typeof result === 'object') {
                result = result[k];
            } else {
                // Fallback to English
                result = this._getFromFallback(keys);
                break;
            }
        }

        return result || key;
    },

    /**
     * Get text from fallback language (English)
     * @private
     */
    _getFromFallback(keys) {
        let result = this.translations['en'];
        for (const k of keys) {
            if (result && typeof result === 'object') {
                result = result[k];
            } else {
                return null;
            }
        }
        return result;
    },

    /**
     * Get all translations for a language
     * @param {string} lang - Language code
     * @returns {object} Translations object
     */
    getAllTranslations(lang) {
        return this.translations[lang] || this.translations['en'];
    },

    /**
     * Set language
     * @param {string} lang - New language code
     * @returns {Promise<boolean>} Success
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages[lang]) {
            console.warn(`Language '${lang}' is not supported`);
            return false;
        }

        try {
            const data = await chrome.storage.sync.get('settings');
            const settings = data.settings || {};
            settings.language = lang;

            await chrome.storage.sync.set({ settings });

            this._currentLanguage = lang;
            this._cachedSettings = settings;

            // Dispatch language change event
            this.dispatchLanguageChange(lang);

            return true;
        } catch (error) {
            console.error('Failed to set language:', error);
            return false;
        }
    },

    /**
     * Dispatch language change event
     * @param {string} lang - Language code
     */
    dispatchLanguageChange(lang) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('languageChange', {
                detail: { language: lang, config: this.supportedLanguages[lang] }
            }));
        }
    },

    /**
     * Get text direction for language
     * @param {string} [lang] - Language code
     * @returns {string} 'rtl' or 'ltr'
     */
    getDirection(lang = null) {
        const currentLang = lang || this.getCurrentLanguageSync();
        return this.supportedLanguages[currentLang]?.dir || 'ltr';
    },

    /**
     * Get language configuration
     * @param {string} [lang] - Language code
     * @returns {LanguageConfig|null}
     */
    getLanguageConfig(lang = null) {
        const currentLang = lang || this.getCurrentLanguageSync();
        return this.supportedLanguages[currentLang] || null;
    },

    /**
     * Get list of available languages
     * @returns {Array<{code: string, name: string, nativeName: string}>}
     */
    getAvailableLanguages() {
        return Object.entries(this.supportedLanguages).map(([code, config]) => ({
            code,
            name: config.name,
            nativeName: config.nativeName,
            flag: config.flag
        }));
    },

    /**
     * Check if language is supported
     * @param {string} lang - Language code
     * @returns {boolean}
     */
    isSupported(lang) {
        return !!this.supportedLanguages[lang];
    },

    /**
     * Detect browser language
     * @returns {string} Closest supported language code
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const langCode = browserLang.split('-')[0].toLowerCase();

        return this.supportedLanguages[langCode] ? langCode : 'en';
    },

    /**
     * Apply text direction to element
     * @param {HTMLElement} element - Element
     * @param {string} [lang] - Language code
     */
    applyDirection(element, lang = null) {
        if (!element) return;

        const dir = this.getDirection(lang);
        element.setAttribute('dir', dir);
        element.style.direction = dir;
        element.style.textAlign = dir === 'rtl' ? 'right' : 'left';
    },

    /**
     * Initialize language on startup
     * @returns {Promise<string>} Initialized language
     */
    async initialize() {
        const lang = await this.getCurrentLanguage();

        // Apply direction to document
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', lang);
            document.documentElement.setAttribute('dir', this.getDirection(lang));
        }

        return lang;
    }
};

// Default export for compatibility
export default LanguageSupport;

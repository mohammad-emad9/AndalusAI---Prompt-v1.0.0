/**
 * Options Script
 * AndalusAI - Prompt
 * 
 * @description Manages the extension settings page
 * @version 1.0.0
 */

// ============================================
// State
// ============================================

const state = {
    settings: null,
    originalSettings: null,
    hasChanges: false
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadSettings();
        populateForm();
        setupEventListeners();
        checkForChanges();
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Error loading settings', 'error');
    }
});

// ============================================
// Settings Loading & Saving
// ============================================

/**
 * Load settings from storage
 */
async function loadSettings() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
        state.settings = response.settings || getDefaultSettings();
        state.originalSettings = JSON.parse(JSON.stringify(state.settings));
    } catch (error) {
        console.error('Error loading settings:', error);
        state.settings = getDefaultSettings();
        state.originalSettings = JSON.parse(JSON.stringify(state.settings));
    }
}

/**
 * Get default settings
 */
function getDefaultSettings() {
    return {
        language: 'ar',
        theme: 'dark',
        autoSave: true,
        notifications: true,
        useAI: true,
        apiKey: ''
    };
}

/**
 * Populate form with settings
 */
function populateForm() {
    setElementValue('language', state.settings.language);
    setElementValue('theme', state.settings.theme);
    setElementChecked('autoSave', state.settings.autoSave);
    setElementChecked('notifications', state.settings.notifications);
    setElementChecked('useAI', state.settings.useAI !== false);
    setElementValue('apiKey', state.settings.apiKey || '');
}

/**
 * Collect form values
 */
function collectFormValues() {
    return {
        language: getElementValue('language'),
        theme: getElementValue('theme'),
        autoSave: getElementChecked('autoSave'),
        notifications: getElementChecked('notifications'),
        useAI: getElementChecked('useAI'),
        apiKey: getElementValue('apiKey'),
        // Preserve other settings
        shortcuts: state.settings.shortcuts,
        categories: state.settings.categories
    };
}

/**
 * Save settings
 */
async function saveSettings() {
    try {
        const newSettings = collectFormValues();

        await chrome.runtime.sendMessage({
            action: 'saveSettings',
            settings: newSettings
        });

        state.settings = newSettings;
        state.originalSettings = JSON.parse(JSON.stringify(newSettings));
        state.hasChanges = false;

        updateSaveButton();
        showNotification('Settings saved successfully! ✓');

        // Apply changes immediately
        applySettings(newSettings);

    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings', 'error');
    }
}

/**
 * Apply settings
 */
function applySettings(settings) {
    // Apply language
    document.documentElement.setAttribute('lang', settings.language);
    document.documentElement.setAttribute('dir', settings.language === 'ar' ? 'rtl' : 'ltr');

    // Apply theme (can be extended later)
    document.body.setAttribute('data-theme', settings.theme);
}

// ============================================
// Event Listeners
// ============================================

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Save settings
    getEl('saveBtn')?.addEventListener('click', saveSettings);

    // Export data
    getEl('exportBtn')?.addEventListener('click', exportData);

    // Import data
    getEl('importBtn')?.addEventListener('click', importData);

    // Clear data
    getEl('clearBtn')?.addEventListener('click', clearAllData);

    // Watch for changes
    const formElements = ['language', 'theme', 'autoSave', 'notifications', 'useAI', 'apiKey'];
    formElements.forEach(id => {
        getEl(id)?.addEventListener('change', () => {
            checkForChanges();
        });
        // Also listen for input on text fields
        if (id === 'apiKey') {
            getEl(id)?.addEventListener('input', () => {
                checkForChanges();
            });
        }
    });

    // Toggle password visibility
    getEl('togglePassword')?.addEventListener('click', () => {
        const apiKeyInput = getEl('apiKey');
        const btn = getEl('togglePassword');
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            btn.textContent = '🙈';
        } else {
            apiKeyInput.type = 'password';
            btn.textContent = '👁';
        }
    });

    // Warn before leaving with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        if (state.hasChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

/**
 * Check for changes
 */
function checkForChanges() {
    const currentValues = collectFormValues();
    state.hasChanges = JSON.stringify(currentValues) !== JSON.stringify(state.originalSettings);
    updateSaveButton();
}

/**
 * Update save button state
 */
function updateSaveButton() {
    const btn = getEl('saveBtn');
    if (btn) {
        btn.disabled = !state.hasChanges;
        btn.style.opacity = state.hasChanges ? '1' : '0.5';
    }
}

// ============================================
// Export & Import
// ============================================

/**
 * Export all data
 */
async function exportData() {
    try {
        showNotification('Exporting...');

        const response = await chrome.runtime.sendMessage({ action: 'exportData' });

        if (response.error) {
            throw new Error(response.error);
        }

        // Add settings to export
        const exportData = {
            ...response,
            settings: state.settings
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().split('T')[0];
        const link = document.createElement('a');
        link.href = url;
        link.download = `andalusai-prompt-backup-${timestamp}.json`;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 100);

        showNotification('Data exported successfully! 📤');

    } catch (error) {
        console.error('Export error:', error);
        showNotification('Error exporting data', 'error');
    }
}

/**
 * Import data
 */
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            showNotification('Importing...');

            const text = await file.text();
            const data = JSON.parse(text);

            // Validate data
            if (!data.prompts && !data.settings) {
                throw new Error('Invalid file');
            }

            // Import prompts
            if (data.prompts || data.favorites || data.history) {
                await chrome.runtime.sendMessage({
                    action: 'importData',
                    data: data,
                    merge: true
                });
            }

            // Import settings
            if (data.settings) {
                await chrome.runtime.sendMessage({
                    action: 'saveSettings',
                    settings: data.settings
                });
                state.settings = data.settings;
                state.originalSettings = JSON.parse(JSON.stringify(data.settings));
                populateForm();
            }

            showNotification('Data imported successfully! 📥');

        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error importing data: ' + error.message, 'error');
        }
    };

    input.click();
}

/**
 * Clear all data
 */
async function clearAllData() {
    const confirmed = confirm(
        '⚠️ Warning!\n\n' +
        'This will delete all data including:\n' +
        '• All custom templates\n' +
        '• Favorites list\n' +
        '• Prompt history\n' +
        '• Settings\n\n' +
        'Are you sure you want to continue?'
    );

    if (!confirmed) return;

    // Double confirmation
    const doubleConfirm = confirm('Are you absolutely sure? This cannot be undone.');

    if (!doubleConfirm) return;

    try {
        // Clear storage
        await chrome.storage.sync.clear();
        await chrome.storage.local.clear();

        // Reset to default settings
        const defaultSettings = getDefaultSettings();
        await chrome.runtime.sendMessage({
            action: 'saveSettings',
            settings: defaultSettings
        });

        state.settings = defaultSettings;
        state.originalSettings = JSON.parse(JSON.stringify(defaultSettings));
        populateForm();

        showNotification('All data cleared! 🗑️');

    } catch (error) {
        console.error('Clear error:', error);
        showNotification('Error clearing data', 'error');
    }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get element by ID
 */
function getEl(id) {
    return document.getElementById(id);
}

/**
 * Set element value
 */
function setElementValue(id, value) {
    const el = getEl(id);
    if (el) el.value = value;
}

/**
 * Get element value
 */
function getElementValue(id) {
    return getEl(id)?.value || '';
}

/**
 * Set checkbox state
 */
function setElementChecked(id, checked) {
    const el = getEl(id);
    if (el) el.checked = checked !== false;
}

/**
 * Get checkbox state
 */
function getElementChecked(id) {
    return getEl(id)?.checked || false;
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.settings-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'settings-notification';
    notification.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: ${type === 'error' ? '#ef4444' : 'linear-gradient(135deg, #6c5ce7, #a855f7)'};
    color: white;
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s ease;
  `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Fade in animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Fade out after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

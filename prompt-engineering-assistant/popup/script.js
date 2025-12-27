/**
 * Popup Script
 * AndalusAI - Prompt
 * 
 * @description Manages the popup window UI
 * @version 1.0.0
 */

// ============================================
// State
// ============================================

const state = {
    currentCategory: 'all',
    templates: [],
    favorites: [],
    settings: null,
    language: 'ar',
    searchQuery: ''
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadSettings();
        await Promise.all([loadTemplates(), loadFavorites()]);
        setupEventListeners();
        renderTemplates();
        renderFavorites();
        applyLanguage();
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Loading error', 'error');
    }
});

// ============================================
// Data Loading
// ============================================

/**
 * Load settings
 */
async function loadSettings() {
    try {
        const response = await sendMessage({ action: 'getSettings' });
        state.settings = response.settings || {};
        state.language = state.settings.language || 'ar';
    } catch (error) {
        console.warn('Failed to load settings:', error);
    }
}

/**
 * Load templates
 */
async function loadTemplates() {
    try {
        const response = await sendMessage({
            action: 'getPrompts',
            options: { sortBy: 'createdAt', sortOrder: 'desc' }
        });
        state.templates = response.prompts || [];
    } catch (error) {
        console.warn('Failed to load templates:', error);
        state.templates = [];
    }
}

/**
 * Load favorites
 */
async function loadFavorites() {
    try {
        const response = await sendMessage({ action: 'getFavorites' });
        state.favorites = Array.isArray(response) ? response : (response.favorites || []);
    } catch (error) {
        console.warn('Failed to load favorites:', error);
        state.favorites = [];
    }
}

// ============================================
// Event Listeners
// ============================================

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search with debounce
    const searchInput = getEl('searchInput');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.searchQuery = e.target.value.trim();
            renderTemplates();
        }, 300);
    });

    // Categories
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.category-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            state.currentCategory = btn.dataset.category;
            renderTemplates();
        });
    });

    // Input buttons
    getEl('clearBtn')?.addEventListener('click', () => {
        const input = getEl('promptInput');
        if (input) {
            input.value = '';
            input.focus();
        }
    });

    getEl('copyBtn')?.addEventListener('click', async () => {
        const text = getEl('promptInput')?.value;
        if (text) {
            await copyToClipboard(text);
            showToast(getText('copied'));

            // Add to history
            await sendMessage({ action: 'addToHistory', text });
        }
    });

    getEl('improveBtn')?.addEventListener('click', async () => {
        const input = getEl('promptInput');
        const btn = getEl('improveBtn');
        const text = input?.value;

        if (!text) {
            showToast(state.language === 'ar' ? 'اكتب نصاً أولاً' : 'Enter text first', 'error');
            return;
        }

        // Show loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳';
        btn.disabled = true;

        try {
            const response = await sendMessage({
                action: 'improvePromptText',
                text,
                options: { language: state.language }
            });

            if (response.improved) {
                input.value = response.improved;

                // Show AI badge if used AI
                if (response.usedAI) {
                    showToast(state.language === 'ar' ? '✨ تم التحسين بالذكاء الاصطناعي!' : '✨ Improved with AI!');
                } else {
                    showToast(getText('improved'));
                }
            } else if (response.error || response.aiError) {
                showToast(response.aiError || response.error, 'error');
            }
        } catch (error) {
            console.error('Improvement error:', error);
            showToast(state.language === 'ar' ? 'حدث خطأ' : 'Error occurred', 'error');
        } finally {
            // Restore button
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // Add template
    getEl('addTemplateBtn')?.addEventListener('click', openAddTemplateModal);
    getEl('closeModalBtn')?.addEventListener('click', closeModal);
    getEl('cancelTemplateBtn')?.addEventListener('click', closeModal);
    getEl('saveTemplateBtn')?.addEventListener('click', saveNewTemplate);

    // Settings
    getEl('settingsBtn')?.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // History
    getEl('historyBtn')?.addEventListener('click', showHistoryMenu);

    // Close modal on outside click
    getEl('addTemplateModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'addTemplateModal') closeModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ============================================
// Rendering
// ============================================

/**
 * Render templates
 */
function renderTemplates() {
    const container = getEl('templatesList');
    if (!container) return;

    let filtered = [...state.templates];

    // Filter by category
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(t => t.category === state.currentCategory);
    }

    // Filter by search
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(query) ||
            t.text.toLowerCase().includes(query) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    }

    // Show empty state
    if (filtered.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">${getText('noTemplates')}</div>
      </div>
    `;
        return;
    }

    // Render templates
    container.innerHTML = filtered.map(template => `
    <div class="template-card" data-id="${escapeHtml(template.id)}">
      <div class="template-info">
        <div class="template-title">${escapeHtml(template.title)}</div>
        <div class="template-preview">${escapeHtml(truncate(template.text, 60))}</div>
      </div>
      <div class="template-meta">
        <span class="template-category">${getCategoryLabel(template.category)}</span>
        <div class="template-actions">
          <button class="template-action-btn favorite" title="Favorite" data-action="favorite">
            ${state.favorites.some(f => f.id === template.id) ? '★' : '☆'}
          </button>
          ${!template.isDefault ? `
            <button class="template-action-btn delete" title="Delete" data-action="delete">🗑</button>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

    // Click events
    container.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.template-action-btn');

            if (actionBtn) {
                e.stopPropagation();
                const action = actionBtn.dataset.action;
                const id = card.dataset.id;

                if (action === 'favorite') toggleFavorite(id);
                if (action === 'delete') deleteTemplate(id);
            } else {
                const id = card.dataset.id;
                const template = state.templates.find(t => t.id === id);
                if (template) {
                    getEl('promptInput').value = template.text;
                    showToast(getText('templateLoaded'));
                }
            }
        });
    });
}

/**
 * Render favorites
 */
function renderFavorites() {
    const container = getEl('favoritesList');
    const section = getEl('favoritesSection');

    if (!container || !section) return;

    if (state.favorites.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    container.innerHTML = state.favorites.map(fav => `
    <div class="template-card" data-id="${escapeHtml(fav.id)}">
      <div class="template-info">
        <div class="template-title">⭐ ${escapeHtml(fav.title)}</div>
        <div class="template-preview">${escapeHtml(truncate(fav.text, 50))}</div>
      </div>
    </div>
  `).join('');

    container.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const fav = state.favorites.find(f => f.id === id);
            if (fav) {
                getEl('promptInput').value = fav.text;
            }
        });
    });
}

// ============================================
// Template Actions
// ============================================

/**
 * Toggle favorite status
 */
async function toggleFavorite(id) {
    const template = state.templates.find(t => t.id === id);
    if (!template) return;

    const isFavorite = state.favorites.some(f => f.id === id);

    try {
        if (isFavorite) {
            await sendMessage({ action: 'removeFromFavorites', id });
            state.favorites = state.favorites.filter(f => f.id !== id);
            showToast('Removed from favorites');
        } else {
            await sendMessage({ action: 'addToFavorites', prompt: template });
            state.favorites.unshift(template);
            showToast('Added to favorites');
        }

        renderTemplates();
        renderFavorites();
    } catch (error) {
        showToast('Error updating favorites', 'error');
    }
}

/**
 * Delete template
 */
async function deleteTemplate(id) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
        await sendMessage({ action: 'deletePrompt', id });
        state.templates = state.templates.filter(t => t.id !== id);
        showToast('Template deleted');
        renderTemplates();
    } catch (error) {
        showToast('Error deleting template', 'error');
    }
}

// ============================================
// Add Template Modal
// ============================================

function openAddTemplateModal() {
    getEl('addTemplateModal')?.classList.add('active');
    getEl('templateTitle')?.focus();
}

function closeModal() {
    const modal = getEl('addTemplateModal');
    if (modal) {
        modal.classList.remove('active');
        // Clear fields
        getEl('templateTitle').value = '';
        getEl('templateText').value = '';
        getEl('templateCategory').value = 'general';
    }
}

async function saveNewTemplate() {
    const title = getEl('templateTitle')?.value.trim();
    const category = getEl('templateCategory')?.value;
    const text = getEl('templateText')?.value.trim();

    if (!title || !text) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        const response = await sendMessage({
            action: 'savePrompt',
            prompt: { title, category, text }
        });

        if (response.success) {
            closeModal();
            await loadTemplates();
            renderTemplates();
            showToast('Template saved successfully! ✓');
        } else {
            showToast(response.error || 'Save error', 'error');
        }
    } catch (error) {
        showToast('Error saving template', 'error');
    }
}

// ============================================
// History
// ============================================

async function showHistoryMenu() {
    try {
        const response = await sendMessage({ action: 'getHistory', limit: 10 });
        const history = response.promptHistory || response || [];

        if (history.length === 0) {
            showToast('No history');
            return;
        }

        // Create dropdown
        const existing = document.querySelector('.history-dropdown');
        if (existing) existing.remove();

        const dropdown = document.createElement('div');
        dropdown.className = 'history-dropdown';
        dropdown.style.cssText = `
      position: absolute;
      top: 50px;
      right: 60px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 8px;
      z-index: 1000;
      max-width: 300px;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.style.cssText = `
        padding: 10px 12px;
        cursor: pointer;
        border-radius: 8px;
        font-size: 13px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
            historyItem.textContent = truncate(item.text, 40);
            historyItem.addEventListener('click', () => {
                getEl('promptInput').value = item.text;
                dropdown.remove();
                showToast('Loaded from history');
            });
            historyItem.addEventListener('mouseenter', () => {
                historyItem.style.background = 'var(--bg-hover)';
            });
            historyItem.addEventListener('mouseleave', () => {
                historyItem.style.background = 'transparent';
            });
            dropdown.appendChild(historyItem);
        });

        document.body.appendChild(dropdown);

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 100);

    } catch (error) {
        showToast('Error loading history', 'error');
    }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Send message to background
 */
function sendMessage(message) {
    return chrome.runtime.sendMessage(message);
}

/**
 * Get element by ID
 */
function getEl(id) {
    return document.getElementById(id);
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Truncate text
 */
function truncate(text, max = 100) {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '...' : text;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get category label
 */
function getCategoryLabel(category) {
    const labels = {
        general: 'General',
        coding: 'Coding',
        writing: 'Writing',
        analysis: 'Analysis',
        creative: 'Creative',
        translation: 'Translation',
        education: 'Education',
        business: 'Business'
    };
    return labels[category] || category;
}

/**
 * Get translated text
 */
function getText(key) {
    const texts = {
        ar: {
            copied: 'تم النسخ بنجاح! ✓',
            improved: 'تم تحسين البرومبت! ✨',
            noTemplates: 'لا توجد قوالب',
            templateLoaded: 'تم تحميل القالب'
        },
        en: {
            copied: 'Copied successfully! ✓',
            improved: 'Prompt improved! ✨',
            noTemplates: 'No templates',
            templateLoaded: 'Template loaded'
        }
    };
    return texts[state.language]?.[key] || texts['en'][key] || key;
}

/**
 * Apply language settings
 */
function applyLanguage() {
    document.documentElement.setAttribute('lang', state.language);
    document.documentElement.setAttribute('dir', state.language === 'ar' ? 'rtl' : 'ltr');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = getEl('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

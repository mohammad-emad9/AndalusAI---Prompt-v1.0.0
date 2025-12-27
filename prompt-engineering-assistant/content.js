/**
 * Content Script
 * AndalusAI - Prompt
 * 
 * @description Runs on all web pages and provides user interfaces
 * @version 1.0.0
 */

(function () {
  'use strict';

  // ============================================
  // State and Settings
  // ============================================

  const state = {
    currentLanguage: 'ar',
    isOverlayVisible: false,
    overlayElement: null,
    settings: null,
    initialized: false
  };

  // CSS Constants
  const OVERLAY_ID = 'prompt-assistant-overlay';
  const COLORS = {
    primary: '#6c5ce7',
    primaryLight: '#a855f7',
    bgPrimary: '#1a1a2e',
    bgSecondary: '#16213e',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#ef4444',
    success: '#10b981'
  };

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize the script
   */
  async function initialize() {
    if (state.initialized) return;

    try {
      await loadSettings();
      setupEventListeners();
      state.initialized = true;
      console.log('AndalusAI - Prompt content script loaded');
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    try {
      const data = await chrome.storage.sync.get('settings');
      state.settings = data.settings || {};
      state.currentLanguage = state.settings.language || 'ar';
    } catch (error) {
      console.warn('Failed to load settings:', error);
      state.currentLanguage = 'ar';
    }
  }

  // ============================================
  // Event Listeners
  // ============================================

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Messages from background script
    chrome.runtime.onMessage.addListener(handleMessage);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown);

    // Settings changes
    chrome.storage.onChanged.addListener(handleStorageChange);
  }

  /**
   * Handle incoming messages
   */
  function handleMessage(message, sender, sendResponse) {
    const handlers = {
      improvePrompt: () => showImproveDialog(message.text),
      showTemplateSelector: () => showTemplateSelector(),
      insertPrompt: () => insertTextAtCursor(message.text),
      showQuickInsert: () => showQuickPromptDialog(),
      showAnalysis: () => showAnalysisDialog(message.text, message.analysis),
      copyToClipboard: () => copyToClipboard(message.text)
    };

    const handler = handlers[message.action];
    if (handler) {
      handler();
      sendResponse({ success: true });
    } else {
      sendResponse({ error: 'Unknown action' });
    }

    return true;
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(event) {
    // Ctrl+Shift+P - Open quick prompt
    if (event.ctrlKey && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      showQuickPromptDialog();
    }

    // Escape - Close dialog
    if (event.key === 'Escape' && state.isOverlayVisible) {
      hideOverlay();
    }
  }

  /**
   * Handle storage changes
   */
  function handleStorageChange(changes, areaName) {
    if (areaName === 'sync' && changes.settings) {
      state.settings = changes.settings.newValue;
      state.currentLanguage = state.settings?.language || 'ar';
    }
  }

  // ============================================
  // Safe Element Creation
  // ============================================

  /**
   * Create HTML element safely
   * @param {string} tag - Element type
   * @param {object} attrs - Attributes
   * @param {Array|string|HTMLElement} children - Content
   * @returns {HTMLElement}
   */
  function createElement(tag, attrs = {}, children = null) {
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
      appendChildren(element, children);
    }

    return element;
  }

  /**
   * Append children to element
   */
  function appendChildren(parent, children) {
    if (typeof children === 'string') {
      parent.textContent = children;
    } else if (children instanceof HTMLElement) {
      parent.appendChild(children);
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          parent.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
          parent.appendChild(child);
        }
      });
    }
  }

  // ============================================
  // Unified Dialog System
  // ============================================

  /**
   * Create base overlay
   * @returns {HTMLElement}
   */
  function createOverlay() {
    if (state.overlayElement) {
      state.overlayElement.remove();
    }

    const isRTL = state.currentLanguage === 'ar';

    state.overlayElement = createElement('div', {
      id: OVERLAY_ID,
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: '999999',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        direction: isRTL ? 'rtl' : 'ltr'
      },
      onClick: (e) => {
        if (e.target === state.overlayElement) hideOverlay();
      }
    });

    // Add styles
    const style = createElement('style', {}, getDialogStyles());
    state.overlayElement.appendChild(style);

    try {
      document.body.appendChild(state.overlayElement);
      state.isOverlayVisible = true;
    } catch (error) {
      console.warn('Could not append overlay:', error);
      return null;
    }

    return state.overlayElement;
  }

  /**
   * Create unified dialog
   * @param {object} options - Dialog options
   * @returns {HTMLElement}
   */
  function createDialog(options) {
    const {
      title,
      icon = '🤖',
      content,
      actions = [],
      width = '500px'
    } = options;

    const overlay = createOverlay();
    if (!overlay) return null;

    // Dialog container
    const dialog = createElement('div', {
      className: 'pa-dialog',
      style: { maxWidth: width }
    });

    // Header
    const header = createElement('div', { className: 'pa-header' }, [
      createElement('h3', { className: 'pa-title' }, [
        createElement('span', {}, icon + ' '),
        createElement('span', {}, title)
      ]),
      createElement('button', {
        className: 'pa-close',
        onClick: hideOverlay
      }, '×')
    ]);

    dialog.appendChild(header);

    // Content
    const contentDiv = createElement('div', { className: 'pa-content' });
    if (typeof content === 'function') {
      content(contentDiv);
    } else if (content instanceof HTMLElement) {
      contentDiv.appendChild(content);
    }
    dialog.appendChild(contentDiv);

    // Actions
    if (actions.length > 0) {
      const actionsDiv = createElement('div', { className: 'pa-actions' });
      actions.forEach(action => {
        const btn = createElement('button', {
          className: `pa-btn ${action.primary ? 'pa-btn-primary' : 'pa-btn-secondary'}`,
          onClick: action.onClick
        }, action.label);
        actionsDiv.appendChild(btn);
      });
      dialog.appendChild(actionsDiv);
    }

    overlay.appendChild(dialog);
    return dialog;
  }

  /**
   * Hide overlay
   */
  function hideOverlay() {
    if (state.overlayElement) {
      state.overlayElement.remove();
      state.overlayElement = null;
    }
    state.isOverlayVisible = false;
  }

  /**
   * Get dialog styles
   */
  function getDialogStyles() {
    return `
      .pa-dialog {
        background: linear-gradient(135deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%);
        border-radius: 16px;
        padding: 0;
        min-width: 400px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        border: 1px solid ${COLORS.border};
        animation: paSlideIn 0.3s ease-out;
        overflow: hidden;
      }
      @keyframes paSlideIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pa-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid ${COLORS.border};
      }
      .pa-title {
        color: ${COLORS.textPrimary};
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pa-close {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: ${COLORS.textPrimary};
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pa-close:hover { background: rgba(239, 68, 68, 0.3); }
      .pa-content { padding: 24px; color: ${COLORS.textSecondary}; }
      .pa-textarea {
        width: 100%;
        min-height: 150px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        padding: 16px;
        color: ${COLORS.textPrimary};
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
        line-height: 1.6;
        box-sizing: border-box;
      }
      .pa-textarea:focus { outline: none; border-color: ${COLORS.primary}; }
      .pa-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        padding: 16px 24px;
        border-top: 1px solid ${COLORS.border};
        background: rgba(0, 0, 0, 0.2);
      }
      .pa-btn {
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pa-btn-primary {
        background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight});
        color: ${COLORS.textPrimary};
      }
      .pa-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(108, 92, 231, 0.4); }
      .pa-btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: ${COLORS.textPrimary};
      }
      .pa-btn-secondary:hover { background: rgba(255, 255, 255, 0.2); }
      .pa-templates-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        max-height: 350px;
        overflow-y: auto;
      }
      .pa-template-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pa-template-card:hover {
        background: rgba(108, 92, 231, 0.2);
        border-color: ${COLORS.primary};
        transform: translateX(-3px);
      }
      .pa-template-title {
        color: ${COLORS.textPrimary};
        font-weight: 600;
        margin-bottom: 6px;
        font-size: 14px;
      }
      .pa-template-desc {
        color: ${COLORS.textSecondary};
        font-size: 12px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .pa-analysis-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid ${COLORS.border};
      }
      .pa-analysis-label { color: ${COLORS.textSecondary}; }
      .pa-analysis-value { color: ${COLORS.textPrimary}; font-weight: 500; }
      .pa-analysis-score {
        font-size: 48px;
        font-weight: 700;
        text-align: center;
        margin: 20px 0;
        background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .pa-suggestion {
        background: rgba(255, 255, 255, 0.05);
        padding: 10px 14px;
        border-radius: 8px;
        margin-top: 8px;
        font-size: 13px;
        color: ${COLORS.textSecondary};
      }
      .pa-label {
        display: block;
        font-size: 12px;
        color: ${COLORS.textSecondary};
        margin-bottom: 8px;
        font-weight: 500;
      }
    `;
  }

  // ============================================
  // Specific Dialogs
  // ============================================

  /**
   * Show improve prompt dialog
   */
  function showImproveDialog(text) {
    const isRTL = state.currentLanguage === 'ar';
    let textarea;

    createDialog({
      title: isRTL ? 'تحسين البرومبت' : 'Improve Prompt',
      icon: '✨',
      width: '550px',
      content: (container) => {
        const label = createElement('label', { className: 'pa-label' },
          isRTL ? 'قم بتحرير البرومبت:' : 'Edit the prompt:'
        );
        container.appendChild(label);

        textarea = createElement('textarea', {
          className: 'pa-textarea',
          style: { direction: isRTL ? 'rtl' : 'ltr' }
        }, text);
        container.appendChild(textarea);
      },
      actions: [
        {
          label: isRTL ? 'إلغاء' : 'Cancel',
          onClick: hideOverlay
        },
        {
          label: '📋 ' + (isRTL ? 'نسخ' : 'Copy'),
          onClick: () => {
            copyToClipboard(textarea.value);
            showNotification(isRTL ? 'تم النسخ!' : 'Copied!');
          }
        },
        {
          label: '✓ ' + (isRTL ? 'تطبيق' : 'Apply'),
          primary: true,
          onClick: () => {
            insertTextAtCursor(textarea.value);
            hideOverlay();
          }
        }
      ]
    });

    // Focus textarea
    setTimeout(() => textarea?.focus(), 100);
  }

  /**
   * Show template selector dialog
   */
  async function showTemplateSelector() {
    const isRTL = state.currentLanguage === 'ar';

    // Fetch templates
    let templates = [];
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getPrompts' });
      templates = response.prompts || [];
    } catch (error) {
      templates = getDefaultTemplates();
    }

    createDialog({
      title: isRTL ? 'اختر قالباً' : 'Select Template',
      icon: '📝',
      width: '600px',
      content: (container) => {
        const grid = createElement('div', { className: 'pa-templates-grid' });

        templates.forEach(template => {
          const card = createElement('div', {
            className: 'pa-template-card',
            onClick: () => {
              insertTextAtCursor(template.text);
              hideOverlay();
            }
          }, [
            createElement('div', { className: 'pa-template-title' }, template.title),
            createElement('div', { className: 'pa-template-desc' },
              template.text.substring(0, 80) + '...'
            )
          ]);
          grid.appendChild(card);
        });

        container.appendChild(grid);
      },
      actions: [
        {
          label: isRTL ? 'إغلاق' : 'Close',
          onClick: hideOverlay
        }
      ]
    });
  }

  /**
   * Show quick prompt dialog
   */
  function showQuickPromptDialog() {
    const isRTL = state.currentLanguage === 'ar';
    let textarea;

    createDialog({
      title: isRTL ? 'برومبت سريع' : 'Quick Prompt',
      icon: '⚡',
      width: '500px',
      content: (container) => {
        textarea = createElement('textarea', {
          className: 'pa-textarea',
          placeholder: isRTL ? 'اكتب البرومبت هنا...' : 'Type your prompt here...',
          style: { direction: isRTL ? 'rtl' : 'ltr' },
          onKeydown: (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
              insertTextAtCursor(textarea.value);
              hideOverlay();
            }
          }
        });
        container.appendChild(textarea);

        const hint = createElement('div', {
          style: {
            fontSize: '12px',
            color: COLORS.textSecondary,
            marginTop: '10px',
            textAlign: 'center'
          }
        }, isRTL ? 'اضغط Ctrl+Enter للإدراج السريع' : 'Press Ctrl+Enter to quickly insert');
        container.appendChild(hint);
      },
      actions: [
        {
          label: isRTL ? 'إلغاء' : 'Cancel',
          onClick: hideOverlay
        },
        {
          label: '↵ ' + (isRTL ? 'إدراج' : 'Insert'),
          primary: true,
          onClick: () => {
            if (textarea.value.trim()) {
              insertTextAtCursor(textarea.value);
              hideOverlay();
            }
          }
        }
      ]
    });

    setTimeout(() => textarea?.focus(), 100);
  }

  /**
   * Show analysis dialog
   */
  function showAnalysisDialog(text, analysis) {
    const isRTL = state.currentLanguage === 'ar';

    const labels = {
      hasContext: isRTL ? 'يحتوي على سياق' : 'Has Context',
      hasInstructions: isRTL ? 'يحتوي على تعليمات' : 'Has Instructions',
      hasExamples: isRTL ? 'يحتوي على أمثلة' : 'Has Examples',
      hasOutputFormat: isRTL ? 'يحدد الإخراج' : 'Specifies Output',
      hasConstraints: isRTL ? 'يحتوي على قيود' : 'Has Constraints',
      wordCount: isRTL ? 'عدد الكلمات' : 'Word Count'
    };

    createDialog({
      title: isRTL ? 'تحليل البرومبت' : 'Prompt Analysis',
      icon: '📊',
      width: '450px',
      content: (container) => {
        // Score
        const scoreDiv = createElement('div', { className: 'pa-analysis-score' },
          analysis.score + '%'
        );
        container.appendChild(scoreDiv);

        // Details
        const details = [
          { key: 'hasContext', value: analysis.hasContext },
          { key: 'hasInstructions', value: analysis.hasInstructions },
          { key: 'hasExamples', value: analysis.hasExamples },
          { key: 'hasOutputFormat', value: analysis.hasOutputFormat },
          { key: 'hasConstraints', value: analysis.hasConstraints },
          { key: 'wordCount', value: analysis.wordCount }
        ];

        details.forEach(item => {
          const row = createElement('div', { className: 'pa-analysis-item' }, [
            createElement('span', { className: 'pa-analysis-label' }, labels[item.key]),
            createElement('span', { className: 'pa-analysis-value' },
              typeof item.value === 'boolean'
                ? (item.value ? '✓' : '✗')
                : item.value.toString()
            )
          ]);
          container.appendChild(row);
        });

        // Suggestions
        if (analysis.suggestions?.length > 0) {
          const suggestionsTitle = createElement('div', {
            style: {
              marginTop: '16px',
              fontWeight: '600',
              color: COLORS.textPrimary
            }
          }, isRTL ? '💡 اقتراحات:' : '💡 Suggestions:');
          container.appendChild(suggestionsTitle);

          analysis.suggestions.forEach(s => {
            container.appendChild(createElement('div', { className: 'pa-suggestion' }, s));
          });
        }
      },
      actions: [
        {
          label: isRTL ? 'إغلاق' : 'Close',
          onClick: hideOverlay
        }
      ]
    });
  }

  // ============================================
  // Helper Functions
  // ============================================

  /**
   * Insert text at cursor position
   */
  function insertTextAtCursor(text) {
    const active = document.activeElement;

    if (active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      const value = active.value;

      active.value = value.substring(0, start) + text + value.substring(end);
      active.selectionStart = active.selectionEnd = start + text.length;
      active.focus();
      active.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (active?.isContentEditable) {
      document.execCommand('insertText', false, text);
    } else {
      copyToClipboard(text);
      showNotification(state.currentLanguage === 'ar'
        ? 'تم النسخ إلى الحافظة!'
        : 'Copied to clipboard!'
      );
    }
  }

  /**
   * Copy to clipboard
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }

  /**
   * Show notification
   */
  function showNotification(message, type = 'success') {
    const existing = document.querySelector('.pa-notification');
    if (existing) existing.remove();

    const notification = createElement('div', {
      className: 'pa-notification',
      style: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: type === 'error'
          ? COLORS.error
          : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
        color: COLORS.textPrimary,
        padding: '14px 24px',
        borderRadius: '10px',
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '9999999',
        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
        animation: 'paFadeIn 0.3s ease-out'
      }
    }, message);

    // Add animation styles
    const style = createElement('style', {}, `
      @keyframes paFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `);
    notification.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }

  /**
   * Get default templates
   */
  function getDefaultTemplates() {
    const isRTL = state.currentLanguage === 'ar';
    return [
      {
        title: isRTL ? 'تحليل نص' : 'Text Analysis',
        text: isRTL
          ? 'قم بتحليل النص التالي وحدد النقاط الرئيسية:\n\n[أدخل النص هنا]'
          : 'Analyze the following text and identify key points:\n\n[Insert text here]'
      },
      {
        title: isRTL ? 'كتابة كود' : 'Write Code',
        text: isRTL
          ? 'اكتب كود [اللغة] لـ:\n\nالمتطلبات:\n- '
          : 'Write [language] code for:\n\nRequirements:\n- '
      },
      {
        title: isRTL ? 'ترجمة' : 'Translation',
        text: isRTL
          ? 'ترجم النص التالي:\n\n[النص]'
          : 'Translate the following text:\n\n[Text]'
      },
      {
        title: isRTL ? 'تلخيص' : 'Summarize',
        text: isRTL
          ? 'قم بتلخيص المحتوى التالي:\n\n[المحتوى]'
          : 'Summarize the following content:\n\n[Content]'
      }
    ];
  }

  // ============================================
  // Start
  // ============================================

  initialize();

})();

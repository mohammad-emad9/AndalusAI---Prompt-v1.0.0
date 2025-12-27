/**
 * Background Service Worker
 * AndalusAI - Prompt
 * 
 * @description Main background service that manages the extension
 * @version 1.0.0
 */

// ============================================
// Constants
// ============================================

const CONTEXT_MENU_IDS = {
  MAIN: 'andalus-prompt-main',
  IMPROVE: 'improve-prompt',
  COPY: 'copy-as-prompt',
  INSERT: 'insert-template',
  ANALYZE: 'analyze-prompt'
};

const DEFAULT_SETTINGS = {
  language: 'ar',
  theme: 'dark',
  autoSave: true,
  notifications: true,
  useAI: true,
  apiKey: '', // User must set their own Groq API key in settings
  shortcuts: {
    openPopup: 'Ctrl+Shift+P',
    quickInsert: 'Ctrl+Shift+I'
  },
  categories: ['general', 'coding', 'writing', 'analysis', 'creative', 'translation', 'education', 'business']
};

// Groq API Configuration
const AI_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const AI_MODEL = 'llama-3.3-70b-versatile';

const STORAGE_KEYS = {
  SETTINGS: 'settings',
  PROMPTS: 'customPrompts',
  FAVORITES: 'favoritePrompts',
  HISTORY: 'promptHistory'
};

// ============================================
// Installation Handler
// ============================================

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`AndalusAI - Prompt installed (${details.reason})`);

  try {
    await createContextMenus();
    await initializeSettings(details.reason === 'install');
    console.log('Extension initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// ============================================
// Context Menus Creation
// ============================================

async function createContextMenus() {
  await chrome.contextMenus.removeAll();

  const settings = await getSettings();
  const isArabic = settings.language === 'ar';

  chrome.contextMenus.create({
    id: CONTEXT_MENU_IDS.MAIN,
    title: '🤖 AndalusAI',
    contexts: ['selection', 'editable']
  });

  chrome.contextMenus.create({
    id: CONTEXT_MENU_IDS.IMPROVE,
    parentId: CONTEXT_MENU_IDS.MAIN,
    title: isArabic ? '✨ تحسين البرومبت' : '✨ Improve Prompt',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: CONTEXT_MENU_IDS.COPY,
    parentId: CONTEXT_MENU_IDS.MAIN,
    title: isArabic ? '📋 نسخ كبرومبت' : '📋 Copy as Prompt',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: CONTEXT_MENU_IDS.ANALYZE,
    parentId: CONTEXT_MENU_IDS.MAIN,
    title: isArabic ? '📊 تحليل البرومبت' : '📊 Analyze Prompt',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: CONTEXT_MENU_IDS.INSERT,
    parentId: CONTEXT_MENU_IDS.MAIN,
    title: isArabic ? '📝 إدراج قالب' : '📝 Insert Template',
    contexts: ['editable']
  });

  console.log('Context menus created');
}

// ============================================
// Settings Management
// ============================================

async function getSettings() {
  try {
    const data = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
    return data[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

async function initializeSettings(isNewInstall) {
  try {
    const existing = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);

    if (isNewInstall || !existing[STORAGE_KEYS.SETTINGS]) {
      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
      console.log('Default settings initialized');
    } else {
      const merged = { ...DEFAULT_SETTINGS, ...existing[STORAGE_KEYS.SETTINGS] };
      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: merged });
    }
  } catch (error) {
    console.error('Settings initialization error:', error);
    await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
  }
}

// ============================================
// Context Menu Click Handlers
// ============================================

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    switch (info.menuItemId) {
      case CONTEXT_MENU_IDS.IMPROVE:
        await sendToTab(tab.id, { action: 'improvePrompt', text: info.selectionText });
        await addToHistory(info.selectionText, 'improve');
        break;

      case CONTEXT_MENU_IDS.COPY:
        await sendToTab(tab.id, { action: 'copyToClipboard', text: formatPrompt(info.selectionText) });
        await addToHistory(info.selectionText, 'copy');
        break;

      case CONTEXT_MENU_IDS.ANALYZE:
        const analysis = analyzePrompt(info.selectionText);
        await sendToTab(tab.id, { action: 'showAnalysis', text: info.selectionText, analysis });
        break;

      case CONTEXT_MENU_IDS.INSERT:
        await sendToTab(tab.id, { action: 'showTemplateSelector' });
        break;
    }
  } catch (error) {
    console.error('Context menu action error:', error);
  }
});

// ============================================
// Message Handling
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch(error => {
      console.error('Message error:', error);
      sendResponse({ error: error.message });
    });
  return true;
});

async function handleMessage(message, sender) {
  const { action } = message;

  switch (action) {
    // Prompts
    case 'getPrompts':
      return await getPrompts(message.category, message.options);
    case 'savePrompt':
      return await savePrompt(message.prompt);
    case 'deletePrompt':
      return await deletePrompt(message.id);
    case 'updatePrompt':
      return await updatePrompt(message.id, message.updates);

    // Favorites
    case 'getFavorites':
      return await getFavorites();
    case 'addToFavorites':
      return await addToFavorites(message.prompt);
    case 'removeFromFavorites':
      return await removeFromFavorites(message.id);

    // History
    case 'getHistory':
      return await getHistory(message.limit);
    case 'addToHistory':
      return await addToHistory(message.text, message.type);
    case 'clearHistory':
      return await clearHistory();

    // Settings
    case 'getSettings':
      const settings = await getSettings();
      return { settings };
    case 'saveSettings':
      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: message.settings });
      await createContextMenus();
      return { success: true };

    // Tools
    case 'improvePromptText':
      return await improvePromptWithAI(message.text, message.options);
    case 'improvePromptWithAI':
      return await improvePromptWithAI(message.text, message.options);
    case 'analyzePrompt':
      return { analysis: analyzePrompt(message.text) };
    case 'formatPrompt':
      return { formatted: formatPrompt(message.text) };
    case 'generateWithAI':
      return await callGeminiAPI(message.prompt, message.systemPrompt);

    // Export & Import
    case 'exportData':
      return await exportAllData();
    case 'importData':
      return await importData(message.data, message.merge);

    default:
      return { error: `Unknown action: ${action}` };
  }
}

// ============================================
// Prompts Management
// ============================================

async function getPrompts(category = null, options = {}) {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEYS.PROMPTS);
    let prompts = [...(data[STORAGE_KEYS.PROMPTS] || []), ...getDefaultPrompts()];

    if (category && category !== 'all') {
      prompts = prompts.filter(p => p.category === category);
    }

    if (options.search) {
      const query = options.search.toLowerCase();
      prompts = prompts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.text.toLowerCase().includes(query)
      );
    }

    prompts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return { prompts, total: prompts.length };
  } catch (error) {
    return { prompts: getDefaultPrompts(), error: error.message };
  }
}

async function savePrompt(prompt) {
  try {
    if (!prompt.title || !prompt.text) {
      return { success: false, error: 'Title and text required' };
    }

    const data = await chrome.storage.local.get(STORAGE_KEYS.PROMPTS);
    const prompts = data[STORAGE_KEYS.PROMPTS] || [];

    const newPrompt = {
      id: generateId(),
      title: prompt.title.trim(),
      text: prompt.text.trim(),
      category: prompt.category || 'general',
      tags: prompt.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    prompts.unshift(newPrompt);
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts });

    return { success: true, id: newPrompt.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deletePrompt(id) {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEYS.PROMPTS);
    const prompts = (data[STORAGE_KEYS.PROMPTS] || []).filter(p => p.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updatePrompt(id, updates) {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEYS.PROMPTS);
    const prompts = data[STORAGE_KEYS.PROMPTS] || [];
    const index = prompts.findIndex(p => p.id === id);

    if (index !== -1) {
      prompts[index] = { ...prompts[index], ...updates, updatedAt: Date.now() };
      await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// Favorites Management
// ============================================

async function getFavorites() {
  try {
    const data = await chrome.storage.sync.get(STORAGE_KEYS.FAVORITES);
    return data[STORAGE_KEYS.FAVORITES] || [];
  } catch (error) {
    return [];
  }
}

async function addToFavorites(prompt) {
  try {
    const favorites = await getFavorites();
    if (!favorites.some(f => f.id === prompt.id)) {
      favorites.unshift({ ...prompt, addedAt: Date.now() });
      await chrome.storage.sync.set({ [STORAGE_KEYS.FAVORITES]: favorites });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function removeFromFavorites(id) {
  try {
    const favorites = (await getFavorites()).filter(f => f.id !== id);
    await chrome.storage.sync.set({ [STORAGE_KEYS.FAVORITES]: favorites });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// History Management
// ============================================

async function getHistory(limit = 20) {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
    const history = data[STORAGE_KEYS.HISTORY] || [];
    return { promptHistory: limit ? history.slice(0, limit) : history };
  } catch (error) {
    return { promptHistory: [] };
  }
}

async function addToHistory(text, type = 'general') {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
    const history = data[STORAGE_KEYS.HISTORY] || [];

    history.unshift({
      id: generateId(),
      text: text,
      type: type,
      timestamp: Date.now()
    });

    // Max 100 items
    while (history.length > 100) history.pop();

    await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: history });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

async function clearHistory() {
  try {
    await chrome.storage.local.remove(STORAGE_KEYS.HISTORY);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ============================================
// Export & Import
// ============================================

async function exportAllData() {
  try {
    const [prompts, favorites, history, settings] = await Promise.all([
      chrome.storage.local.get(STORAGE_KEYS.PROMPTS),
      chrome.storage.sync.get(STORAGE_KEYS.FAVORITES),
      chrome.storage.local.get(STORAGE_KEYS.HISTORY),
      chrome.storage.sync.get(STORAGE_KEYS.SETTINGS)
    ]);

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      prompts: prompts[STORAGE_KEYS.PROMPTS] || [],
      favorites: favorites[STORAGE_KEYS.FAVORITES] || [],
      history: history[STORAGE_KEYS.HISTORY] || [],
      settings: settings[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS
    };
  } catch (error) {
    throw new Error('Export failed: ' + error.message);
  }
}

async function importData(data, merge = true) {
  try {
    if (data.prompts) {
      if (merge) {
        const existing = await chrome.storage.local.get(STORAGE_KEYS.PROMPTS);
        const existingIds = new Set((existing[STORAGE_KEYS.PROMPTS] || []).map(p => p.id));
        const newPrompts = data.prompts.filter(p => !existingIds.has(p.id));
        const all = [...newPrompts, ...(existing[STORAGE_KEYS.PROMPTS] || [])];
        await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: all });
      } else {
        await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: data.prompts });
      }
    }

    if (data.favorites) {
      await chrome.storage.sync.set({ [STORAGE_KEYS.FAVORITES]: data.favorites });
    }

    if (data.settings) {
      await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: data.settings });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// AI Integration - Gemini API
// ============================================

/**
 * Call AI API (Groq)
 * @param {string} prompt - User prompt
 * @param {string} systemPrompt - System instructions
 * @returns {Promise<{text: string, error?: string}>}
 */
async function callAI(prompt, systemPrompt = '') {
  try {
    const settings = await getSettings();
    const apiKey = settings.apiKey || DEFAULT_SETTINGS.apiKey;

    console.log('Calling Groq API...');
    console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'NONE');

    if (!apiKey) {
      return { text: '', error: 'API key not configured' };
    }

    const requestBody = {
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048
    };

    console.log('Sending request to Groq...');

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Groq Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API Error:', errorData);
      return { text: '', error: `API Error: ${response.status} - ${errorData.error?.message || JSON.stringify(errorData)}` };
    }

    const data = await response.json();
    console.log('Groq Response received');

    if (data.choices && data.choices[0]?.message?.content) {
      console.log('AI response success!');
      return { text: data.choices[0].message.content };
    }

    console.warn('No choices in response:', data);
    return { text: '', error: 'No response from AI' };
  } catch (error) {
    console.error('Groq API call failed:', error);
    return { text: '', error: error.message };
  }
}

/**
 * Improve prompt using AI
 * @param {string} text - Original prompt
 * @param {object} options - Options
 * @returns {Promise<{improved: string, error?: string}>}
 */
async function improvePromptWithAI(text, options = {}) {
  if (!text) return { improved: '' };

  const settings = await getSettings();
  const isArabic = options.language === 'ar' || /[\u0600-\u06FF]/.test(text);

  // Get API key from settings or use default
  const apiKey = settings.apiKey || DEFAULT_SETTINGS.apiKey;
  const useAI = settings.useAI !== false; // Default to true

  console.log('AI Settings:', { useAI, hasApiKey: !!apiKey });

  // If AI is disabled or no API key, use template-based improvement
  if (!useAI || !apiKey) {
    console.log('Using template-based improvement');
    return { improved: improvePrompt(text, options) };
  }

  const systemPrompt = isArabic
    ? `أنت خبير في Prompt Engineering. حسّن البرومبت التالي فقط.

مهم جداً:
- لا تكتب المحتوى المطلوب
- لا تجب على البرومبت
- فقط أعد كتابة البرومبت بشكل أفضل

قواعد التحسين:
1. أضف دور واضح (مثل: "أنت كاتب محترف...")
2. أضف المواصفات (الطول، الأسلوب، الهيكل)
3. أضف المتطلبات
4. استخدم ## للعناوين
5. اجعله 5-15 سطر فقط

مثال:
المدخل: "اكتب مقال عن الرياضة"
المخرج الصحيح:
"أنت كاتب متخصص. اكتب مقالاً عن الرياضة.
## المواصفات
- الطول: 500 كلمة
## المطلوب
- محتوى مفيد"

أعد البرومبت المحسّن فقط:`

    : `You are a Prompt Engineering expert. Only improve the prompt below.

IMPORTANT:
- Do NOT write the requested content
- Do NOT answer the prompt
- Only rewrite it better

Rules:
1. Add clear role (e.g., "You are a professional writer...")
2. Add specs (length, style, structure)
3. Add requirements
4. Use ## headings
5. Keep it 5-15 lines only

Example:
Input: "write article about sports"
Correct output:
"You are a specialist writer. Write an article about sports.
## Specs
- Length: 500 words
## Requirements
- Useful content"

Return only the improved prompt:`;

  try {
    const result = await callAI(text, systemPrompt);

    if (result.error) {
      console.warn('AI improvement failed, using template:', result.error);
      return { improved: improvePrompt(text, options), aiError: result.error };
    }

    return { improved: result.text, usedAI: true };
  } catch (error) {
    console.error('AI improvement error:', error);
    return { improved: improvePrompt(text, options), aiError: error.message };
  }
}

// ============================================
// Helper Functions
// ============================================

function generateId() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

function formatPrompt(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n');
}

function improvePrompt(text, options = {}) {
  if (!text) return '';

  const original = text.trim();
  const isArabic = options.language === 'ar' || /[\u0600-\u06FF]/.test(original);

  // Detect prompt type
  const promptType = detectPromptType(original);

  // Build improved prompt based on type
  let improved = '';

  if (isArabic) {
    improved = buildArabicPrompt(original, promptType);
  } else {
    improved = buildEnglishPrompt(original, promptType);
  }

  return improved;
}

function detectPromptType(text) {
  const lower = text.toLowerCase();

  if (/كود|برمج|code|program|function|script|api/i.test(lower)) return 'coding';
  if (/مقال|اكتب|كتابة|write|article|essay|blog/i.test(lower)) return 'writing';
  if (/ترجم|translate|translation/i.test(lower)) return 'translation';
  if (/لخص|تلخيص|summarize|summary/i.test(lower)) return 'summary';
  if (/حلل|تحليل|analyze|analysis/i.test(lower)) return 'analysis';
  if (/أفكار|فكرة|ideas|brainstorm|creative/i.test(lower)) return 'creative';
  if (/شرح|اشرح|explain|clarify/i.test(lower)) return 'explain';

  return 'general';
}

function buildArabicPrompt(original, type) {
  const templates = {
    coding: `أنت مبرمج خبير. ${original}

## المتطلبات
- كود نظيف ومنظم
- تعليقات توضيحية
- معالجة الأخطاء

## الإخراج المتوقع
كود قابل للتنفيذ مع شرح موجز`,

    writing: `أنت كاتب محترف. ${original}

## المواصفات
- الطول: 500-800 كلمة
- الأسلوب: احترافي وجذاب
- الهيكل: مقدمة، محتوى، خاتمة

## المطلوب
- محتوى أصلي ومفيد
- لغة سليمة وواضحة`,

    translation: `أنت مترجم محترف. ${original}

## إرشادات الترجمة
- حافظ على المعنى الأصلي
- راعِ السياق الثقافي
- استخدم مصطلحات مناسبة

## الإخراج
ترجمة دقيقة وطبيعية`,

    summary: `أنت خبير في التلخيص. ${original}

## المطلوب
- ملخص في 3-5 نقاط
- الأفكار الرئيسية فقط
- لغة مختصرة وواضحة`,

    analysis: `أنت محلل خبير. ${original}

## نقاط التحليل
1. الفكرة الرئيسية
2. النقاط الفرعية
3. نقاط القوة والضعف
4. التوصيات`,

    creative: `أنت خبير إبداعي. ${original}

## المطلوب
- 5-10 أفكار مبتكرة
- شرح موجز لكل فكرة
- ترتيب حسب الأولوية`,

    explain: `أنت معلم خبير. ${original}

## طريقة الشرح
- ابدأ بتعريف بسيط
- استخدم أمثلة عملية
- تدرج من السهل للصعب`,

    general: `## المهمة
${original}

## السياق
[أضف السياق هنا]

## الإخراج المتوقع
[حدد التنسيق المطلوب]`
  };

  return templates[type] || templates.general;
}

function buildEnglishPrompt(original, type) {
  const templates = {
    coding: `You are an expert programmer. ${original}

## Requirements
- Clean and organized code
- Explanatory comments
- Error handling

## Expected Output
Executable code with brief explanation`,

    writing: `You are a professional writer. ${original}

## Specifications
- Length: 500-800 words
- Style: Professional and engaging
- Structure: Introduction, body, conclusion

## Required
- Original and useful content
- Clear and correct language`,

    translation: `You are a professional translator. ${original}

## Translation Guidelines
- Preserve original meaning
- Consider cultural context
- Use appropriate terminology

## Output
Accurate and natural translation`,

    summary: `You are a summarization expert. ${original}

## Required
- Summary in 3-5 points
- Main ideas only
- Concise and clear language`,

    analysis: `You are an expert analyst. ${original}

## Analysis Points
1. Main idea
2. Supporting points
3. Strengths and weaknesses
4. Recommendations`,

    creative: `You are a creative expert. ${original}

## Required
- 5-10 innovative ideas
- Brief explanation for each
- Priority ranking`,

    explain: `You are an expert teacher. ${original}

## Explanation Method
- Start with simple definition
- Use practical examples
- Progress from easy to hard`,

    general: `## Task
${original}

## Context
[Add context here]

## Expected Output
[Specify desired format]`
  };

  return templates[type] || templates.general;
}

function analyzePrompt(text) {
  if (!text) return { score: 0, suggestions: [] };

  const lower = text.toLowerCase();
  const analysis = {
    hasContext: /سياق|context|background|given/i.test(lower),
    hasInstructions: /تعليمات|instructions|steps|خطوات/i.test(lower),
    hasExamples: /مثال|example|sample|نموذج/i.test(lower),
    hasOutputFormat: /إخراج|output|format|تنسيق/i.test(lower),
    hasConstraints: /قيود|constraints|limits|ملاحظات/i.test(lower),
    wordCount: text.trim().split(/\s+/).length,
    score: 0,
    suggestions: []
  };

  let score = 0;
  if (analysis.hasContext) score += 20;
  if (analysis.hasInstructions) score += 25;
  if (analysis.hasExamples) score += 20;
  if (analysis.hasOutputFormat) score += 20;
  if (analysis.hasConstraints) score += 15;

  analysis.score = score;

  if (!analysis.hasContext) analysis.suggestions.push('Add clear context');
  if (!analysis.hasOutputFormat) analysis.suggestions.push('Specify output format');
  if (!analysis.hasExamples && analysis.wordCount > 50) analysis.suggestions.push('Add examples');

  return analysis;
}

async function sendToTab(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (error) {
    // Inject content script if not present
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (e) {
      console.error('Failed to send to tab:', e);
      throw e;
    }
  }
}

// ============================================
// Default Prompts
// ============================================

function getDefaultPrompts() {
  return [
    // Arabic Templates
    {
      id: 'default-ar-1',
      title: 'تحليل نص شامل',
      category: 'analysis',
      text: `أنت محلل نصوص خبير. قم بتحليل النص التالي:

## النص
[أدخل النص هنا]

## المطلوب
1. الفكرة الرئيسية
2. النقاط الفرعية الداعمة
3. الأسلوب والنبرة المستخدمة
4. الجمهور المستهدف
5. ملخص في 3-5 جمل`,
      isDefault: true
    },
    {
      id: 'default-ar-2',
      title: 'كتابة كود برمجي',
      category: 'coding',
      text: `أنت مبرمج خبير. اكتب كوداً برمجياً:

## اللغة
[حدد لغة البرمجة]

## المهمة
[صف المهمة المطلوبة بالتفصيل]

## المتطلبات
- كود نظيف ومنظم
- تعليقات توضيحية
- معالجة الأخطاء
- أمثلة للاستخدام

## الإخراج
كود قابل للتنفيذ مباشرة`,
      isDefault: true
    },
    {
      id: 'default-ar-3',
      title: 'كتابة مقال احترافي',
      category: 'writing',
      text: `أنت كاتب محتوى محترف. اكتب مقالاً عن:

## الموضوع
[عنوان المقال]

## المواصفات
- الطول: 500-800 كلمة
- الأسلوب: احترافي وجذاب
- الجمهور: [حدد الجمهور المستهدف]

## الهيكل
1. مقدمة جذابة
2. 3-4 فقرات رئيسية
3. خاتمة مع دعوة للعمل`,
      isDefault: true
    },
    {
      id: 'default-ar-4',
      title: 'ترجمة احترافية',
      category: 'translation',
      text: `أنت مترجم محترف. ترجم النص التالي:

## من: [اللغة المصدر]
## إلى: [اللغة الهدف]

## النص
[أدخل النص للترجمة]

## إرشادات
- حافظ على المعنى الأصلي
- راعِ السياق الثقافي
- استخدم مصطلحات طبيعية`,
      isDefault: true
    },
    {
      id: 'default-ar-5',
      title: 'توليد أفكار إبداعية',
      category: 'creative',
      text: `أنت خبير إبداعي. ساعدني في توليد أفكار:

## المجال
[مجال الأفكار]

## السياق
[الوضع الحالي والتحديات]

## المطلوب
- 10 أفكار مبتكرة
- شرح موجز لكل فكرة
- تقييم جدوى التنفيذ
- خطوات التطبيق المقترحة`,
      isDefault: true
    },
    {
      id: 'default-ar-6',
      title: 'تلخيص محتوى',
      category: 'general',
      text: `أنت خبير في التلخيص. لخص المحتوى التالي:

## المحتوى
[أدخل المحتوى]

## المطلوب
- ملخص في 5 نقاط رئيسية
- الأفكار الأساسية فقط
- لغة مختصرة وواضحة
- الحفاظ على المعلومات المهمة`,
      isDefault: true
    },
    // English Templates
    {
      id: 'default-en-1',
      title: 'Text Analysis',
      category: 'analysis',
      text: `You are an expert text analyst. Analyze the following:

## Text
[Insert text here]

## Required
1. Main idea
2. Supporting points
3. Style and tone
4. Target audience
5. Summary in 3-5 sentences`,
      isDefault: true
    },
    {
      id: 'default-en-2',
      title: 'Write Code',
      category: 'coding',
      text: `You are an expert programmer. Write code:

## Language
[Specify programming language]

## Task
[Describe the task in detail]

## Requirements
- Clean, organized code
- Explanatory comments
- Error handling
- Usage examples

## Output
Production-ready executable code`,
      isDefault: true
    },
    {
      id: 'default-en-3',
      title: 'Write Article',
      category: 'writing',
      text: `You are a professional content writer. Write an article about:

## Topic
[Article title]

## Specifications
- Length: 500-800 words
- Style: Professional and engaging
- Audience: [Specify target audience]

## Structure
1. Engaging introduction
2. 3-4 main paragraphs
3. Conclusion with call to action`,
      isDefault: true
    },
    {
      id: 'default-en-4',
      title: 'Professional Translation',
      category: 'translation',
      text: `You are a professional translator. Translate:

## From: [Source language]
## To: [Target language]

## Text
[Insert text to translate]

## Guidelines
- Preserve original meaning
- Consider cultural context
- Use natural terminology`,
      isDefault: true
    },
    {
      id: 'default-en-5',
      title: 'Generate Ideas',
      category: 'creative',
      text: `You are a creative expert. Help me generate ideas:

## Field
[Area for ideas]

## Context
[Current situation and challenges]

## Required
- 10 innovative ideas
- Brief explanation for each
- Feasibility assessment
- Suggested implementation steps`,
      isDefault: true
    }
  ];
}

// ============================================
// Additional Event Listeners
// ============================================

chrome.runtime.onStartup.addListener(() => {
  console.log('AndalusAI - Prompt started');
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[STORAGE_KEYS.SETTINGS]) {
    createContextMenus();
  }
});

console.log('AndalusAI - Prompt background ready');

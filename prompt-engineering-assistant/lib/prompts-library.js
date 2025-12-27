/**
 * Prompts Library - Ready Templates Library
 * AndalusAI - Prompt
 * 
 * @description Comprehensive library for managing and storing prompts
 * @version 1.0.0
 */

/**
 * @typedef {Object} Prompt
 * @property {string} id - Unique ID
 * @property {string} title - Title
 * @property {string} text - Prompt text
 * @property {string} category - Category
 * @property {string[]} [tags] - Tags
 * @property {string} [description] - Description
 * @property {number} [createdAt] - Creation date
 * @property {number} [updatedAt] - Update date
 * @property {number} [usageCount] - Usage count
 * @property {boolean} [isFavorite] - Is favorite
 * @property {boolean} [isDefault] - Is default
 */

/**
 * Main prompts library object
 */
export const PromptsLibrary = {
    // ============================================
    // Constants
    // ============================================

    STORAGE_KEY: 'customPrompts',
    FAVORITES_KEY: 'favoritePrompts',
    HISTORY_KEY: 'promptHistory',
    MAX_HISTORY: 100,

    // ============================================
    // Cache
    // ============================================

    _cache: {
        prompts: null,
        favorites: null,
        lastUpdate: 0
    },

    CACHE_TTL: 5000, // 5 seconds

    // ============================================
    // Read Functions
    // ============================================

    /**
     * Get all prompts
     * @param {string|null} [category] - Filter by category
     * @param {object} [options] - Additional options
     * @returns {Promise<{prompts: Prompt[], total: number}>}
     */
    async getPrompts(category = null, options = {}) {
        const {
            includeDefaults = true,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = '',
            limit = null,
            offset = 0
        } = options;

        try {
            // Get custom prompts
            const data = await chrome.storage.local.get(this.STORAGE_KEY);
            let customPrompts = data[this.STORAGE_KEY] || [];

            // Merge with defaults
            let allPrompts = includeDefaults
                ? [...customPrompts, ...defaultPrompts]
                : customPrompts;

            // Filter by category
            if (category && category !== 'all') {
                allPrompts = allPrompts.filter(p => p.category === category);
            }

            // Search
            if (search) {
                const searchLower = search.toLowerCase();
                allPrompts = allPrompts.filter(p =>
                    p.title.toLowerCase().includes(searchLower) ||
                    p.text.toLowerCase().includes(searchLower) ||
                    (p.tags && p.tags.some(t => t.toLowerCase().includes(searchLower)))
                );
            }

            // Sort
            allPrompts.sort((a, b) => {
                const aVal = a[sortBy] || 0;
                const bVal = b[sortBy] || 0;
                return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
            });

            const total = allPrompts.length;

            // Pagination
            if (limit) {
                allPrompts = allPrompts.slice(offset, offset + limit);
            }

            return { prompts: allPrompts, total };
        } catch (error) {
            console.error('Error getting prompts:', error);
            return { prompts: defaultPrompts, total: defaultPrompts.length, error: error.message };
        }
    },

    /**
     * Get prompt by ID
     * @param {string} id - Prompt ID
     * @returns {Promise<Prompt|null>}
     */
    async getPromptById(id) {
        try {
            const { prompts } = await this.getPrompts();
            return prompts.find(p => p.id === id) || null;
        } catch (error) {
            console.error('Error getting prompt by ID:', error);
            return null;
        }
    },

    /**
     * Get favorite prompts
     * @returns {Promise<Prompt[]>}
     */
    async getFavorites() {
        try {
            const data = await chrome.storage.sync.get(this.FAVORITES_KEY);
            return data[this.FAVORITES_KEY] || [];
        } catch (error) {
            console.error('Error getting favorites:', error);
            return [];
        }
    },

    /**
     * Get usage history
     * @param {number} [limit] - Maximum items
     * @returns {Promise<Array>}
     */
    async getHistory(limit = 20) {
        try {
            const data = await chrome.storage.local.get(this.HISTORY_KEY);
            const history = data[this.HISTORY_KEY] || [];
            return limit ? history.slice(0, limit) : history;
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    },

    /**
     * Get available categories
     * @returns {Promise<Array<{id: string, name: string, count: number}>>}
     */
    async getCategories() {
        const { prompts } = await this.getPrompts();
        const categoryCounts = {};

        prompts.forEach(p => {
            const cat = p.category || 'general';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        return Object.entries(categoryCounts).map(([id, count]) => ({
            id,
            name: categoryNames[id] || id,
            count
        }));
    },

    // ============================================
    // Write Functions
    // ============================================

    /**
     * Save new prompt
     * @param {Prompt} prompt - Prompt data
     * @returns {Promise<{success: boolean, id?: string, error?: string}>}
     */
    async savePrompt(prompt) {
        try {
            // Validate data
            if (!prompt.title || !prompt.text) {
                return { success: false, error: 'Title and text are required' };
            }

            const data = await chrome.storage.local.get(this.STORAGE_KEY);
            const prompts = data[this.STORAGE_KEY] || [];

            const newPrompt = {
                id: prompt.id || this._generateId(),
                title: prompt.title.trim(),
                text: prompt.text.trim(),
                category: prompt.category || 'general',
                tags: prompt.tags || [],
                description: prompt.description || '',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                usageCount: 0,
                isFavorite: false,
                isDefault: false
            };

            prompts.unshift(newPrompt);
            await chrome.storage.local.set({ [this.STORAGE_KEY]: prompts });

            this._invalidateCache();

            return { success: true, id: newPrompt.id };
        } catch (error) {
            console.error('Error saving prompt:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update existing prompt
     * @param {string} id - Prompt ID
     * @param {Partial<Prompt>} updates - Updates
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async updatePrompt(id, updates) {
        try {
            const data = await chrome.storage.local.get(this.STORAGE_KEY);
            const prompts = data[this.STORAGE_KEY] || [];

            const index = prompts.findIndex(p => p.id === id);
            if (index === -1) {
                return { success: false, error: 'Prompt not found' };
            }

            prompts[index] = {
                ...prompts[index],
                ...updates,
                updatedAt: Date.now()
            };

            await chrome.storage.local.set({ [this.STORAGE_KEY]: prompts });
            this._invalidateCache();

            return { success: true };
        } catch (error) {
            console.error('Error updating prompt:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete prompt
     * @param {string} id - Prompt ID
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deletePrompt(id) {
        try {
            const data = await chrome.storage.local.get(this.STORAGE_KEY);
            const prompts = (data[this.STORAGE_KEY] || []).filter(p => p.id !== id);

            await chrome.storage.local.set({ [this.STORAGE_KEY]: prompts });

            // Also remove from favorites
            await this.removeFromFavorites(id);

            this._invalidateCache();

            return { success: true };
        } catch (error) {
            console.error('Error deleting prompt:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Add to favorites
     * @param {Prompt} prompt - Prompt data
     * @returns {Promise<{success: boolean}>}
     */
    async addToFavorites(prompt) {
        try {
            const data = await chrome.storage.sync.get(this.FAVORITES_KEY);
            const favorites = data[this.FAVORITES_KEY] || [];

            // Check for duplicates
            if (favorites.some(f => f.id === prompt.id)) {
                return { success: true, message: 'Already in favorites' };
            }

            favorites.unshift({
                id: prompt.id,
                title: prompt.title,
                text: prompt.text,
                category: prompt.category,
                addedAt: Date.now()
            });

            await chrome.storage.sync.set({ [this.FAVORITES_KEY]: favorites });

            // Update status in original prompt
            await this.updatePrompt(prompt.id, { isFavorite: true });

            return { success: true };
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Remove from favorites
     * @param {string} id - Prompt ID
     * @returns {Promise<{success: boolean}>}
     */
    async removeFromFavorites(id) {
        try {
            const data = await chrome.storage.sync.get(this.FAVORITES_KEY);
            const favorites = (data[this.FAVORITES_KEY] || []).filter(f => f.id !== id);

            await chrome.storage.sync.set({ [this.FAVORITES_KEY]: favorites });

            // Update status
            await this.updatePrompt(id, { isFavorite: false });

            return { success: true };
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Add to history
     * @param {string} promptText - Prompt text
     * @param {object} [metadata] - Additional data
     * @returns {Promise<{success: boolean}>}
     */
    async addToHistory(promptText, metadata = {}) {
        try {
            const data = await chrome.storage.local.get(this.HISTORY_KEY);
            const history = data[this.HISTORY_KEY] || [];

            history.unshift({
                id: this._generateId(),
                text: promptText,
                timestamp: Date.now(),
                ...metadata
            });

            // Max history limit
            while (history.length > this.MAX_HISTORY) {
                history.pop();
            }

            await chrome.storage.local.set({ [this.HISTORY_KEY]: history });

            return { success: true };
        } catch (error) {
            console.error('Error adding to history:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Clear history
     * @returns {Promise<{success: boolean}>}
     */
    async clearHistory() {
        try {
            await chrome.storage.local.remove(this.HISTORY_KEY);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Increment usage count
     * @param {string} id - Prompt ID
     */
    async incrementUsage(id) {
        try {
            const prompt = await this.getPromptById(id);
            if (prompt && !prompt.isDefault) {
                await this.updatePrompt(id, {
                    usageCount: (prompt.usageCount || 0) + 1
                });
            }
        } catch (error) {
            console.error('Error incrementing usage:', error);
        }
    },

    // ============================================
    // Export & Import Functions
    // ============================================

    /**
     * Export all prompts
     * @returns {Promise<object>}
     */
    async exportAll() {
        try {
            const [promptsData, favoritesData, historyData] = await Promise.all([
                chrome.storage.local.get(this.STORAGE_KEY),
                chrome.storage.sync.get(this.FAVORITES_KEY),
                chrome.storage.local.get(this.HISTORY_KEY)
            ]);

            return {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                prompts: promptsData[this.STORAGE_KEY] || [],
                favorites: favoritesData[this.FAVORITES_KEY] || [],
                history: historyData[this.HISTORY_KEY] || []
            };
        } catch (error) {
            throw new Error('Export failed: ' + error.message);
        }
    },

    /**
     * Import prompts
     * @param {object} data - Imported data
     * @param {boolean} [merge=true] - Merge with existing
     * @returns {Promise<{success: boolean, imported: number}>}
     */
    async importData(data, merge = true) {
        try {
            if (!data || !data.prompts) {
                return { success: false, error: 'Invalid import data' };
            }

            let existingPrompts = [];
            if (merge) {
                const existing = await chrome.storage.local.get(this.STORAGE_KEY);
                existingPrompts = existing[this.STORAGE_KEY] || [];
            }

            // Avoid duplicates
            const existingIds = new Set(existingPrompts.map(p => p.id));
            const newPrompts = data.prompts.filter(p => !existingIds.has(p.id));

            const allPrompts = [...newPrompts, ...existingPrompts];
            await chrome.storage.local.set({ [this.STORAGE_KEY]: allPrompts });

            // Import favorites
            if (data.favorites) {
                await chrome.storage.sync.set({ [this.FAVORITES_KEY]: data.favorites });
            }

            this._invalidateCache();

            return { success: true, imported: newPrompts.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // ============================================
    // Private Helper Functions
    // ============================================

    /**
     * Generate unique ID
     * @private
     */
    _generateId() {
        return `prompt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    },

    /**
     * Invalidate cache
     * @private
     */
    _invalidateCache() {
        this._cache.prompts = null;
        this._cache.favorites = null;
        this._cache.lastUpdate = 0;
    }
};

// ============================================
// Category Names
// ============================================

const categoryNames = {
    general: 'General',
    coding: 'Coding',
    writing: 'Writing',
    analysis: 'Analysis',
    creative: 'Creative',
    translation: 'Translation',
    education: 'Education',
    business: 'Business',
    marketing: 'Marketing',
    research: 'Research'
};

// ============================================
// Extended Default Prompts
// ============================================

const defaultPrompts = [
    // Analysis
    {
        id: 'default-analysis-1',
        title: 'Comprehensive Text Analysis',
        category: 'analysis',
        text: `Analyze the following text comprehensively and systematically:

## Text
[Insert text here]

## Required
1. **Main Idea**: Identify the central idea
2. **Key Points**: Extract supporting points
3. **Style**: Analyze the style and tone used
4. **Audience**: Identify target audience
5. **Evaluation**: Provide objective critical evaluation
6. **Summary**: Write a brief summary in 3-5 sentences`,
        tags: ['analysis', 'text', 'critique', 'summary'],
        description: 'Comprehensive and organized analysis for any text',
        isDefault: true
    },
    {
        id: 'default-analysis-2',
        title: 'Data Analysis',
        category: 'analysis',
        text: `Analyze the following data:

## Data
[Insert data here - table, numbers, statistics]

## Required
1. **Trends**: Identify main trends
2. **Patterns**: Discover recurring patterns
3. **Outliers**: Identify any abnormal values
4. **Insights**: Extract actionable insights
5. **Recommendations**: Provide data-driven recommendations`,
        tags: ['analysis', 'data', 'statistics'],
        isDefault: true
    },

    // Coding
    {
        id: 'default-coding-1',
        title: 'Write Code',
        category: 'coding',
        text: `Write code in [Language]:

## Task
[Describe the required task]

## Requirements
- [ ] First requirement
- [ ] Second requirement
- [ ] Third requirement

## Constraints
- Performance: [performance specs]
- Compatibility: [requirements]

## Expected Output
- Clean and organized code
- Explanatory comments
- Error handling
- Usage examples`,
        tags: ['code', 'programming', 'development'],
        isDefault: true
    },
    {
        id: 'default-coding-2',
        title: 'Review and Improve Code',
        category: 'coding',
        text: `Review the following code and provide improvements:

\`\`\`[Language]
[Code here]
\`\`\`

## Review Points
1. **Bugs**: Detect potential errors
2. **Security**: Identify security vulnerabilities
3. **Performance**: Suggest performance improvements
4. **Readability**: Improve readability
5. **Best Practices**: Apply best practices

## Output
- List of issues with explanations
- Improved code
- Explanation of changes`,
        tags: ['review', 'code', 'improvement', 'security'],
        isDefault: true
    },
    {
        id: 'default-coding-3',
        title: 'Explain Code',
        category: 'coding',
        text: `Explain the following code in detail:

\`\`\`[Language]
[Code here]
\`\`\`

## Required
1. **Overview**: What does this code do?
2. **Line by Line**: Explain each part
3. **Concepts**: Explain concepts used
4. **Inputs and Outputs**: Clarify the data
5. **Examples**: Provide usage examples

## Explanation Level: [Beginner/Intermediate/Advanced]`,
        tags: ['explanation', 'code', 'education'],
        isDefault: true
    },

    // Writing
    {
        id: 'default-writing-1',
        title: 'Write Professional Article',
        category: 'writing',
        text: `Write a professional article:

## Topic
[Title or topic]

## Specifications
- **Word Count**: [number]
- **Audience**: [target audience]
- **Tone**: [formal/informal/academic]
- **Goal**: [inform/persuade/entertain]

## Required Structure
1. Engaging introduction (Hook)
2. Main ideas presentation
3. Supporting evidence and examples
4. Strong conclusion with call to action

## Additional Notes
[Any special requirements]`,
        tags: ['article', 'writing', 'content'],
        isDefault: true
    },
    {
        id: 'default-writing-2',
        title: 'Proofread and Improve Text',
        category: 'writing',
        text: `Proofread and improve the following text:

## Original Text
[Insert text here]

## Required
1. **Language Correction**
   - Spelling errors
   - Grammar errors
   - Punctuation

2. **Style Improvement**
   - Sentence clarity
   - Structure variety
   - Expression strength

3. **Formatting**
   - Paragraph division
   - Logical coherence

## Output
- Corrected text
- List of major changes`,
        tags: ['proofreading', 'editing', 'language'],
        isDefault: true
    },
    {
        id: 'default-writing-3',
        title: 'Professional Translation',
        category: 'translation',
        text: `Translate the following text professionally:

## Original Text
Source Language: [Language]
[Text]

## Target Language
[Language]

## Translation Guidelines
- Preserve accurate meaning
- Consider cultural context
- Use appropriate terminology
- Maintain tone and style
- [Any special notes]

## Output
- Translation
- Translator notes (if any)`,
        tags: ['translation', 'languages'],
        isDefault: true
    },

    // Creative
    {
        id: 'default-creative-1',
        title: 'Generate Creative Ideas',
        category: 'creative',
        text: `Help me generate creative ideas:

## Field
[Field or topic]

## Context
[Current situation and challenges]

## Goal
[What you want to achieve]

## Constraints
[Budget, time, resources]

## Required
1. **10 innovative ideas** with brief explanation
2. **Feasibility analysis** for top 3 ideas
3. **Suggested implementation steps**
4. **Additional inspiration sources**`,
        tags: ['creativity', 'ideas', 'brainstorming'],
        isDefault: true
    },
    {
        id: 'default-creative-2',
        title: 'Write Short Story',
        category: 'creative',
        text: `Write a short story:

## Elements
- **Genre**: [Sci-fi/Romance/Mystery/etc]
- **Length**: [word count]
- **Main Character**: [brief description]
- **Setting**: [environment]
- **Time Period**: [time period]

## Theme or Message
[Central idea]

## Writing Style
[Descriptive/Dialogue/Stream of consciousness]

## Notes
[Any additional requirements]`,
        tags: ['story', 'creative', 'narrative'],
        isDefault: true
    },

    // Education
    {
        id: 'default-education-1',
        title: 'Explain Educational Concept',
        category: 'education',
        text: `Explain the following concept educationally:

## Concept
[Concept or topic]

## Learner Level
[Beginner/Intermediate/Advanced]

## Required
1. **Simple Definition**: One clear sentence
2. **Detailed Explanation**: With logical sequence
3. **Practical Examples**: 3-5 varied examples
4. **Analogies**: To aid understanding
5. **Interactive Questions**: To test comprehension
6. **Additional Resources**: For deeper learning

## Output
Organized with clear headings and short paragraphs`,
        tags: ['education', 'explanation', 'concept'],
        isDefault: true
    },

    // Business
    {
        id: 'default-business-1',
        title: 'Brief Business Plan',
        category: 'business',
        text: `Create a brief business plan:

## Project/Idea
[Project description]

## Target Market
[Audience and size]

## Required
1. **Executive Summary**
2. **Problem and Solution**
3. **Revenue Model**
4. **Competitive Analysis**
5. **Marketing Plan**
6. **Required Team**
7. **Initial Budget**
8. **Key Milestones**

## Timeframe
[Expected implementation duration]`,
        tags: ['business', 'plan', 'entrepreneurship'],
        isDefault: true
    },
    {
        id: 'default-business-2',
        title: 'Professional Email',
        category: 'business',
        text: `Write a professional email:

## Email Type
[Inquiry/Follow-up/Proposal/Apology/Thanks]

## Recipient
[Job title and context]

## Subject
[Purpose of email]

## Key Points
- First point
- Second point
- Third point

## Tone
[Very formal/Formal/Friendly professional]

## Call to Action
[What you want recipient to do]`,
        tags: ['email', 'business', 'communication'],
        isDefault: true
    }
];

// Default export for compatibility
export default PromptsLibrary;

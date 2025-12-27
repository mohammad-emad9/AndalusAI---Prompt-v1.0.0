# AndalusAI - Prompt

<div align="center">

🤖 **Your Intelligent AI Prompt Assistant**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)](https://chrome.google.com)
[![Version](https://img.shields.io/badge/Version-1.0.0-green)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

</div>

---

## 📖 Description

**AndalusAI - Prompt** is a powerful Chrome extension to help you create, manage, and improve AI prompts. It fully supports both English and Arabic (RTL).

## ✨ Features

- 🎨 **Modern Dark UI** with attractive design
- 🌍 **Full Arabic Support** (RTL)
- 📝 **Ready-to-use Template Library** with various categories
- ✨ **Auto-improve Prompts** with smart suggestions
- 📊 **Prompt Quality Analysis** with improvement tips
- ⭐ **Favorites List** for quick access
- 📋 **Usage History** tracking
- 💾 **Export & Import** your data
- ⌨️ **Keyboard Shortcuts** for power users

## 🚀 Installation

### Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** in the top right corner
3. Click **Load unpacked**
4. Select the `prompt-engineering-assistant` folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file

## 📁 Project Structure

```
prompt-engineering-assistant/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js             # Content script
├── package.json           # Project info
├── popup/
│   ├── index.html         # Popup UI
│   ├── style.css          # Popup styles
│   └── script.js          # Popup logic
├── options/
│   ├── index.html         # Settings page
│   ├── style.css          # Settings styles
│   └── script.js          # Settings logic
├── lib/
│   ├── utils.js           # Utility functions
│   ├── language-support.js # Language support
│   └── prompts-library.js # Prompts library
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Open quick prompt dialog |
| `Escape` | Close open dialog |
| `Ctrl+Enter` | Insert prompt (in quick dialog) |

## 🎯 How to Use

### Context Menus (Right-click)

1. **Select text** on any web page
2. **Right-click** to open context menu
3. Choose from **AndalusAI** menu:
   - ✨ Improve Prompt
   - 📋 Copy as Prompt
   - 📊 Analyze Prompt

### Popup Window

1. Click the extension icon
2. Type your prompt or choose from templates
3. Use buttons to copy or improve

## 🔧 Settings

- **Language**: English / Arabic
- **Theme**: Dark / Light
- **Auto-save**: Enable/Disable
- **Notifications**: Enable/Disable

## 📦 Export & Import

You can export all your data (templates, favorites, history) as a JSON file and import it later on any device.

## 🛠️ Development

```bash
# No npm install required - works directly
# Just load the extension in your browser
```

### Testing

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the project folder
5. Open Console (F12) to check for errors

### Debugging

- **Background script**: Click "service worker" link in extensions page
- **Content script**: Open any webpage and check Console
- **Popup**: Right-click extension icon → Inspect popup

## 📝 Template Categories

| Category | Description |
|----------|-------------|
| General | General purpose prompts |
| Coding | Programming and development |
| Writing | Content creation and editing |
| Analysis | Text and data analysis |
| Creative | Creative writing and ideas |
| Translation | Language translation |
| Education | Learning and teaching |
| Business | Professional and business |

## 🔒 Permissions

- `storage` - Save your templates and settings
- `activeTab` - Access the current tab
- `contextMenus` - Add right-click menu options
- `clipboardWrite/Read` - Copy and paste prompts

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

<div align="center">

**Made with ❤️ by AndalusAI**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>

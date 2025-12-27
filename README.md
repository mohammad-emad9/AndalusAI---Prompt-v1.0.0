<div align="center">

# 🤖 AndalusAI - Prompt

### Your Intelligent AI Prompt Engineering Assistant

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://chrome.google.com)
[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](http://makeapullrequest.com)

**A powerful Chrome extension to create, manage, and improve AI prompts with full Arabic (RTL) support**

[Features](#-features) • [Installation](#-installation) • [Usage](#-how-to-use) • [Contributing](#-contributing)

---

### 📸 Screenshot

<img src="screenshots/screenshot.png" alt="AndalusAI - Prompt Screenshot" width="400"/>

---

</div>

## 📖 About

**AndalusAI - Prompt** is a feature-rich Chrome extension designed to supercharge your AI prompt engineering workflow. Whether you're a developer, content creator, or AI enthusiast, this tool helps you craft better prompts with smart templates, auto-improvement suggestions, and quality analysis.

### 🌟 Why AndalusAI?

- **Save Time**: Pre-built templates for common use cases
- **Improve Quality**: AI-powered prompt enhancement
- **Stay Organized**: History tracking and favorites system
- **Work in Arabic**: Full RTL support for Arabic users

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 Modern Interface
- Beautiful dark theme UI
- Responsive and intuitive design
- Smooth animations and transitions

### 🌍 Multilingual Support
- Full Arabic (RTL) support
- English interface available
- Easy language switching

</td>
<td width="50%">

### 📝 Smart Templates
- Ready-to-use prompt library
- Multiple categories (Coding, Writing, Analysis...)
- Customizable templates

### ⚡ Productivity Tools
- One-click prompt improvement
- Quality analysis with tips
- Keyboard shortcuts support

</td>
</tr>
</table>

### Full Feature List

| Feature | Description |
|---------|-------------|
| 🎨 **Dark UI** | Modern, eye-friendly dark theme |
| 🌍 **Arabic Support** | Full RTL layout for Arabic |
| � **Template Library** | Pre-built prompts by category |
| ✨ **Auto-Improve** | AI-powered prompt enhancement |
| 📊 **Quality Analysis** | Prompt scoring with improvement tips |
| ⭐ **Favorites** | Quick access to your best prompts |
| 📋 **History** | Track all your created prompts |
| 💾 **Export/Import** | Backup and restore your data |
| ⌨️ **Shortcuts** | Keyboard shortcuts for power users |

---

## 🚀 Installation

### Chrome (Recommended)

```bash
1. Download or clone this repository
2. Open chrome://extensions/ in Chrome
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the prompt-engineering-assistant folder
```

### Firefox

```bash
1. Open about:debugging#/runtime/this-firefox
2. Click "Load Temporary Add-on"
3. Select the manifest.json file
```

---

## 📁 Project Structure

```
prompt-engineering-assistant/
├── 📄 manifest.json          # Extension configuration
├── 📄 background.js          # Background service worker
├── 📄 content.js             # Content script for web pages
├── 📄 package.json           # Project metadata
│
├── 📂 popup/                 # Extension popup UI
│   ├── index.html           # Popup structure
│   ├── style.css            # Popup styling
│   └── script.js            # Popup functionality
│
├── 📂 options/               # Settings page
│   ├── index.html           # Settings structure
│   ├── style.css            # Settings styling
│   └── script.js            # Settings functionality
│
├── 📂 lib/                   # Shared libraries
│   ├── utils.js             # Utility functions
│   ├── language-support.js  # i18n support
│   └── prompts-library.js   # Template definitions
│
└── 📂 icons/                 # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🎯 How to Use

### Context Menu (Right-Click)

1. **Select text** on any webpage
2. **Right-click** to open context menu
3. Choose from **AndalusAI** options:
   - ✨ **Improve Prompt** - Enhance selected text
   - 📋 **Copy as Prompt** - Format and copy
   - 📊 **Analyze Prompt** - Get quality insights

### Popup Interface

1. Click the **AndalusAI icon** in your toolbar
2. **Type your prompt** or select a template
3. Use the action buttons:
   - 📋 Copy to clipboard
   - ✨ Improve with AI
   - 🗑️ Clear input

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Open quick prompt dialog |
| `Escape` | Close dialog |
| `Ctrl+Enter` | Insert prompt |

---

## ⚙️ Settings

Access settings by clicking the ⚙️ icon in the popup:

| Setting | Options |
|---------|---------|
| **Language** | English / العربية |
| **Theme** | Dark / Light |
| **Auto-save** | Enable / Disable |
| **Notifications** | Enable / Disable |

---

## 📦 Data Management

### Export Your Data
Save all your templates, favorites, and history as a JSON file.

### Import Data
Restore your data on any device by importing your backup file.

---

## 📝 Template Categories

| Category | Description | Use Cases |
|----------|-------------|-----------|
| 🌐 **General** | Multi-purpose prompts | Everyday tasks |
| 💻 **Coding** | Programming assistance | Code review, debugging |
| ✍️ **Writing** | Content creation | Articles, emails, copy |
| 📊 **Analysis** | Data & text analysis | Reports, summaries |
| 🎨 **Creative** | Creative writing | Stories, ideas, brainstorming |
| 🌍 **Translation** | Language translation | Multi-language content |
| 📚 **Education** | Learning & teaching | Explanations, tutorials |
| 💼 **Business** | Professional use | Proposals, strategies |

---

## 🔒 Permissions Explained

| Permission | Purpose |
|------------|---------|
| `storage` | Save your templates, favorites, and settings locally |
| `activeTab` | Access current tab for prompt insertion |
| `contextMenus` | Add right-click menu options |
| `clipboardWrite/Read` | Copy prompts to clipboard |

> ⚠️ **Privacy Note**: All data is stored locally on your device. No data is sent to external servers.

---

## 🛠️ Development

### Prerequisites
- Chrome or Firefox browser
- Basic knowledge of browser extensions

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/AndalusAI-Prompt.git

# Navigate to the directory
cd AndalusAI-Prompt

# Load in Chrome (no build required!)
# Just follow the installation steps above
```

### Debugging

| Component | How to Debug |
|-----------|-------------|
| **Background Script** | Click "service worker" in chrome://extensions |
| **Content Script** | Open DevTools (F12) on any webpage |
| **Popup** | Right-click extension icon → Inspect popup |

---

## 🗺️ Roadmap & Future Improvements

We're continuously working to improve AndalusAI - Prompt. Here's what's coming:

### 🔐 Security & Privacy Enhancements

| Improvement | Description |
|-------------|-------------|
| **First-run Privacy Notice** | Display a clear message: *"Your data never leaves your device — all processing is done locally"* |
| **Permissions Transparency** | Detailed explanations in `manifest.json` for permissions like `clipboardRead` and why they're needed |
| **Privacy Policy Page** | Dedicated page explaining data handling for sensitive prompts |

### 🦊 Firefox Compatibility

| Improvement | Description |
|-------------|-------------|
| **Cross-browser APIs** | Support for `browser.*` APIs alongside `chrome.*` for full Firefox compatibility |
| **API Compatibility Check** | Avoid Chrome-only APIs like `chrome.scripting` where alternatives exist |
| **Firefox Add-ons Store** | Official listing on Firefox Add-ons marketplace |

### 🛠️ Developer Experience

| Improvement | Description |
|-------------|-------------|
| **Version Management** | Proper `package.json` with semantic versioning (`"version": "1.0.0"`) |
| **Git Tags** | Release tags for version tracking (e.g., `git tag v1.0.0`) |
| **CONTRIBUTING.md** | Comprehensive contribution guidelines |
| **Enhanced .gitignore** | Proper exclusion of build artifacts and sensitive files |

### 🚀 Extensibility & New Features

| Improvement | Description |
|-------------|-------------|
| **Optional AI Integration** | "Test with AI" button for direct prompt testing (using secure third-party APIs) |
| **Plugin System** | Allow custom template packs and community extensions |
| **Cloud Sync** | Optional encrypted cloud backup for cross-device sync |
| **API Mode** | Expose extension features for automation and integrations |

> 💡 **Note**: The extension currently works 100% offline by design. AI features will always be optional and privacy-respecting.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Ideas for Contribution

- [ ] Add more prompt templates
- [ ] Improve Arabic translations
- [ ] Add support for more languages
- [ ] Create browser sync feature
- [ ] Add dark/light theme toggle

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repo if you find it useful!

**Made with ❤️ by AndalusAI Team**

[🐛 Report Bug](../../issues) • [💡 Request Feature](../../issues) • [📧 Contact](mailto:contact@andalusai.com)

---

<sub>© 2024 AndalusAI. All rights reserved.</sub>

</div>

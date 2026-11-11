# Exofo - Company Management System Login

A pixel-perfect, fully responsive login page recreated directly from the provided design reference.

## 📱 Features

- **Exact 1:1 Mobile Design**: Matches the reference mock down to typography, padding, color palette, custom inputs, checkbox state, and buttons.
- **Fully Responsive**:
  - **Mobile (< 768px)**: Native mobile app bottom-sheet style with drag handle pill, rounded sheet corners (`32px`), full-width gradient login button, and ambient illustration backdrop.
  - **Desktop / Tablet (≥ 769px)**: Dual-pane split layout featuring the brand illustration with floating depth effects, enterprise showcase badges & metrics, and a centered login form card.
  - **Interactive Preview Switcher**: Desktop users can switch between **Responsive** split view and an exact **Mobile Frame** preview with a single click.
- **Micro-interactions & UX**:
  - **Password Visibility Toggle**: Show/hide password with dynamic SVG icon transitions.
  - **Interactive Checkbox**: Custom royal blue checked state matching the design mock.
  - **Form Validation**: Real-time error handling with shake animation and inline hints.
  - **Toast Notifications**: Simulated login authentication feedback and password recovery messages.
  - **Accessible**: Semantic HTML5, ARIA labels, focus-visible outlines, and screen reader labels.

---

## 🚀 Quick Start

### Option 1: Direct Browser Launch
Simply double-click or open `index.html` in any modern web browser:
```bash
open index.html
```

### Option 2: Local HTTP Server (Python)
```bash
python3 -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

### Option 3: Node.js / NPM
```bash
npm run dev
# or
npm start
```

---

## 📁 File Structure

```
exofo/
├── index.html              # Clean semantic HTML5 markup
├── css/
│   └── styles.css          # Pixel-perfect responsive styling & design tokens
├── js/
│   └── script.js           # Password toggling, validation & preview controls
├── assets/
│   ├── illustration.jpg    # 1:1 cropped illustration from reference
│   └── reference.jpg       # Original reference image for comparison
├── package.json            # Dev server scripts
└── README.md               # Documentation
```

---

## 🎨 Color Palette & Design Tokens

| Element | Token / Color | Hex |
| :--- | :--- | :--- |
| **Brand Primary (Title)** | `--brand-navy-900` | `#0c102a` |
| **Subtitle Text** | `--text-secondary` | `#555e77` |
| **Input Background** | `--input-bg` | `#f4f6fc` |
| **Input Border** | `--input-border` | `#e6ebf5` |
| **Checkbox Active** | `--accent-checkbox` | `#122c9d` |
| **Forgot Password Link**| `--link-color` | `#122c9d` |
| **Login Button Top** | `--brand-blue-500` | `#243fa8` |
| **Login Button Bottom** | `--brand-blue-700` | `#162569` |
| **Drag Handle Pill** | `--handle-pill` | `#e4e7ee` |


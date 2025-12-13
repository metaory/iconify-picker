# Iconify Picker Web Component

A zero-dependency, framework-agnostic icon picker web component powered by Iconify.

## Features

- 🚀 Zero dependencies
- 🎨 Fully themeable
- 🔌 Framework agnostic
- 🎯 Multiple modes (inline, button, manual)
- 📦 Lightweight and fast

## Documentation

Visit our [documentation site](https://yourusername.github.io/iconify-picker/) for detailed usage instructions and examples.

Here's a **README template** for an **Autonomous Mode Component**—tailored to your standards. It emphasizes declarative usage, minimalism, browser-native behavior, and styling flexibility.

# `<iconify-picker>`

**Autonomous Mode Web Component** for selecting icons from any [Iconify](https://iconify.design/) collection.

- ⚡ **Zero dependencies**
- 🎯 **Autonomous behavior**: configurable via attributes
- 🎨 **Styleable** with CSS custom properties
- 🧩 **Interoperable** with any framework or HTML
- 🧠 **Event-driven** and imperatively accessible

---

## Install

Via CDN:

```html
<script type="module" src="https://cdn.example.com/iconify-picker.js"></script>
```

Or npm:

```bash
npm install iconify-picker
```

---

## Usage

### Always Visible Picker

```html
<iconify-picker collection="mdi"></iconify-picker>
```

### Button-Toggled Picker

```html
<iconify-picker mode="button" button-label="Choose Icon" collection="mdi"></iconify-picker>
```

### Programmatic Display

```html
<iconify-picker id="picker" mode="manual" hidden collection="mdi"></iconify-picker>

<script>
  picker.show(); // Open picker manually
</script>
```

---

## Attributes

| Attribute     | Description                                  |
|---------------|----------------------------------------------|
| `collection`  | Iconify collection ID (e.g. `mdi`, `lucide`) |
| `mode`        | `inline` (default), `button`, `manual`       |
| `button-label`| Label for button (in `button` mode)          |
| `theme`       | `light`, `dark`, or `auto` (default)         |
| `filter`      | Initial filter query                         |
| `page-size`   | Number of icons per page                     |
| `selected`    | Pre-selected icon (format: `collection:name`)|
| `height`      | Component height                             |
| `hidden`      | Hide the component                           |

---

## Events

| Event            | Detail Payload                                 |
|------------------|-----------------------------------------------|
| `icon-selected`  | `{ iconName, collection, name, svg }`          |
| `change`         | Same as `icon-selected`                        |

```js
picker.addEventListener('icon-selected', (e) => {
  console.log(e.detail.iconName); // e.g. "mdi:home"
  console.log(e.detail.svg);      // Raw SVG content
});
```

---

## Methods

| Method       | Description               |
|--------------|---------------------------|
| `.show()`    | Show picker               |
| `.hide()`    | Hide picker               |
| `.toggle()`  | Toggle visibility         |
| `.reset()`   | Clear filter/selection    |
| `.focus()`   | Focus search input        |

---

## Styling

Customize with CSS custom properties. The component defaults to a dark theme.

### Quick Reference

| Property           | Default   | Description          |
|--------------------|-----------|----------------------|
| `--picker-primary` | `#ff5c8a` | Primary accent color |
| `--picker-bg`      | `#181825` | Background color     |
| `--picker-text`    | `#f5f5f5` | Text color           |
| `--picker-border`  | `#313244` | Border color         |
| `--picker-hover`   | `#1e1e2e` | Hover background     |

For the full list of CSS variables (colors, radius, borders, spacing, scrollbar), see the [documentation site](https://yourusername.github.io/iconify-picker/).

### Example

```css
iconify-picker {
  --picker-primary: #3498db;
  --picker-bg: #181825;
  --picker-text: #f5f5f5;
}

/* Light mode override */
@media (prefers-color-scheme: light) {
  iconify-picker {
    --picker-bg: #f0f8ff;
    --picker-text: #2c3e50;
    --picker-border: #c0d6e4;
  }
}
```

### Shadow Parts

Style internal elements with `::part()`:

```css
iconify-picker::part(container) { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
iconify-picker::part(icon):hover { transform: scale(1.1); }
```

Parts: `container`, `header`, `footer`, `search`, `select`, `grid`, `icon`, `icon-image`, `button`, `pagination`

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## License

[MIT](LICENSE)
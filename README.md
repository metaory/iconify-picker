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

Customize with CSS custom properties. All properties are categorized below:

### Main Colors

| Property               | Default   | Description                 |
|------------------------|-----------|------------------------------|
| `--picker-primary`     | `#e74c3c` | Primary accent color         |
| `--picker-bg`          | `#f0f8ff` | Main background color        |
| `--picker-text`        | `#2c3e50` | Main text color              |
| `--picker-border`      | `#c0d6e4` | Border color                 |
| `--picker-hover`       | `#e1f0ff` | Hover state background       |

### Element-Specific Colors

| Property               | Default    | Description                  |
|------------------------|------------|------------------------------|
| `--picker-header-bg`   | `#e8f4ff`  | Header background color      |
| `--picker-input-bg`    | `#ffffff`  | Input fields background      |
| `--picker-input-text`  | `#2c3e50`  | Input fields text color      |
| `--picker-icon-color`  | `#2c3e50`  | Icon color                   |
| `--picker-footer-bg`   | `#e8f4ff`  | Footer background color      |

### Border Radius

| Property                    | Default | Description                       |
|-----------------------------|---------|-----------------------------------|
| `--picker-radius`           | `12px`  | Default border radius             |
| `--picker-container-radius` | `12px`  | Border radius for main container  |
| `--picker-input-radius`     | `8px`   | Border radius for inputs          |
| `--picker-icon-radius`      | `6px`   | Border radius for icons           |
| `--picker-button-radius`    | `8px`   | Border radius for buttons         |

### Border Width

| Property                         | Default | Description                      |
|----------------------------------|---------|----------------------------------|
| `--picker-border-width`          | `3px`   | Default border width             |
| `--picker-container-border-width`| `3px`   | Border width for container       |
| `--picker-input-border-width`    | `1px`   | Border width for inputs          |
| `--picker-icon-border-width`     | `1px`   | Border width for icons           |

### Spacing and Dimensions

| Property               | Default  | Description                    |
|------------------------|----------|--------------------------------|
| `--picker-padding`     | `1rem`   | Internal padding for elements  |
| `--picker-gap`         | `0.5rem` | Gap between elements           |
| `--picker-icon-size`   | `24px`   | Size of icons in the grid      |
| `--picker-max-height`  | `60vh`   | Maximum height of component    |

### Scrollbar Customization

| Property                    | Default      | Description                 |
|-----------------------------|--------------|------------------------------|
| `--picker-scrollbar-width`  | `thin`       | Scrollbar width              |
| `--picker-scrollbar-color`  | `#e74c3c`    | Scrollbar thumb color        |
| `--picker-scrollbar-track`  | `transparent`| Scrollbar track background   |
| `--picker-scrollbar-hover`  | `#ff9b92`    | Scrollbar thumb hover color  |

### Styling Example

```css
iconify-picker {
  /* Main colors */
  --picker-primary: #3498db;
  --picker-bg: #f8f9fa;
  --picker-text: #2c3e50;
  
  /* Element-specific colors */
  --picker-header-bg: #edf2f7;
  --picker-input-bg: #ffffff;
  --picker-footer-bg: #edf2f7;
  
  /* Border and shape */
  --picker-container-radius: 16px;
  --picker-input-radius: 8px;
  --picker-icon-radius: 4px;
  
  /* Sizing */
  --picker-icon-size: 28px;
  --picker-padding: 12px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  iconify-picker {
    --picker-bg: #1a2333;
    --picker-text: #ecf0f1;
    --picker-border: #2c3e50;
    --picker-header-bg: #192230;
    --picker-input-bg: #253545;
    --picker-input-text: #ecf0f1;
  }
}
```

### Shadow Parts for Advanced Styling

The component exposes shadow parts for advanced styling using the `::part()` selector:

```css
/* Style the container */
iconify-picker::part(container) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Style the search input */
iconify-picker::part(search) {
  border-color: purple;
}

/* Style the icons */
iconify-picker::part(icon) {
  transition: transform 0.2s;
}

iconify-picker::part(icon):hover {
  transform: scale(1.1);
}
```

Available parts:
- `container` - Main component container
- `header` - Top section with search and collection selector
- `footer` - Bottom section with pagination
- `search` - Search input
- `select` - Collection dropdown
- `grid` - Icon grid container
- `icon` - Individual icon item
- `icon-image` - The icon SVG/image itself
- `button` - Navigation buttons
- `pagination` - Pagination controls

---

## Autonomous Mode Pattern

This component follows the **Autonomous Mode** pattern:

- Declarative configuration (`<iconify-picker mode="button">`)
- Built-in display modes (`inline`, `button`, `manual`)
- Style control via custom properties + `::part()`
- No framework, no setup required

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
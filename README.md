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

Here’s a **README template** for an **Autonomous Mode Component**—tailored to your standards. It emphasizes declarative usage, minimalism, browser-native behavior, and styling flexibility.

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
| `theme`       | Optional: `light`, `dark`, or custom         |
| `filter`      | Initial filter query                         |

---

## Events

| Event            | Detail Payload                          |
|------------------|-----------------------------------------|
| `icon-selected`  | `{ name, collection, category }`        |

```js
picker.addEventListener('icon-selected', (e) => {
  console.log(e.detail.name);
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

Customize with CSS custom properties:

```html
<iconify-picker
  collection="mdi"
  style="
    --picker-bg: #111;
    --picker-color: #eee;
    --picker-icon-size: 32px;
    --picker-accent: hotpink;
    --picker-radius: 8px;
  "
></iconify-picker>
```

### Exposed Parts (for `::part()`)

```css
iconify-picker::part(button) {
  padding: 0.5rem 1rem;
  background: var(--picker-accent);
}
```

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
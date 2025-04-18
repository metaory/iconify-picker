# 🚧 `<iconify-picker>`

Zero-dependency icon picker with built-in UI modes and native events

A modern, zero-dependency icon picker built as a custom element. Drop in anywhere — no framework required. Toggleable display modes (inline, button, manual), custom events, and fully themeable with CSS vars.


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
<iconify-picker collection="mdi" />
```

### Button-Toggled Picker

```html
<iconify-picker
  mode="button"
  button-label="Choose Icon"
  collection="mdi"
  theme="dark"
  filter="*:*:*"
/>
```

### Programmatic Display

```html
<iconify-picker 
  id="picker"
  mode="manual"
  hidden
  collection="mdi"
/>

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
/>
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

## License

MIT
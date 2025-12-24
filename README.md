# Iconify Picker Web Component

Zero-dependency, framework-agnostic icon picker powered by Iconify.

## Install

- Package managers:
  - `npm install iconify-picker`
  - `pnpm add iconify-picker`
- CDN:
  - `https://cdn.jsdelivr.net/npm/iconify-picker@0.6.2/lib/iconify-picker.js`
  - `https://unpkg.com/iconify-picker@0.6.2/lib/iconify-picker.js`

## Use

Module import (npm/pnpm)

```js
import 'iconify-picker' // registers <iconify-picker>
// or: import IconifyPicker from 'iconify-picker'
```

```html
<iconify-picker collection="mdi"></iconify-picker>
```

CDN

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/iconify-picker@0.6.2/lib/iconify-picker.js"></script>
<iconify-picker collection="mdi"></iconify-picker>
```

Button mode

```html
<iconify-picker mode="button" button-label="Choose Icon" collection="lucide"></iconify-picker>
```

Manual control

```html
<iconify-picker id="picker" mode="manual" hidden collection="tabler"></iconify-picker>
<script type="module">
  picker.show()
  picker.addEventListener('icon-selected', (e) => console.log(e.detail.iconName))
</script>
```

Hide search or collection dropdown

```html
<iconify-picker collection="mdi" hide-search></iconify-picker>
<iconify-picker collection="lucide" hide-collection></iconify-picker>
<iconify-picker collection="heroicons" hide-search hide-collection></iconify-picker>
```

## Attributes

`collection`, `mode` (`inline`|`button`|`manual`), `button-label`, `theme` (`light`|`dark`|`auto`), `filter`, `search`, `page-size`, `selected`, `height`, `hidden`, `hide-search`, `hide-collection`

## Events

- `icon-selected`: `{ iconName, collection, name, svg }`
- `change`: same payload for form compatibility

## Methods

`.show()`, `.hide()`, `.toggle()`, `.reset()`, `.focus()`

## Styling

CSS custom properties prefixed with `--picker-*` (colors, radius, borders, spacing, scrollbar). Shadow parts: `container`, `header`, `footer`, `search`, `select`, `grid`, `icon`, `icon-image`, `button`, `pagination`.

## References

- Docs site: https://metaory.github.io/iconify-picker/
- Vanilla example: `examples/vanilla/index.html`
- Package: `lib/iconify-picker.js`

## Development

```bash
pnpm install
pnpm run dev
pnpm run build
```

## License

MIT


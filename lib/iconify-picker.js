/**
 * Iconify Picker Web Component
 * Zero-dependency, framework-agnostic icon picker
 */

const HOSTS = [
  'https://api.iconify.design',
  'https://api.simplesvg.com',
  'https://api.unisvg.com',
]

const remote = { host: 0, pending: new Map(), json: new Map() }

const readPath = async path => {
  const order = HOSTS.map((_, i) => HOSTS[(remote.host + i) % HOSTS.length])
  const data = await order.reduce(async (prev, host) => {
    const found = await prev
    if (found) return found
    const res = await fetch(`${host}${path}`).catch(() => null)
    remote.host = HOSTS.indexOf(host)
    if (!res?.ok) {
      remote.host = (remote.host + 1) % HOSTS.length
      return null
    }
    return res.json()
  }, Promise.resolve(null))
  remote.pending.delete(path)
  if (data) remote.json.set(path, data)
  return data
}

const loadPath = path => {
  const cached = remote.json.get(path)
  if (cached) return cached
  const pending = remote.pending.get(path)
  if (pending) return pending
  const job = readPath(path)
  remote.pending.set(path, job)
  return job
}

const iconsPath = (prefix, query) => query
  ? `/search?prefix=${prefix}&limit=999&query=${encodeURIComponent(query)}`
  : `/list-icons?prefix=${prefix}`

const glyphs = new Map()
const glyphJobs = new Map()

const groupsOf = (names, size) => names.reduce((rows, name) => {
  const row = rows.at(-1)
  if (row && row.length < size) row.push(name)
  else rows.push([name])
  return rows
}, [])

const fetchGlyphs = async (prefix, names) => {
  const groups = groupsOf(names, 48)
  await Promise.all(groups.map(async group => {
    const data = await loadPath(`/${prefix}.json?icons=${group.map(encodeURIComponent).join(',')}`)
    const width = data?.width || 16
    const height = data?.height || 16
    const icons = data?.icons || {}
    const aliases = data?.aliases || {}
    group.map(name => {
      const parent = aliases[name]?.parent
      const icon = icons[name] || icons[parent]
      glyphs.set(`${prefix}:${name}`, icon?.body ? {
        body: icon.body,
        width: icon.width || width,
        height: icon.height || height,
      } : null)
    })
  }))
}

const loadGlyphs = (prefix, names) => {
  const missing = [...new Set(names.filter(name => !glyphs.has(`${prefix}:${name}`)))]
  if (!missing.length) return Promise.resolve()
  const id = `${prefix}:${missing.join(',')}`
  const pending = glyphJobs.get(id)
  if (pending) return pending
  const job = fetchGlyphs(prefix, missing).finally(() => glyphJobs.delete(id))
  glyphJobs.set(id, job)
  return job
}

const glyphSvg = (prefix, name) => {
  const glyph = glyphs.get(`${prefix}:${name}`)
  if (!glyph?.body) return ''
  return `<svg viewBox="0 0 ${glyph.width} ${glyph.height}" part="icon-image">${glyph.body}</svg>`
}

class IconifyPicker extends HTMLElement {
  static observedAttributes = [
    'collection',
    'page-size',
    'height',
    'theme',
    'search',
    'selected',
    'mode',
    'button-label',
    'filter',
    'hidden',
    'hide-search',
    'hide-collection',
  ]

  // Attribute to state key mapping
  static attrMap = {
    collection: 'currentCollection',
    'page-size': 'pageSize',
    theme: 'theme',
    search: 'searchTerm',
    selected: 'selectedIcon',
    mode: 'mode',
    'button-label': 'buttonLabel',
    filter: 'filter',
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._iconsReq = 0
    this.#initState()
    this.shadowRoot.innerHTML = this.#template()
    this.#bindEvents()
    this.#loadCollections()
  }

  #initState() {
    const initial = {
      collections: [],
      currentCollection: '',
      icons: [],
      searchTerm: '',
      pageSize: 60,
      currentPage: 0,
      browsePage: 0,
      totalPages: 0,
      selectedIcon: null,
      loading: false,
      error: null,
      theme: 'auto',
      mode: 'inline',
      buttonLabel: 'Choose Icon',
      filter: '',
      open: false,
    }

    this.state = new Proxy(initial, {
      set: (obj, prop, val) => {
        if (obj[prop] === val) return true
        obj[prop] = val
        this.#scheduleRender()
        return true
      },
    })
  }

  #scheduleRender() {
    if (this._pending) return
    this._pending = true
    requestAnimationFrame(() => {
      this.#render()
      this._pending = false
    })
  }

  #template() {
    return /*html*/ `
<style>
:host {
  display: block;
  width: 100%;
  height: 100%;
  font-family: system-ui, sans-serif;
  /* Main colors */
  --picker-primary: var(--primary, #ff5c8a);
  --picker-bg: var(--bg, #181825);
  --picker-text: var(--text, #f5f5f5);
  --picker-border: var(--border, #313244);
  --picker-hover: var(--hover, #1e1e2e);
  /* Element colors */
  --picker-header-bg: var(--header-bg, var(--picker-bg));
  --picker-input-bg: var(--input-bg, #252535);
  --picker-input-text: var(--input-text, var(--picker-text));
  --picker-icon-color: var(--icon-color, var(--picker-text));
  --picker-footer-bg: var(--footer-bg, var(--picker-bg));
  /* Base sizing */
  --picker-radius: var(--radius, 12px);
  --picker-border-width: var(--border-width, 3px);
  --picker-padding: var(--padding, 1rem);
  --picker-gap: var(--gap, 0.5rem);
  --picker-icon-size: var(--icon-size, 24px);
  --picker-cell-size: var(--cell-size, 60px);
  /* Granular radius */
  --picker-container-radius: var(--container-radius, var(--picker-radius));
  --picker-input-radius: var(--input-radius, 8px);
  --picker-icon-radius: var(--icon-radius, 6px);
  --picker-button-radius: var(--button-radius, 8px);
  /* Granular border width */
  --picker-container-border-width: var(--container-border-width, var(--picker-border-width));
  --picker-input-border-width: var(--input-border-width, 1px);
  --picker-icon-border-width: var(--icon-border-width, 1px);
  /* Scrollbar */
  --picker-scrollbar-width: var(--scrollbar-width, thin);
  --picker-scrollbar-color: var(--scrollbar-color, var(--picker-primary));
  --picker-scrollbar-track: var(--scrollbar-track, transparent);
  --picker-scrollbar-hover: var(--scrollbar-hover, #ff8aa5);
  color-scheme: dark light;
}
.container {
  border: var(--picker-container-border-width) solid var(--picker-border);
  border-radius: var(--picker-container-radius);
  background: var(--picker-bg);
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  color: var(--picker-text);
  overflow: hidden;
}
.header {
  padding: var(--picker-padding);
  border-bottom: 1px solid var(--picker-border);
  display: flex;
  gap: var(--picker-gap);
  background: var(--picker-header-bg);
}
.search {
  flex: 1;
  padding: 0.5rem 1rem;
  border: var(--picker-input-border-width) solid var(--picker-border);
  border-radius: var(--picker-input-radius);
  background: var(--picker-input-bg);
  color: var(--picker-input-text);
  font-size: 0.875rem;
}
.select {
  padding: 0.5rem 1rem;
  border: var(--picker-input-border-width) solid var(--picker-border);
  border-radius: var(--picker-input-radius);
  background: var(--picker-input-bg);
  color: var(--picker-input-text);
  font-size: 0.875rem;
  min-width: 150px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--picker-cell-size), 1fr));
  gap: var(--picker-gap);
  padding: var(--picker-padding);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: var(--picker-scrollbar-width);
  scrollbar-color: var(--picker-scrollbar-color) var(--picker-scrollbar-track);
}
.grid::-webkit-scrollbar { width: 8px; }
.grid::-webkit-scrollbar-track { background: var(--picker-scrollbar-track); }
.grid::-webkit-scrollbar-thumb { background: var(--picker-scrollbar-color); border-radius: 4px; }
.grid::-webkit-scrollbar-thumb:hover { background: var(--picker-scrollbar-hover); }
.icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: var(--picker-icon-border-width) solid transparent;
  border-radius: var(--picker-icon-radius);
  cursor: pointer;
  transition: all 0.15s;
}
.icon:hover {
  background: var(--picker-hover);
  border-color: var(--picker-primary);
}
.icon.selected {
  background: color-mix(in srgb, var(--picker-primary) 20%, transparent);
  border-color: var(--picker-primary);
}
.icon svg {
  width: var(--picker-icon-size);
  height: var(--picker-icon-size);
  margin-bottom: 0.25rem;
  color: var(--picker-icon-color);
}
.name {
  font-size: 0.7rem;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  opacity: 0.8;
}
.footer {
  padding: var(--picker-padding);
  border-top: 1px solid var(--picker-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--picker-footer-bg);
}
.pagination {
  display: flex;
  gap: var(--picker-gap);
  align-items: center;
}
.btn {
  padding: 0.4rem 0.8rem;
  border: var(--picker-input-border-width) solid var(--picker-border);
  border-radius: var(--picker-button-radius);
  background: var(--picker-input-bg);
  color: var(--picker-input-text);
  cursor: pointer;
  font-size: 0.8rem;
}
.btn:hover:not(:disabled) { background: var(--picker-primary); color: #fff; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.selected-display {
  display: flex;
  align-items: center;
  gap: var(--picker-gap);
  font-size: 0.8rem;
}
.selected-display svg {
  width: 24px;
  height: 24px;
  color: var(--picker-icon-color);
}
.status { padding: 2rem; text-align: center; opacity: 0.7; }
.toggle-btn {
  padding: 0.5rem 1rem;
  background: var(--picker-primary);
  color: #fff;
  border: none;
  border-radius: var(--picker-button-radius);
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
</style>
<div class="container" part="container">
  <div class="header" part="header">
    <input type="text" class="search" part="search" placeholder="Search icons..." />
    <select class="select" part="select"><option>Loading...</option></select>
  </div>
  <div class="grid" part="grid"><div class="status">Loading collections...</div></div>
  <div class="footer" part="footer">
    <div class="pagination" part="pagination">
      <button class="btn prev" part="button" disabled>Prev</button>
      <span class="page-info" part="page-info">Page 1</span>
      <button class="btn next" part="button" disabled>Next</button>
    </div>
    <div class="selected-display" part="selected"></div>
  </div>
</div>`
  }

  // Selectors
  $(s) { return this.shadowRoot.querySelector(s) }
  $$(s) { return [...this.shadowRoot.querySelectorAll(s)] }

  #bindEvents() {
    const debounce = (fn, ms = 250) => {
      let t
      return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) }
    }

    const search = debounce(term => this.#search(term), 300)
    this.$('.search').oninput = e => search(e.target.value)

    this.$('.select').onchange = e => {
      this.state.currentCollection = e.target.value
      this.state.currentPage = 0
      this.state.browsePage = 0
      this.#loadIcons()
    }

    this.$('.prev').onclick = () => this.#navigate(-1)
    this.$('.next').onclick = () => this.#navigate(1)
  }

  #search(raw) {
    const term = raw.trim()
    const { searchTerm, currentPage, browsePage } = this.state
    if (term === searchTerm) return
    if (!searchTerm) this.state.browsePage = currentPage
    this.state.currentPage = term ? 0 : browsePage
    this.state.searchTerm = term
    this.#loadIcons()
  }

  #navigate(dir) {
    const { currentPage, totalPages } = this.state
    const next = currentPage + dir
    if (next >= 0 && next < totalPages) {
      this.state.currentPage = next
      this.#renderIcons()
      this.#renderPagination()
    }
  }

  async #loadCollections() {
    const data = await loadPath('/collections')
    if (!data) return this.state.error = 'Failed to load collections'
    const collections = Object.entries(data)
      .map(([prefix, info]) => ({ prefix, name: info.name || prefix, total: info.total || 0 }))
      .sort((a, b) => a.name.localeCompare(b.name))

    this.state.collections = collections
    this.#populateSelect(collections)

    // Auto-select first or use attribute
    const initial = this.getAttribute('collection') || collections[0]?.prefix
    if (initial) {
      this.state.currentCollection = initial
      this.$('.select').value = initial
      this.#loadIcons()
    }
  }

  #populateSelect(collections) {
    this.$('.select').innerHTML = collections
      .map(c => `<option value="${c.prefix}">${c.name} (${c.total})</option>`)
      .join('')
  }

  async #loadIcons() {
    const { currentCollection, searchTerm } = this.state
    if (!currentCollection) return

    const req = ++this._iconsReq
    this.state.error = null
    this.state.loading = true
    const data = await loadPath(iconsPath(currentCollection, searchTerm))
    if (req !== this._iconsReq) return
    this.state.loading = false
    if (!data?.icons) return this.state.error = 'Failed to load icons'
    this.state.icons = data.icons.map(id => id.split(':').at(-1))
  }

  #render() {
    const { mode, open } = this.state
    const container = this.$('.container')
    if (!container) return

    // Mode handling
    if (mode === 'button') {
      if (!this.$('.toggle-btn')) {
        const btn = document.createElement('button')
        btn.className = 'toggle-btn'
        btn.setAttribute('part', 'toggle-button')
        btn.textContent = this.state.buttonLabel
        btn.onclick = () => this.toggle()
        this.shadowRoot.insertBefore(btn, container)
      }
      this.$('.toggle-btn').textContent = this.state.buttonLabel
      container.style.display = open ? 'grid' : 'none'
    } else if (mode === 'manual') {
      container.style.display = open ? 'grid' : 'none'
    } else {
      container.style.display = 'grid'
    }

    this.#renderIcons()
    this.#renderPagination()
    this.#renderSelected()
    this.#updateVisibility()
  }

  #renderIcons() {
    const grid = this.$('.grid')
    const { icons, currentPage, pageSize, loading, error, currentCollection, selectedIcon } = this.state

    if (loading) return grid.innerHTML = '<div class="status">Loading...</div>'
    if (error) return grid.innerHTML = `<div class="status">${error}</div>`

    const total = Math.ceil(icons.length / pageSize)
    if (total !== this.state.totalPages) this.state.totalPages = total

    const page = icons.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    if (!page.length) return grid.innerHTML = '<div class="status">No icons found</div>'

    const ready = page.every(name => glyphs.has(`${currentCollection}:${name}`))
    if (!ready) loadGlyphs(currentCollection, page).then(() => {
      if (this.state.currentCollection !== currentCollection) return
      if (this.state.currentPage !== currentPage) return
      this.#renderIcons()
    })

    grid.innerHTML = page.map(name => {
      const full = `${currentCollection}:${name}`
      const sel = selectedIcon === full ? 'selected' : ''
      return `<div class="icon ${sel}" part="icon" data-name="${name}">
        ${glyphSvg(currentCollection, name)}
        <span class="name" part="icon-name">${name}</span>
      </div>`
    }).join('')

    grid.onclick = e => {
      const icon = e.target.closest('.icon')
      if (icon) this.#selectIcon(icon.dataset.name)
    }
  }

  #renderPagination() {
    const { currentPage, totalPages } = this.state
    this.$('.prev').disabled = currentPage === 0
    this.$('.next').disabled = currentPage >= totalPages - 1
    this.$('.page-info').textContent = `Page ${currentPage + 1} of ${totalPages || 1}`
  }

  #renderSelected() {
    const { selectedIcon, currentCollection } = this.state
    const el = this.$('.selected-display')
    if (!selectedIcon) return el.innerHTML = ''

    const name = selectedIcon.split(':')[1]
    el.innerHTML = `<span>${selectedIcon}</span>${glyphSvg(currentCollection, name)}`
  }

  #updateVisibility() {
    const searchEl = this.$('.search')
    const selectEl = this.$('.select')
    const headerEl = this.$('.header')
    if (!searchEl || !selectEl || !headerEl) return

    const hideSearch = this.hasAttribute('hide-search')
    const hideCollection = this.hasAttribute('hide-collection')

    searchEl.style.display = hideSearch ? 'none' : ''
    selectEl.style.display = hideCollection ? 'none' : ''
    headerEl.style.display = (hideSearch && hideCollection) ? 'none' : ''
  }

  #selectIcon(name) {
    const { currentCollection } = this.state
    const iconName = `${currentCollection}:${name}`
    this.state.selectedIcon = iconName
    const glyph = glyphs.get(iconName)
    const svg = glyph?.body
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${glyph.width}" height="${glyph.height}" viewBox="0 0 ${glyph.width} ${glyph.height}">${glyph.body}</svg>`
      : ''

    const detail = { iconName, collection: currentCollection, name, svg }
    this.dispatchEvent(new CustomEvent('icon-selected', { detail, bubbles: true }))
    this.dispatchEvent(new CustomEvent('change', { detail, bubbles: true }))
  }

  attributeChangedCallback(attr, old, val) {
    if (old === val) return

    const key = IconifyPicker.attrMap[attr]
    if (key) {
      const parsed = attr === 'page-size' ? (parseInt(val, 10) || 60) : val
      this.state[key] = parsed
      if (['collection', 'search', 'filter'].includes(attr)) this.#loadIcons()
      if (attr === 'mode') {
        this.state.open = parsed === 'inline'
        if (this.shadowRoot && this.$('.container')) {
          this.#render()
        }
      }
    }

    if (attr === 'search') this.$('.search').value = val ?? ''
    if (attr === 'height') this.style.height = val
    if (attr === 'hidden') this.state.open = val === null
    if (['hide-search', 'hide-collection'].includes(attr)) this.#updateVisibility()
  }

  connectedCallback() {
    const mode = this.getAttribute('mode') || 'inline'
    if (this.state.mode !== mode) {
      this.state.mode = mode
    }
    this.state.open = mode === 'inline'
    this.#render()
    this.#updateVisibility()
  }

  // Public API
  show() { this.state.open = true; this.removeAttribute('hidden') }
  hide() { this.state.open = false; this.setAttribute('hidden', '') }
  toggle() { this.state.open ? this.hide() : this.show() }

  reset() {
    this.state.selectedIcon = null
    this.$('.search').value = ''
    this.#search('')
  }

  focus() {
    (this.$('.toggle-btn') || this.$('.search'))?.focus()
  }

  forceRedraw() {
    this.#renderIcons()
    this.#renderSelected()
  }
}

customElements.define('iconify-picker', IconifyPicker)
export default IconifyPicker

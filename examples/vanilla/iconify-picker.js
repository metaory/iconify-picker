const debug = (msg) => console.log(`[IconifyPicker] ${msg}`)

class IconifyPicker extends HTMLElement {
  static observedAttributes = [
    'collection', // Icon collection ID
    'page-size', // Icons per page
    'height', // Component height
    'theme', // light/dark/auto
    'search', // Initial filter
    'selected', // Pre-selected icon
    'mode', // inline/button/manual
    'button-label', // Button text
    'filter', // Filter pattern
    'hidden', // Visibility
  ]

  constructor() {
    super()
    debug('Constructor called')
    this.attachShadow({ mode: 'open' })

    // Setup reactive state with proxy and handlers
    this.setupState()

    // Initialize cache for API responses
    this.cache = new Map()

    // Initialize shadow DOM with template
    this.shadowRoot.innerHTML = this.template
    this.init()
  }

  // Initialize reactive state
  setupState() {
    const initialState = {
      collections: [],
      currentCollection: '',
      icons: [],
      searchTerm: '',
      pageSize: 60,
      currentPage: 0,
      totalPages: 0,
      selectedIcon: null,
      loading: false,
      error: null,
      theme: 'dark',
      mode: 'inline',
      buttonLabel: '',
      filter: '',
      open: true,
    }

    // Create proxy for reactive updates
    this.state = new Proxy(initialState, {
      set: (obj, prop, val) => {
        obj[prop] = val

        // Batch multiple renders with requestAnimationFrame
        if (!this._renderPending) {
          this._renderPending = true
          requestAnimationFrame(() => {
            this.render()
            this._renderPending = false
          })
        }
        return true
      },
    })
  }

  // Template for shadow DOM
  get template() {
    return /*html*/ `
      <style>
        :host {
          display: block;
          font-family: var(--picker-font, system-ui, -apple-system, sans-serif);
          
          /* Core theming variables */
          --picker-primary: var(--primary, #ff5c8a);
          --picker-bg: var(--bg, #181825);
          --picker-border: var(--border, #1e1e2e);
          --picker-hover: var(--hover, #222235);
          --picker-text: var(--text, #f5f5f5);
          
          /* Extended color variables for specific elements */
          --picker-header-bg: var(--header-bg, var(--picker-bg));
          --picker-input-bg: var(--input-bg, var(--picker-bg));
          --picker-input-text: var(--input-text, var(--picker-text));
          --picker-icon-color: var(--icon-color, var(--picker-text));
          --picker-footer-bg: var(--footer-bg, var(--picker-bg));
          
          /* Layout variables - with more granular control */
          --picker-radius: var(--radius, 1.2rem); 
          --picker-container-radius: var(--container-radius, var(--picker-radius));
          --picker-input-radius: var(--input-radius, calc(var(--picker-radius) * 0.6));
          --picker-icon-radius: var(--icon-radius, calc(var(--picker-radius) * 0.4));
          --picker-button-radius: var(--button-radius, var(--picker-input-radius));
          
          --picker-border-width: var(--border-thick, 4px);
          --picker-container-border-width: var(--container-border-width, var(--picker-border-width));
          --picker-input-border-width: var(--input-border-width, 1px);
          --picker-icon-border-width: var(--icon-border-width, 1px);
          
          --picker-grid-cols: var(--cols, repeat(auto-fill, minmax(60px, 1fr)));
          --picker-icon-size: var(--icon-size, 24px);
          --picker-max-height: var(--max-height, 60vh);
          
          /* Spacing variables */
          --picker-padding: var(--padding, 1rem);
          --picker-gap: var(--gap, 0.5rem);
          
          /* Scrollbar variables */
          --picker-scrollbar-width: var(--scrollbar-width, thin);
          --picker-scrollbar-color: var(--scrollbar-color, var(--picker-primary));
          --picker-scrollbar-track: var(--scrollbar-track, transparent);
          --picker-scrollbar-hover: var(--scrollbar-hover, color-mix(in srgb, var(--picker-primary) 70%, white));
          
          color-scheme: dark;
        }
        
        /* Base styling for SVG content - a simple approach */
        svg {
          color: var(--picker-icon-color);
          fill: var(--picker-icon-color);
          stroke: var(--picker-icon-color);
        }
        
        /* Default style for the container */
        .container {
          border: var(--picker-container-border-width) solid var(--picker-border);
          border-radius: var(--picker-container-radius);
          background: var(--picker-bg);
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100%;
          max-height: var(--picker-max-height);
          color: var(--picker-text);
          overflow: hidden; /* Ensure content respects border radius */
        }
        
        .header {
          padding: var(--picker-padding);
          border-bottom: var(--picker-input-border-width) solid var(--picker-border);
          display: grid;
          gap: var(--picker-gap);
          grid-template-columns: 1fr auto;
          background-color: var(--picker-header-bg);
        }
        
        .header-left, .header-right {
          display: flex;
          align-items: center;
        }
        
        .header-left {
          width: 100%;
        }
        
        .header-right {
          margin-left: var(--picker-gap);
        }
        
        .search {
          padding: 0.5rem 1rem;
          border: var(--picker-input-border-width) solid var(--picker-border);
          border-radius: var(--picker-input-radius);
          font-size: 0.875rem;
          width: 100%;
          background: var(--picker-input-bg);
          color: var(--picker-input-text);
        }
        
        .select {
          padding: 0.5rem 1rem;
          border: var(--picker-input-border-width) solid var(--picker-border);
          border-radius: var(--picker-input-radius);
          font-size: 0.875rem;
          min-width: 150px;
          background: var(--picker-input-bg);
          color: var(--picker-input-text);
        }
        
        .grid {
          display: grid;
          grid-template-columns: var(--picker-grid-cols);
          gap: var(--picker-gap);
          padding: var(--picker-padding);
          overflow-y: auto;
          overscroll-behavior: contain;
          height: 100%;
          max-height: var(--picker-grid-height, 400px);
          
          /* Modern scrollbar styling */
          scrollbar-width: var(--picker-scrollbar-width);
          scrollbar-color: var(--picker-scrollbar-color) var(--picker-scrollbar-track);
        }
        
        /* WebKit scrollbars for the grid */
        .grid::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        .grid::-webkit-scrollbar-track {
          background: var(--picker-scrollbar-track);
        }
        
        .grid::-webkit-scrollbar-thumb {
          background: var(--picker-scrollbar-color);
          border-radius: 10px;
        }
        
        .grid::-webkit-scrollbar-thumb:hover {
          background: var(--picker-scrollbar-hover);
        }
        
        .icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          border: var(--picker-icon-border-width) solid transparent;
          border-radius: var(--picker-icon-radius);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .icon:hover {
          background: var(--picker-hover);
          border-color: var(--picker-primary);
        }
        
        .icon.selected {
          background: color-mix(in srgb, var(--picker-primary) 20%, transparent);
          border-color: var(--picker-primary);
        }
        
        .icon svg, .icon img {
          width: var(--picker-icon-size);
          height: var(--picker-icon-size);
          margin-bottom: 0.5rem;
          color: var(--picker-icon-color);
          fill: var(--picker-icon-color);
          stroke: var(--picker-icon-color);
        }
        
        .name {
          font-size: 0.75rem;
          color: var(--picker-text);
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
        
        .footer {
          padding: var(--picker-padding);
          border-top: var(--picker-input-border-width) solid var(--picker-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--picker-footer-bg);
        }
        
        .pagination {
          display: flex;
          gap: var(--picker-gap);
          align-items: center;
        }
        
        .button {
          padding: 0.5rem 1rem;
          border: var(--picker-input-border-width) solid var(--picker-border);
          border-radius: var(--picker-button-radius);
          background: var(--picker-input-bg);
          color: var(--picker-input-text);
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .button:hover {
          background: var(--picker-primary);
          color: var(--picker-btn-text, #fff);
        }
        
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .selected {
          display: flex;
          align-items: center;
          gap: var(--picker-gap);
          font-size: 0.875rem;
        }
        
        .loading {
          display: grid;
          place-items: center;
          padding: 2rem;
          color: var(--picker-text);
        }
        
        .error {
          color: var(--picker-error, #ef4444);
          padding: 1rem;
          text-align: center;
        }
        
        .toggle-button {
          padding: 0.5rem 1rem;
          background: var(--picker-primary);
          color: var(--picker-btn-text, #fff);
          border: none;
          border-radius: var(--picker-button-radius);
          cursor: pointer;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
      </style>
      
      <div class="container" part="container">
        <div class="header" part="header">
          <div class="header-left">
            <input type="text" class="search" part="search" placeholder="Search icons..." />
          </div>
          <div class="header-right">
            <select class="select" part="select">
              <option value="">Loading collections...</option>
            </select>
          </div>
        </div>
        
        <div class="grid" part="grid">
          <div class="loading" part="loading">Loading icon collections...</div>
        </div>
        
        <div class="footer" part="footer">
          <div class="pagination" part="pagination">
            <button class="button" part="button prev" data-prev disabled>Previous</button>
            <span class="page-info" part="page-info">Page 1</span>
            <button class="button" part="button next" data-next disabled>Next</button>
          </div>
          <div class="selected" part="selected-container">
            <span class="selected-name" part="selected-name"></span>
            <div class="selected-icon" part="selected-icon"></div>
          </div>
        </div>
      </div>
    `
  }

  connectedCallback() {
    debug('Connected to DOM')
    // Ensure the component is visible when connected
    if (this.state.mode === 'inline') {
      this.style.display = 'block'
      this.$('.container').style.display = 'grid'
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return

    debug(`Attribute changed: ${name} from ${oldValue} to ${newValue}`)

    const handlers = {
      collection: () => {
        this.setState({ currentCollection: newValue })
        this.loadIcons()
      },
      'page-size': () => {
        this.setState({
          pageSize: Number.parseInt(newValue, 10) || 60,
        })
        this.loadIcons()
      },
      height: () => {
        this.style.setProperty('height', newValue)
      },
      theme: () => {
        this.setState({ theme: newValue || 'dark' })
        this.updateTheme()
      },
      search: () => {
        this.setState({ searchTerm: newValue })
        this.loadIcons()
      },
      selected: () => {
        this.setState({ selectedIcon: newValue })
        this.updateSelectedIcon()
      },
      mode: () => {
        this.setState({ mode: newValue || 'inline' })
      },
      'button-label': () => {
        this.setState({ buttonLabel: newValue || 'Choose Icon' })
      },
      filter: () => {
        this.setState({ filter: newValue })
        this.loadIcons()
      },
      hidden: () => {
        this.setState({ open: newValue === null })
      },
    }

    const handler = handlers[name]
    if (handler) {
      handler()
    }
  }

  // DOM element selector helpers
  $(selector) {
    return this.shadowRoot.querySelector(selector)
  }

  $$(selector) {
    return [...this.shadowRoot.querySelectorAll(selector)]
  }

  // Updates theme color scheme
  updateTheme() {
    const { theme } = this.state

    // If theme is 'auto', detect system preference or site theme
    if (theme === 'auto') {
      const isDarkMode =
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches

      this.applyThemeVariables(isDarkMode ? 'dark' : 'light')
    } else {
      // Apply specific theme
      this.applyThemeVariables(theme)
    }

    document.documentElement.style.colorScheme = theme === 'auto' ? 'light dark' : theme
  }

  // Apply theme-specific CSS variables
  applyThemeVariables(theme) {
    const container = this.$('.container')
    const host = this.shadowRoot.host
    if (!container) return

    const computedStyle = getComputedStyle(document.documentElement)

    // Function to get CSS value with fallback
    const getCSSValue = (variable, fallback) => {
      const val = computedStyle.getPropertyValue(variable).trim()
      return val || fallback
    }

    // Use a declarative map for theme variables - cleaner and more maintainable
    const themeVars = {
      // Core colors
      '--picker-primary': ['--c-pri', '#ff5c8a'],
      '--picker-bg': ['--c-bg', '#181825'],
      '--picker-border': ['--c-border', '#1e1e2e'],
      '--picker-hover': ['--c-bg-alt', '#222235'],
      '--picker-text': ['--c-txt', '#f5f5f5'],

      // Element colors
      '--picker-header-bg': ['--header-bg', '--c-bg', '#181825'],
      '--picker-input-bg': ['--input-bg', '--c-bg', '#181825'],
      '--picker-input-text': ['--input-text', '--c-txt', '#f5f5f5'],
      '--picker-icon-color': ['--icon-color', '--c-txt', '#f5f5f5'],
      '--picker-footer-bg': ['--footer-bg', '--c-bg', '#181825'],

      // Dimensions & Radius
      '--picker-radius': ['--rad', '1.2rem'],
      '--picker-container-radius': ['--container-radius', '--rad', '1.2rem'],
      '--picker-input-radius': ['--input-radius', 'calc(var(--rad, 1.2rem) * 0.6)'],
      '--picker-icon-radius': ['--icon-radius', 'calc(var(--rad, 1.2rem) * 0.4)'],
      '--picker-button-radius': ['--button-radius', 'calc(var(--rad, 1.2rem) * 0.6)'],

      // Border widths
      '--picker-border-width': ['--bw', '4px'],
      '--picker-container-border-width': ['--container-border-width', '--bw', '4px'],
      '--picker-input-border-width': ['--input-border-width', '1px'],
      '--picker-icon-border-width': ['--icon-border-width', '1px'],

      // Sizes and spacing
      '--picker-icon-size': ['--icon-size', '24px'],
      '--picker-max-height': ['--max-height', '60vh'],
      '--picker-padding': ['--padding', '1rem'],
      '--picker-gap': ['--gap', '0.5rem'],

      // Scrollbar
      '--picker-scrollbar-width': ['--scrollbar-width', 'thin'],
      '--picker-scrollbar-color': ['--c-pri', '#ff5c8a'],
      '--picker-scrollbar-track': ['--c-bg', 'transparent'],
      '--picker-scrollbar-hover': ['--c-pri', '#ff8aac'],
    }

    // Apply all variables from the map
    for (const [cssVar, fallbacks] of Object.entries(themeVars)) {
      // Process the fallbacks in order
      let value = ''
      for (const fallback of fallbacks) {
        if (fallback.startsWith('--')) {
          value = getCSSValue(fallback, '')
          if (value) break
        } else {
          value = fallback
          break
        }
      }
      host.style.setProperty(cssVar, value)
    }

    // Set icon filter based on theme - directly
    host.style.setProperty('--picker-icon-filter', theme === 'dark' ? 'invert(1)' : 'none')

    // Set direct container styles for compatibility
    Object.assign(container.style, {
      borderWidth: host.style.getPropertyValue('--picker-container-border-width'),
      borderRadius: host.style.getPropertyValue('--picker-container-radius'),
      backgroundColor: host.style.getPropertyValue('--picker-bg'),
      color: host.style.getPropertyValue('--picker-text'),
    })

    // Force redraw
    this.forceRedraw()
  }

  // Force redraw of all icons - useful when icon color changes
  forceRedraw() {
    // Force reflow of the grid element
    const grid = this.$('.grid')
    if (grid) {
      const currentOverflow = grid.style.overflow
      grid.style.overflow = 'hidden'
      // Trigger reflow and restore
      void grid.offsetHeight
      grid.style.overflow = currentOverflow
    }

    // Force refresh of icon colors by reloading them
    const updateIconColors = () => {
      const icons = this.$$('img[part="icon-image"]')
      if (icons.length) {
        const iconColor = getComputedStyle(this.shadowRoot.host)
          .getPropertyValue('--picker-icon-color')
          .trim()

        for (const img of icons) {
          // Update img with new color parameter to force refresh without reloading all icons
          const src = img.src.split('?')[0]
          img.src = `${src}?color=${encodeURIComponent(iconColor)}&t=${Date.now()}`
          img.style.color = 'var(--picker-icon-color)'
          img.style.fill = 'currentColor'
          img.style.stroke = 'currentColor'
        }
      }
    }

    // Only run when component is fully initialized
    if (this.state.icons.length > 0) {
      // Debounce to prevent excessive redraws
      clearTimeout(this._redrawTimer)
      this._redrawTimer = setTimeout(updateIconColors, 50)
    }
  }

  // Functional state update
  setState(newState) {
    Object.assign(this.state, newState)
  }

  // Initialize event listeners and load data
  init() {
    debug(`Initializing with mode: ${this.state.mode}`)
    this.bindEvents()
    this.loadCollections()

    // Add theme observer to sync with site theme
    this.observeThemeChanges()
  }

  // Bind DOM events (extracted for clarity)
  bindEvents() {
    // Debounced search
    this.$('.search').addEventListener(
      'input',
      this.debounce((e) => {
        this.setState({
          searchTerm: e.target.value,
          currentPage: 0,
        })
        this.loadIcons()
      }),
    )

    // Collection selector
    this.$('.select').addEventListener('change', (e) => {
      this.setState({
        currentCollection: e.target.value,
        currentPage: 0,
      })
      this.loadIcons()
    })

    // Pagination
    this.$('[data-prev]').addEventListener('click', () => this.navigatePage(-1))
    this.$('[data-next]').addEventListener('click', () => this.navigatePage(1))
  }

  // Navigate pages - functional approach
  navigatePage(direction) {
    const { currentPage, totalPages } = this.state
    const newPage = currentPage + direction

    if (newPage >= 0 && newPage < totalPages) {
      this.setState({ currentPage: newPage })
      this.loadIcons()
    }
  }

  // Simple debounce function
  debounce(fn, delay = 300) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), delay)
    }
  }

  // Fetch available icon collections
  async loadCollections() {
    try {
      this.setState({ loading: true })

      const response = await fetch('https://api.iconify.design/collections')

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      if (!data || typeof data !== 'object') throw new Error('Invalid collections data')

      const collections = Object.entries(data)
        .map(([prefix, info]) => ({
          prefix,
          name: info.name || prefix,
          total: info.total || 0,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      this.setState({ collections })
      this.populateCollectionDropdown(collections)

      // Select first collection if none specified
      if (collections.length && !this.state.currentCollection) {
        const firstCollection = collections[0].prefix
        this.setState({ currentCollection: firstCollection })
        this.$('.select').value = firstCollection
        await this.loadIcons()
      }
    } catch (error) {
      console.error('Error loading collections:', error)
      this.setState({ error: `Failed to load collections: ${error.message}` })
    } finally {
      this.setState({ loading: false })
    }
  }

  // Create collection dropdown options
  populateCollectionDropdown(collections) {
    const select = this.$('.select')

    const options = [
      '<option value="">Select a collection</option>',
      ...collections.map(
        (collection) =>
          `<option value="${collection.prefix}">${collection.name} (${collection.total})</option>`,
      ),
    ]

    select.innerHTML = options.join('')
  }

  // Load icons for selected collection
  async loadIcons() {
    const { currentCollection, searchTerm } = this.state

    if (!currentCollection) return

    try {
      this.setState({ loading: true })

      // Check cache first
      const cacheKey = `${currentCollection}-${searchTerm}`
      if (this.cache.has(cacheKey)) {
        this.setState({ icons: this.cache.get(cacheKey) })
        return
      }

      const response = await fetch(
        `https://api.iconify.design/collection?prefix=${currentCollection}&pretty=1`,
      )

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      if (!data?.uncategorized) throw new Error('Invalid icons data')

      // Filter icons if search term exists
      const icons = this.filterIcons(data.uncategorized, searchTerm)

      this.setState({ icons })
      this.cache.set(cacheKey, icons)
    } catch (error) {
      console.error('Error loading icons:', error)
      this.setState({ error: `Failed to load icons: ${error.message}` })
    } finally {
      this.setState({ loading: false })
    }
  }

  // Pure function to filter icons by search term
  filterIcons(icons, searchTerm) {
    if (!searchTerm) return icons

    const lowerSearch = searchTerm.toLowerCase()
    return icons.filter((name) => name.toLowerCase().includes(lowerSearch))
  }

  // Update icon grid with current page of icons
  updateIcons() {
    const grid = this.$('.grid')
    const { currentPage, pageSize, icons, loading, error } = this.state

    // Calculate pagination
    const totalPages = Math.ceil(icons.length / pageSize)
    if (totalPages !== this.state.totalPages) {
      this.setState({ totalPages })
    }

    // Clear grid
    grid.innerHTML = ''

    // Show loading/error/empty states
    if (loading) {
      grid.innerHTML = '<div class="loading" part="loading">Loading icons...</div>'
      return
    }

    if (error) {
      grid.innerHTML = `<div class="error" part="error">${error}</div>`
      return
    }

    const pageIcons = this.getPageIcons(icons, currentPage, pageSize)

    if (!pageIcons.length) {
      grid.innerHTML = '<div class="loading" part="empty">No icons found</div>'
      return
    }

    // Render icons
    grid.appendChild(this.createIconsFragment(pageIcons))
  }

  // Pure function to get current page of icons
  getPageIcons(icons, page, pageSize) {
    const start = page * pageSize
    const end = start + pageSize
    return icons.slice(start, end)
  }

  // Create fragment of icon elements
  createIconsFragment(icons) {
    const { currentCollection, selectedIcon } = this.state
    const fragment = document.createDocumentFragment()

    for (const iconName of icons) {
      const isSelected = selectedIcon === `${currentCollection}:${iconName}`
      const icon = this.createIconElement(iconName, isSelected)
      fragment.appendChild(icon)
    }

    return fragment
  }

  // Create a single icon element
  createIconElement(iconName, isSelected) {
    const { currentCollection } = this.state

    const icon = document.createElement('div')
    icon.className = isSelected ? 'icon selected' : 'icon'
    icon.setAttribute('part', isSelected ? 'icon icon-selected' : 'icon')

    const iconContainer = document.createElement('div')
    iconContainer.setAttribute('part', 'icon-image-container')

    const img = document.createElement('img')
    const iconColor = getComputedStyle(this.shadowRoot.host)
      .getPropertyValue('--picker-icon-color')
      .trim()
    img.src = `https://api.iconify.design/${currentCollection}/${iconName}.svg?height=24&color=${encodeURIComponent(iconColor || 'currentColor')}`
    img.width = img.height = 24
    img.setAttribute('part', 'icon-image')
    img.onerror = () => {
      iconContainer.innerHTML = /*html*/ `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" part="icon-fallback">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      `
    }

    const name = document.createElement('div')
    name.className = 'name'
    name.setAttribute('part', 'icon-name')
    name.textContent = iconName

    iconContainer.appendChild(img)
    icon.appendChild(iconContainer)
    icon.appendChild(name)

    icon.addEventListener('click', () => this.selectIcon(iconName))

    return icon
  }

  // Update pagination controls
  updatePagination() {
    const { currentPage, totalPages } = this.state
    const prev = this.$('[data-prev]')
    const next = this.$('[data-next]')
    const pageInfo = this.$('.page-info')

    prev.disabled = currentPage === 0
    next.disabled = currentPage >= totalPages - 1
    pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages || 1}`
  }

  // Handle icon selection
  async selectIcon(iconName) {
    const { currentCollection } = this.state
    const selectedIcon = `${currentCollection}:${iconName}`

    this.setState({ selectedIcon })

    try {
      // Get raw SVG
      const svgResponse = await fetch(
        `https://api.iconify.design/${currentCollection}/${iconName}.svg`,
      )
      const svg = await svgResponse.text()

      // Prepare event detail
      const detail = {
        iconName: selectedIcon,
        collection: currentCollection,
        name: iconName,
        svg,
      }

      // Dispatch events
      this.dispatchEvent(new CustomEvent('icon-selected', { detail }))
      this.dispatchEvent(new CustomEvent('change', { detail }))
    } catch (error) {
      console.error('Error fetching SVG:', error)
    }
  }

  // Update selected icon display
  updateSelectedIcon() {
    const selectedName = this.$('.selected-name')
    const selectedIconElement = this.$('.selected-icon')
    const { selectedIcon, currentCollection } = this.state

    if (!selectedIcon) return

    selectedName.textContent = selectedIcon
    const iconName = selectedIcon.split(':')[1]

    const img = document.createElement('img')
    const iconColor = getComputedStyle(this.shadowRoot.host)
      .getPropertyValue('--picker-icon-color')
      .trim()
    img.src = `https://api.iconify.design/${currentCollection}/${iconName}.svg?height=32&color=${encodeURIComponent(iconColor || 'currentColor')}`
    img.width = img.height = 32
    img.style.color = 'var(--picker-icon-color)'
    img.style.fill = 'currentColor'
    img.style.stroke = 'currentColor'

    selectedIconElement.innerHTML = ''
    selectedIconElement.appendChild(img)
  }

  // Main render method
  render() {
    debug(`Rendering with mode: ${this.state.mode}`)

    // Apply mode-specific rendering
    const renderMode = {
      button: this.renderButtonMode.bind(this),
      manual: this.renderManualMode.bind(this),
      inline: () => {
        this.$('.container').style.display = 'grid'
      },
    }[this.state.mode]

    // Call appropriate render method
    if (renderMode) {
      renderMode()
    }

    // Update UI components
    this.updateIcons()
    this.updatePagination()
    if (this.state.selectedIcon) {
      this.updateSelectedIcon()
    }
  }

  // Button mode UI
  renderButtonMode() {
    const container = this.$('.container')

    if (!this.$('.toggle-button')) {
      const button = document.createElement('button')
      button.className = 'toggle-button'
      button.setAttribute('part', 'toggle-button')
      button.textContent = this.state.buttonLabel || 'Choose Icon'
      button.addEventListener('click', () => this.toggle())

      this.shadowRoot.insertBefore(button, container)
    } else {
      this.$('.toggle-button').textContent = this.state.buttonLabel || 'Choose Icon'
    }

    container.style.display = this.state.open ? 'grid' : 'none'
  }

  // Manual mode UI
  renderManualMode() {
    const container = this.$('.container')
    container.style.display = this.state.open ? 'grid' : 'none'
  }

  // Public API methods
  show() {
    this.setState({ open: true })
    this.removeAttribute('hidden')
  }

  hide() {
    this.setState({ open: false })
    this.setAttribute('hidden', '')
  }

  toggle() {
    const { open } = this.state
    open ? this.hide() : this.show()
  }

  reset() {
    this.setState({
      selectedIcon: null,
      filter: '',
      searchTerm: '',
    })

    this.$('.search').value = ''
    this.$('.selected-name').textContent = ''
    this.$('.selected-icon').innerHTML = ''

    this.loadIcons()
  }

  focus() {
    const toggleButton = this.$('.toggle-button')
    const searchInput = this.$('.search')

    if (toggleButton) {
      toggleButton.focus()
    } else if (searchInput) {
      searchInput.focus()
    }
  }

  // Observe site theme changes
  observeThemeChanges() {
    // Watch for .dark class changes on HTML element
    const htmlElement = document.documentElement

    // Create mutation observer for class changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const isDark = htmlElement.classList.contains('dark')
          this.applyThemeVariables(isDark ? 'dark' : 'light')
        }
      }
    })

    // Start observing
    observer.observe(htmlElement, { attributes: true })

    // Also watch for system preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    darkModeMediaQuery.addEventListener('change', (e) => {
      if (this.state.theme === 'auto') {
        this.applyThemeVariables(e.matches ? 'dark' : 'light')
      }
    })

    // Initial theme application
    if (this.state.theme === 'auto') {
      const isDark =
        htmlElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      this.applyThemeVariables(isDark ? 'dark' : 'light')
    }
  }
}

// Register component
debug('Defining custom element')
customElements.define('iconify-picker', IconifyPicker)

export default IconifyPicker

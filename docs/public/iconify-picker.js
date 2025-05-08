// IconifyBrowser.js
class IconifyBrowser extends HTMLElement {
  static get observedAttributes() {
    return [
      'collection',    // Default collection to show
      'page-size',     // Number of icons per page
      'height',        // Component height
      'theme',         // light/dark/auto
      'search',        // Initial search term
      'selected',      // Pre-selected icon
      'mode',          // Picker mode (inline, button, manual)
      'button-label',  // Button label for the picker
      'filter',        // Filter for icons
      'hidden'         // Hidden attribute
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = new Proxy({
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
      theme: 'auto',
      mode: 'inline',
      buttonLabel: '',
      filter: '',
      open: true
    }, {
      set: (target, key, value) => {
        target[key] = value;
        this.render();
        return true;
      }
    });
    
    this.cache = new Map();
    this.debounceTimer = null;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
          --primary: #4f46e5;
          --border: #e5e7eb;
          --hover: #f3f4f6;
          --text: #1f2937;
          --bg: #ffffff;
          color-scheme: dark;
        }
        
        .container {
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg);
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100%;
          max-height: 80vh;
        }
        
        .header {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr auto;
        }
        
        .search {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.875rem;
          width: 100%;
          background: var(--bg);
        }
        
        .select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.875rem;
          min-width: 200px;
          background: var(--bg);
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.5rem;
          padding: 1rem;
          overflow-y: auto;
          overscroll-behavior: contain;
        }
        
        .icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .icon:hover {
          background: var(--hover);
          border-color: var(--border);
        }
        
        .icon.selected {
          background: color-mix(in srgb, var(--primary) 10%, transparent);
          border-color: var(--primary);
        }
        
        .icon svg {
          width: 24px;
          height: 24px;
          margin-bottom: 0.5rem;
        }
        
        .name {
          font-size: 0.75rem;
          color: var(--text);
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
        
        .footer {
          padding: 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .pagination {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .button {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .selected {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .loading {
          display: grid;
          place-items: center;
          padding: 2rem;
          color: var(--text);
        }
        
        .error {
          color: #ef4444;
          padding: 1rem;
          text-align: center;
        }
      </style>
      
      <div class="container">
        <div class="header">
          <input type="text" class="search" placeholder="Search icons..." />
          <select class="select">
            <option value="">Loading collections...</option>
          </select>
        </div>
        
        <div class="grid">
          <div class="loading">Loading icon collections...</div>
        </div>
        
        <div class="footer">
          <div class="pagination">
            <button class="button" data-prev disabled>Previous</button>
            <span class="page-info">Page 1</span>
            <button class="button" data-next disabled>Next</button>
          </div>
          <div class="selected">
            <span class="selected-name"></span>
            <div class="selected-icon"></div>
          </div>
        </div>
      </div>
    `;
    
    this.init();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'collection':
        this.setState({ currentCollection: newValue });
        this.loadIcons();
        break;
      case 'page-size':
        this.setState({ pageSize: Number.parseInt(newValue, 10) || 60 });
        this.loadIcons();
        break;
      case 'height':
        this.style.height = newValue;
        break;
      case 'theme':
        this.setState({ theme: newValue });
        this.updateTheme();
        break;
      case 'search':
        this.setState({ searchTerm: newValue });
        this.loadIcons();
        break;
      case 'selected':
        this.setState({ selectedIcon: newValue });
        this.updateSelectedIcon();
        break;
      case 'mode':
        this.setState({ mode: newValue });
        break;
      case 'button-label':
        this.setState({ buttonLabel: newValue });
        break;
      case 'filter':
        this.setState({ filter: newValue });
        this.loadIcons();
        break;
      case 'hidden':
        this.setState({ open: newValue === null });
        break;
    }
  }
  
  updateTheme() {
    const { theme } = this.state;
    const root = document.documentElement;
    
    if (theme === 'auto') {
      root.style.colorScheme = 'light dark';
    } else {
      root.style.colorScheme = theme;
    }
  }
  
  setState(newState) {
    Object.assign(this.state, newState);
    this.render();
  }
  
  init() {
    const search = this.shadowRoot.querySelector('.search');
    const select = this.shadowRoot.querySelector('.select');
    const prev = this.shadowRoot.querySelector('[data-prev]');
    const next = this.shadowRoot.querySelector('[data-next]');
    
    search.addEventListener('input', e => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.setState({
          searchTerm: e.target.value,
          currentPage: 0
        });
        this.loadIcons();
      }, 300);
    });
    
    select.addEventListener('change', e => {
      this.setState({
        currentCollection: e.target.value,
        currentPage: 0
      });
      this.loadIcons();
    });
    
    prev.addEventListener('click', () => {
      if (this.state.currentPage > 0) {
        this.setState({ currentPage: this.state.currentPage - 1 });
        this.loadIcons();
      }
    });
    
    next.addEventListener('click', () => {
      if (this.state.currentPage < this.state.totalPages - 1) {
        this.setState({ currentPage: this.state.currentPage + 1 });
        this.loadIcons();
      }
    });
    
    this.loadCollections();
  }
  
  async loadCollections() {
    try {
      console.log('Fetching collections...');
      const response = await fetch('https://api.iconify.design/collections');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid collections data');
      }
      
      const collections = Object.entries(data)
        .map(([prefix, info]) => ({
          prefix,
          name: info.name || prefix,
          total: info.total || 0
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      this.setState({ collections });
      
      const select = this.shadowRoot.querySelector('.select');
      if (!select) {
        throw new Error('Select element not found in shadow DOM');
      }
      
      select.innerHTML = '<option value="">Select a collection</option>';
      
      for (const collection of collections) {
        const option = document.createElement('option');
        option.value = collection.prefix;
        option.textContent = `${collection.name} (${collection.total})`;
        select.appendChild(option);
      }
      
      // Select the first collection by default if no collection is specified
      if (collections.length > 0 && !this.state.currentCollection) {
        select.value = collections[0].prefix;
        this.setState({ currentCollection: collections[0].prefix });
        await this.loadIcons();
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      this.setState({ error: `Failed to load collections: ${error.message}` });
    }
  }
  
  async loadIcons() {
    if (!this.state.currentCollection) {
      console.log('No collection selected, skipping icon load');
      return;
    }
    
    try {
      console.log('Loading icons for collection:', this.state.currentCollection);
      this.setState({ loading: true });
      
      const cacheKey = `${this.state.currentCollection}-${this.state.searchTerm}`;
      if (this.cache.has(cacheKey)) {
        console.log('Using cached icons for:', cacheKey);
        this.setState({ icons: this.cache.get(cacheKey) });
        return;
      }
      
      const response = await fetch(
        `https://api.iconify.design/collection?prefix=${this.state.currentCollection}&pretty=1`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.uncategorized) {
        throw new Error('Invalid icons data');
      }
      
      let icons = data.uncategorized;
      console.log('Found icons:', icons.length);
      
      if (this.state.searchTerm) {
        const term = this.state.searchTerm.toLowerCase();
        icons = icons.filter(name => name.toLowerCase().includes(term));
        console.log('Filtered icons:', icons.length);
      }
      
      this.setState({ icons });
      this.cache.set(cacheKey, icons);
    } catch (error) {
      console.error('Error loading icons:', error);
      this.setState({ error: `Failed to load icons: ${error.message}` });
    } finally {
      this.setState({ loading: false });
    }
  }
  
  updateIcons() {
    const grid = this.shadowRoot.querySelector('.grid');
    const start = this.state.currentPage * this.state.pageSize;
    const end = start + this.state.pageSize;
    const pageIcons = this.state.icons.slice(start, end);
    
    const totalPages = Math.ceil(this.state.icons.length / this.state.pageSize);
    if (totalPages !== this.state.totalPages) {
      this.setState({ totalPages });
    }
    
    grid.innerHTML = '';
    
    if (this.state.loading) {
      grid.innerHTML = '<div class="loading">Loading icons...</div>';
      return;
    }
    
    if (this.state.error) {
      grid.innerHTML = `<div class="error">${this.state.error}</div>`;
      return;
    }
    
    if (!pageIcons.length) {
      grid.innerHTML = '<div class="loading">No icons found</div>';
      return;
    }
    
    for (const iconName of pageIcons) {
      const icon = document.createElement('div');
      icon.className = 'icon';
      if (this.state.selectedIcon === `${this.state.currentCollection}:${iconName}`) {
        icon.classList.add('selected');
      }
      
      const svg = document.createElement('div');
      const img = document.createElement('img');
      img.src = `https://api.iconify.design/${this.state.currentCollection}/${iconName}.svg?height=24`;
      img.width = 24;
      img.height = 24;
      img.onerror = () => {
        // Replace with a placeholder or remove the icon
        svg.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        `;
      };
      svg.appendChild(img);
      
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = iconName;
      
      icon.appendChild(svg);
      icon.appendChild(name);
      
      icon.addEventListener('click', () => this.selectIcon(iconName));
      grid.appendChild(icon);
    }
  }
  
  updatePagination() {
    const prev = this.shadowRoot.querySelector('[data-prev]');
    const next = this.shadowRoot.querySelector('[data-next]');
    const pageInfo = this.shadowRoot.querySelector('.page-info');
    
    prev.disabled = this.state.currentPage === 0;
    next.disabled = this.state.currentPage >= this.state.totalPages - 1;
    pageInfo.textContent = `Page ${this.state.currentPage + 1} of ${this.state.totalPages || 1}`;
  }
  
  async selectIcon(iconName) {
    const selectedIcon = `${this.state.currentCollection}:${iconName}`;
    this.setState({ selectedIcon });
    
    // Get raw SVG using the correct collection
    const svgResponse = await fetch(`https://api.iconify.design/${this.state.currentCollection}/${iconName}.svg`);
    const rawSvg = await svgResponse.text();
    
    // Dispatch events
    this.dispatchEvent(new CustomEvent('icon-selected', {
      detail: {
        iconName: selectedIcon,
        collection: this.state.currentCollection,
        name: iconName,
        svg: rawSvg
      }
    }));

    this.dispatchEvent(new CustomEvent('change', {
      detail: {
        iconName: selectedIcon,
        collection: this.state.currentCollection,
        name: iconName,
        svg: rawSvg
      }
    }));
  }

  updateSelectedIcon() {
    const selectedName = this.shadowRoot.querySelector('.selected-name');
    const selectedIconElement = this.shadowRoot.querySelector('.selected-icon');
    
    if (!this.state.selectedIcon) return;
    
    selectedName.textContent = this.state.selectedIcon;
    const iconParts = this.state.selectedIcon.split(':');
    if (iconParts.length === 2) {
      const img = document.createElement('img');
      img.src = `https://api.iconify.design/${iconParts[0]}/${iconParts[1]}.svg?height=32`;
      img.width = 32;
      img.height = 32;
      selectedIconElement.innerHTML = '';
      selectedIconElement.appendChild(img);
    }
  }

  render() {
    if (this.state.mode === 'button') {
      this.renderButtonMode();
    } else if (this.state.mode === 'manual') {
      this.renderManualMode();
    } else {
      this.renderInlineMode();
    }
    
    this.updateIcons();
    this.updatePagination();
    if (this.state.selectedIcon) {
      this.updateSelectedIcon();
    }
  }
  
  renderInlineMode() {
    // Inline mode is always visible
    this.style.display = 'block';
  }
  
  renderButtonMode() {
    const container = this.shadowRoot.querySelector('.container');
    const buttonExists = this.shadowRoot.querySelector('.toggle-button');
    
    if (!buttonExists) {
      const button = document.createElement('button');
      button.className = 'toggle-button';
      button.textContent = this.state.buttonLabel || 'Choose Icon';
      button.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        padding: 0.5rem 1rem;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        z-index: 1;
      `;
      
      button.addEventListener('click', () => this.toggle());
      
      this.shadowRoot.insertBefore(button, container);
    }
    
    if (this.state.open) {
      container.style.display = 'grid';
      container.style.marginTop = '2.5rem';
    } else {
      container.style.display = 'none';
    }
  }
  
  renderManualMode() {
    const container = this.shadowRoot.querySelector('.container');
    
    if (this.state.open) {
      container.style.display = 'grid';
      this.style.display = 'block';
    } else {
      container.style.display = 'none';
      if (this.hasAttribute('hidden')) {
        this.style.display = 'none';
      }
    }
  }

  show() { 
    this.state.open = true;
    this.removeAttribute('hidden');
  }
  
  hide() { 
    this.state.open = false;
    this.setAttribute('hidden', '');
  }
  
  toggle() { 
    this.state.open ? this.hide() : this.show();
  }
  
  reset() { 
    this.state.selectedIcon = null;
    this.state.filter = '';
    const selectedName = this.shadowRoot.querySelector('.selected-name');
    const selectedIconElement = this.shadowRoot.querySelector('.selected-icon');
    selectedName.textContent = '';
    selectedIconElement.innerHTML = '';
  }
  
  focus() { 
    const button = this.shadowRoot.querySelector('.toggle-button');
    if (button) {
      button.focus();
    } else {
      this.shadowRoot.querySelector('.search')?.focus();
    }
  }
}

// Self-register the component
if (!customElements.get('iconify-picker')) {
  customElements.define('iconify-picker', IconifyBrowser);
}

export default IconifyBrowser; 
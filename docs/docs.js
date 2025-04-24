import './docs.css'
import './iconify-picker.js'

import gradientGL from 'https://esm.sh/gradient-gl'

// Create persistent canvas
const canvas = document.createElement('canvas')
canvas.id = 'gl-bg'
document.body.prepend(canvas)

// Initialize gradient once
gradientGL('a2.b18e', '#gl-bg')

const $ = (sel, ctx = document) => ctx.querySelector(sel)
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)]

class DocHeader extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = /*html*/ `
      <style>
        :host { 
          display: block; 
          width: 100%;
        }
        header { 
          display: grid;
          padding: var(--space-sm);
          grid-auto-flow: column;
          place-content: space-between;
        }
        img { 
          width: 4rem; 
          height: 4rem; 
          margin-right: var(--space-sm);
        }
        h1 { 
          font-family: barcode, monospace; 
          font-weight: bold;
          font-size: 4rem;
          margin: 0;
        }
      </style>
      <header>
        <img src="public/favicon.svg" alt="Iconify Picker Logo" />
        <h1>Iconify Picker</h1>
        <img src="public/github.svg" alt="GitHub Logo" />
      </header>
    `
  }
}

class DocNav extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const links = [
      'index.html|Home',
      'inline.html|Inline',
      'button.html|Button',
      'manual.html|Manual',
    ]
      .map((l) => {
        const [href, text] = l.split('|')
        return `<a href="${href}">${text}</a>`
      })
      .join('')

    this.shadowRoot.innerHTML = /*html*/ `
    <style>
      nav {
        display: grid;
        gap: var(--space-md);
        padding: var(--space-sm);
        grid-auto-flow: column;
        position: relative;
        place-content: space-around;
        isolation: isolate;
      }
      nav::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, var(--b6) 30%, transparent 100%);
        border-radius: 1rem;
        z-index: -1;
        filter: blur(8px);
      }
      a {
        text-decoration: underline;
        text-decoration-thickness: 0.1em;
        text-decoration-color: var(--l1);
        text-underline-offset: 0.4em;
        text-decoration-style: solid;
        font-family: fredoka, monospace;
        font-weight: 800;
        font-size: 1.5rem;
        color: var(--l1);
        transition: var(--transition);
      }
    </style>
    <nav>${links}</nav>
    `

    if (!document.startViewTransition) return

    for (const a of $$('a', this.shadowRoot)) {
      a.addEventListener('click', (e) => {
        e.preventDefault()
        this.navigateTo(a.href)
      })
    }
  }

  connectedCallback() {
    window.addEventListener('popstate', () => this.tagHeadings())
  }

  disconnectedCallback() {
    window.removeEventListener('popstate', () => this.tagHeadings())
  }

  tagHeadings() {
    let i = 0
    for (const h of $$('h1, h2')) {
      h.dataset.transition = `heading-${i++}`
    }
  }

  async navigateTo(href) {
    try {
      await document.startViewTransition(async () => {
        const doc = new DOMParser().parseFromString(await (await fetch(href)).text(), 'text/html')
        document.title = doc.title
        const main = doc.body.querySelector('main')
        if (main) {
          document.querySelector('main').innerHTML = main.innerHTML
        }
        history.pushState({}, '', href)
        this.tagHeadings()
      }).finished
    } catch {
      location.href = href
    }
  }
}

// Event Log Component
class DocEventLog extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = '<pre></pre>'
  }

  connectedCallback() {
    const picker = this.previousElementSibling
    if (picker?.tagName !== 'ICONIFY-PICKER') return

    for (const evt of ['icon-selected', 'change']) {
      picker.addEventListener(evt, (e) => {
        this.log(`${evt}: ${e.detail.iconName}`)
      })
    }
  }

  log(msg) {
    const pre = $('pre', this.shadowRoot)
    pre.textContent = `${pre.textContent}${msg}\n`
    pre.scrollTop = pre.scrollHeight
  }
}

// Register components
customElements.define('doc-header', DocHeader)
customElements.define('doc-nav', DocNav)
customElements.define('doc-event-log', DocEventLog)

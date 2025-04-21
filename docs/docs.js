import gradientGL from 'https://unpkg.com/gradient-gl'
// import './style.css'
gradientGL('a2.aea9')

// Load the iconify-picker script
const pickerScript = document.createElement('script');
pickerScript.type = 'module';
pickerScript.src = '../src/iconify-picker.js';
document.body.appendChild(pickerScript);

// Base layout component
class DocBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <main>
        <slot></slot>
      </main>
      <style>
        main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
      </style>
    `;
  }
}

// Navigation component
class DocNav extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <div class="nav">
        <a href="/">Home</a>
        <a href="/inline.html">Inline</a>
        <a href="/button.html">Button</a>
        <a href="/manual.html">Manual</a>
      </div>
      <style>
        .nav {
          display: flex;
          gap: 1rem;
          margin: 2rem 0;
        }
        .nav a {
          color: var(--fg);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: var(--radius);
          background: #ffffff22;
        }
        .nav a:hover {
          background: #ffffff44;
        }
      </style>
    `;
  }
}

// Demo container component
class DocDemo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <div class="demo">
        <h2>Demo</h2>
        <div class="demo-container">
          <slot></slot>
        </div>
      </div>
      <style>
        .demo {
          margin: 2rem 0;
          padding: 2rem;
          background: #ffffff22;
          border-radius: var(--radius);
        }
        .demo-container {
          display: grid;
          gap: 2rem;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .demo-container {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }
}

// Event log component
class DocEventLog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <pre id="event-log"></pre>
      <style>
        pre {
          background: #ffffff22;
          padding: 1rem;
          border-radius: var(--radius);
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
        }
      </style>
    `;
  }
}

// Register components
customElements.define('doc-base', DocBase);
customElements.define('doc-nav', DocNav);
customElements.define('doc-demo', DocDemo);
customElements.define('doc-event-log', DocEventLog);

// Setup event logging for demos
document.addEventListener('DOMContentLoaded', () => {
  const eventLogs = document.querySelectorAll('doc-event-log');
  if (!eventLogs.length) return;

  const picker = document.querySelector('iconify-picker');
  if (!picker) return;

  function logEvent(event) {
    for (const eventLog of eventLogs) {
      const pre = document.createElement('pre');
      pre.textContent = `${event.type}: ${JSON.stringify(event.detail, null, 2)}`;
      eventLog.shadowRoot.querySelector('#event-log').appendChild(pre);
      eventLog.shadowRoot.querySelector('#event-log').scrollTop = eventLog.shadowRoot.querySelector('#event-log').scrollHeight;
    }
  }

  picker.addEventListener('icon-selected', logEvent);
  picker.addEventListener('change', logEvent);
}); 
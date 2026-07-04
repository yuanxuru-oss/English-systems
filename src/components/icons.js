/**
 * Hand-drawn icon system for the Review Atelier.
 * Each icon uses slightly irregular paths, varied stroke joints,
 * and rounded caps to simulate pen-on-paper drawing.
 */
const iconSet = {
  dashboard: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.3 6.2c2.1-.7 4.8-.8 7.2 0 1.6.5 3.1 1.6 3.8 3 .8 1.3 1.1 2.9 1 4.5-.1 2.4-.8 4.3-2.3 5.7-1.4 1.4-3.2 2-5.6 2.1-1.7.1-3.2-.3-4.6-1.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M14.8 9.5 12.1 12" stroke-linecap="round" />
      <circle cx="11.9" cy="11.9" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  `,
  project: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7.8h5.6l2 2.1H19.8v8.5c0 .6-.3 1-.8 1H5.8c-.4 0-.8-.4-.8-1z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M5 7.8v-1.1c0-.5.3-.9.8-.9h4l1.4 1.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  import: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v9.7" stroke-linecap="round" />
      <path d="M8.7 11.8 12 15.2l3.3-3.4" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M5.4 18.1c1.5.7 3.9 1.2 6.6 1.2s5.1-.4 6.6-1.2" stroke-linecap="round" />
    </svg>
  `,
  reading: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 6.5c1.8-.8 4.2-1.2 6.5-1.2s4.7.3 6.5 1.2v10.8c-1.8-.8-4.2-1.2-6.5-1.2s-4.7.3-6.5 1.2z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M12 5.3v11.2" stroke-linecap="round" />
      <path d="M8.2 9.3h2M8.2 12h2.4" stroke-linecap="round" />
    </svg>
  `,
  mistakes: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 5.8h9.6v12.4H7.2z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 9.5h5.8M9 12.1h4M9 14.7h5" stroke-linecap="round" />
      <path d="M15.6 6.6 17 5.2" stroke-linecap="round" />
    </svg>
  `,
  flashcards: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.3 7.5h9.4v8H7.3z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M5.5 9.5v-2.2h9.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 10.5h5.8M9 12.8h4.2" stroke-linecap="round" />
    </svg>
  `,
  checkin: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 7h11v10.4H6.5z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8.2 5v2.8M15.8 5v2.8M6.5 10.2h11" stroke-linecap="round" />
      <path d="M9.6 13.9 11 15.3l3.4-3.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  pin: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.4 6 14.8 11" stroke-linecap="round" />
      <path d="M7.6 10.6 13.6 4.8l2.8 2.8-6 5.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M11.8 14.8 8 20" stroke-linecap="round" />
    </svg>
  `,
  listening: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.8 9.5a4.4 4.4 0 0 1 8.6 2.2c0 2.3-1.2 3.9-2.8 4.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 18c-.8-.4-1.5-1.1-2.1-2-.6-1-.9-2.2-.9-3.6 0-.6 0-1.2.3-1.8" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M11.5 16.7c.7.1 1.3.8 1.3 1.7v.8" stroke-linecap="round" />
    </svg>
  `,
  notebook: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.3 5.8h9.4v12.4H7.3z" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9 9.5h5.8M9 12.1h4M9 14.7h5" stroke-linecap="round" />
      <path d="M15.6 6.6 17 5.2" stroke-linecap="round" />
    </svg>
  `,
  user: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.2 20v-1.3c0-2-1.5-3.6-3.5-3.6h-3.4c-2 0-3.5 1.6-3.5 3.6V20" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="12" cy="9" r="3" stroke-linecap="round" />
    </svg>
  `,
  gear: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.2" stroke-linecap="round" />
      <path d="M12 4.2v.8M12 19v.8M4.2 12h.8M19 12h.8M6.5 6.5l.6.5M16.9 16.9l.6.5M6.5 17.5l.6-.5M16.9 7.1l.6-.5" stroke-linecap="round" />
    </svg>
  `,
  arrowRight: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6.5 14.8 12 9 17.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  plus: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6v12M6 12h12" stroke-linecap="round" />
    </svg>
  `,
  search: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5" stroke-linecap="round" />
      <path d="m14.8 14.8 3.8 3.8" stroke-linecap="round" />
    </svg>
  `,
  star: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5.2 13.8 9.8l4.2.4-3.2 2.8 1 4.3-3.8-2.3-3.8 2.3 1-4.3-3.2-2.8 4.2-.4z" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  lightbulb: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 17.5h6M10.2 20h3.6" stroke-linecap="round" />
      <path d="M8.5 9.8c0-2.7 1.8-4.6 4-4.6s4 1.9 4 4.6c0 2.1-1.1 3.5-2.2 4.5-.5.4-.8 1-.8 1.7v.8H10.5v-.8c0-.7-.3-1.3-.8-1.7-1.1-1-2.2-2.4-2.2-4.5z" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  play: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 5.2 18.5 12 7.5 18.8z" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  pause: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.8 5.5v13M16.2 5.5v13" stroke-linecap="round" />
    </svg>
  `,
  replay: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 5.2v5.5H10" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M19.5 16a7 7 0 0 1-11.2 5.2L4.5 18.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
};

export function icon(name) {
  return `<span class="nav-icon">${iconSet[name] ?? ""}</span>`;
}

export { iconSet };

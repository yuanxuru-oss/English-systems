// Fish-to-fishbone progress indicator
// Progress: 0 (full fish) → 6 (just bone)
export function renderFishProgress(progress) {
  const pct = Math.max(0, Math.min(6, progress)) / 6; // 0 → 1

  // Mask reveals bones from tail to head as progress increases
  // At progress=0: mask covers everything → full fish visible
  // At progress=1: mask covers nothing → only skeleton visible
  const maskOffset = Math.round(pct * 100);

  return `
    <div class="fish-progress-widget">
      <div class="fish-progress-stage">
        <svg viewBox="0 0 240 100" class="fish-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fish-body-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="var(--accent-soft)" />
              <stop offset="100%" stop-color="var(--accent)" />
            </linearGradient>
            <mask id="flesh-mask">
              <rect x="0" y="0" width="240" height="100" fill="white" />
              <rect x="${maskOffset}" y="0" width="${240 - maskOffset}" height="100" fill="black" />
            </mask>
            <clipPath id="fish-body-clip">
              <!-- Fish body shape -->
              <ellipse cx="80" cy="50" rx="55" ry="30" />
              <polygon points="135,50 175,28 165,50 175,72" />
            </clipPath>
          </defs>

          <!-- Skeleton layer (always visible) -->
          <g class="fish-skeleton" opacity="0.9">
            <!-- Skull -->
            <ellipse cx="50" cy="50" rx="14" ry="10" fill="none" stroke="var(--ink)" stroke-width="1.5" />
            <circle cx="44" cy="48" r="2" fill="var(--ink)" />
            <!-- Spine -->
            <line x1="64" y1="50" x2="138" y2="50" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round" />
            <!-- Ribs -->
            <line x1="74" y1="50" x2="78" y2="38" stroke="var(--ink)" stroke-width="1.2" stroke-linecap="round" />
            <line x1="74" y1="50" x2="78" y2="62" stroke="var(--ink)" stroke-width="1.2" stroke-linecap="round" />
            <line x1="84" y1="50" x2="88" y2="36" stroke="var(--ink)" stroke-width="1.1" stroke-linecap="round" />
            <line x1="84" y1="50" x2="88" y2="64" stroke="var(--ink)" stroke-width="1.1" stroke-linecap="round" />
            <line x1="94" y1="50" x2="98" y2="34" stroke="var(--ink)" stroke-width="1" stroke-linecap="round" />
            <line x1="94" y1="50" x2="98" y2="66" stroke="var(--ink)" stroke-width="1" stroke-linecap="round" />
            <line x1="104" y1="50" x2="108" y2="36" stroke="var(--ink)" stroke-width="0.9" stroke-linecap="round" />
            <line x1="104" y1="50" x2="108" y2="64" stroke="var(--ink)" stroke-width="0.9" stroke-linecap="round" />
            <line x1="114" y1="50" x2="118" y2="40" stroke="var(--ink)" stroke-width="0.8" stroke-linecap="round" />
            <line x1="114" y1="50" x2="118" y2="60" stroke="var(--ink)" stroke-width="0.8" stroke-linecap="round" />
            <!-- Tail bones -->
            <path d="M138 50 L148 42 L142 50 L148 58 Z" fill="none" stroke="var(--ink)" stroke-width="1.2" />
          </g>

          <!-- Flesh layer (masked away as progress increases) -->
          <g mask="url(#flesh-mask)" clip-path="url(#fish-body-clip)">
            <ellipse cx="80" cy="50" rx="55" ry="30" fill="url(#fish-body-grad)" />
            <polygon points="135,50 175,28 165,50 175,72" fill="var(--accent)" />
            <!-- Fish eye -->
            <circle cx="44" cy="48" r="3" fill="white" />
            <circle cx="43" cy="47" r="1.5" fill="#1a1a1a" />
            <!-- Scale details -->
            <path d="M100 40 Q105 50 100 60" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" />
            <path d="M88 38 Q93 50 88 62" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" />
            <path d="M112 42 Q117 50 112 58" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="0.8" />
            <!-- Dorsal fin -->
            <path d="M90 20 Q100 10 110 20" fill="var(--accent)" opacity="0.6" />
            <!-- Ventral fin -->
            <path d="M85 80 Q95 90 105 80" fill="var(--accent)" opacity="0.6" />
          </g>
        </svg>
      </div>
      <div class="fish-progress-label">
        ${progress === 0 ? "🐟 开始你的复习之旅" :
          progress === 6 ? "🦴 全部完成，只剩鱼骨头！" :
          `🐟 已完成 ${progress}/6 步`}
      </div>
    </div>
  `;
}

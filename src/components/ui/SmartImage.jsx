import { useState } from 'react';
import { asset } from '../../lib/paths.js';

// Generated illustration used while a real screenshot is missing. Deterministic per name, tinted per project.
export function PlaceholderArt({ name, accent = '#009929', label }) {
  const seed = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const bars = Array.from({ length: 7 }, (_, index) => 18 + ((seed * (index + 3)) % 46));
  return (
    <svg
      viewBox="0 0 320 180"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <rect width="320" height="180" fill="var(--raised)" />
      <g opacity="0.5" fill="var(--border)">
        {Array.from({ length: 60 }, (_, index) => (
          <circle key={index} cx={16 + (index % 12) * 26} cy={18 + Math.floor(index / 12) * 36} r="1.4" />
        ))}
      </g>
      <rect x="40" y="30" width="240" height="120" rx="10" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="54" cy="44" r="3" fill={accent} />
      <circle cx="65" cy="44" r="3" fill="var(--border)" />
      <circle cx="76" cy="44" r="3" fill="var(--border)" />
      <rect x="54" y="60" width="70" height="8" rx="4" fill="var(--border)" />
      <rect x="54" y="76" width="46" height="6" rx="3" fill="var(--border)" opacity="0.7" />
      <g>
        {bars.map((height, index) => (
          <rect
            key={index}
            x={140 + index * 18}
            y={134 - height}
            width="10"
            height={height}
            rx="3"
            fill={accent}
            opacity={0.35 + (index % 3) * 0.25}
          />
        ))}
      </g>
      <text x="54" y="132" fontFamily="var(--font-display)" fontSize="20" fontWeight="600" fill="var(--text)">
        {name}
      </text>
    </svg>
  );
}

// Image that falls back to the placeholder when the file is not listed or fails to load.
export default function SmartImage({ src, alt, name, accent, placeholderLabel, className = '' }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className={className}>
        <PlaceholderArt name={name} accent={accent} label={placeholderLabel} />
      </div>
    );
  }
  return (
    <img
      src={asset(src)}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className={`${className} object-cover`}
    />
  );
}

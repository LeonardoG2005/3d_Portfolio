import { Link } from 'react-router';

// Moves the --gx / --gy variables that the .card-glow highlight follows.
export function trackGlow(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--gx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--gy', `${event.clientY - rect.top}px`);
}

export function Card({ as: Tag = 'div', glow = false, className = '', children, ...props }) {
  return (
    <Tag
      className={`card ${glow ? 'card-glow' : ''} ${className}`}
      onPointerMove={glow ? trackGlow : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Chip({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-line bg-raised px-3 py-1 text-[0.8125rem] leading-5 text-ink ${className}`}
    >
      {children}
    </span>
  );
}

const buttonBase =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-[transform,background-color,border-color] active:scale-[0.97]';
const buttonVariants = {
  primary: 'bg-accent text-on-accent hover:brightness-110',
  secondary: 'border border-line bg-surface text-ink hover:border-accent-ink',
};

// Renders a router link for internal paths and a normal anchor for everything else.
export function ButtonLink({ to, href, variant = 'primary', external = false, className = '', children, ...props }) {
  const classes = `${buttonBase} ${buttonVariants[variant]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  );
}

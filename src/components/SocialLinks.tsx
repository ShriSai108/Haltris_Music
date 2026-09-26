import type { SocialLink } from '../content/site';

interface SocialLinksProps {
  links: readonly SocialLink[];
  label: string;
  className?: string;
}

/** Renders nothing until real profile links exist in the content files. */
export function SocialLinks({ links, label, className = 'social-links' }: SocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <ul className={className} aria-label={label}>
      {links.map((link) => (
        <li key={link.url}>
          <a href={link.url} target="_blank" rel="noopener noreferrer me">
            {link.label}{" "}<span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

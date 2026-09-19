import { Link } from 'react-router-dom';
import { site } from '../content/site';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p>© {new Date().getFullYear()} {site.name}</p>
        <address>{site.address}</address>
      </div>
      <div className="site-footer__links">
        <nav aria-label="Policies">
          {site.policies.map((policy) => <Link key={policy.to} to={policy.to}>{policy.label}</Link>)}
        </nav>
        <nav aria-label="Contact email routes">
          {site.emails.map((email) => <a key={email.address} href={`mailto:${email.address}`}>{email.label}</a>)}
        </nav>
      </div>
    </footer>
  );
}

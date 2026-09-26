import { Link } from 'react-router-dom';
import { site } from '../content/site';
import { BlockMark } from './BlockMark';
import { SocialLinks } from './SocialLinks';

export function SiteFooter() {
  const labelPages = site.navigation.filter((item) => item.to !== '/');

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__lead" data-reveal>
          <p className="footer__kicker">End of side B.</p>
          <p className="footer__pitch">
            Flip it over and <Link to="/contact?type=artist">send us yours</Link>.
          </p>
          <SocialLinks links={site.socials} label="Haltris elsewhere" className="social-links footer__socials" />
        </div>

        <div className="footer__columns">
          <nav className="footer__column" aria-label="Label pages">
            <h2>Label</h2>
            <ul>
              {labelPages.map((item) => (
                <li key={item.to}><Link to={item.to}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="footer__column" aria-label="Contact email routes">
            <h2>Write to us</h2>
            <ul className="footer__emails">
              {site.emails.map((email) => (
                <li key={email.address}>
                  <span className="footer__email-label">{email.label}</span>
                  <a href={`mailto:${email.address}`}>{email.address}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer__column" aria-label="Policies">
            <h2>The small print</h2>
            <ul>
              {site.policies.map((policy) => (
                <li key={policy.to}><Link to={policy.to}>{policy.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="footer__wordmark" aria-hidden="true" data-reveal>
        <BlockMark className="footer__mark" />
        <span className="footer__letters">
          {site.wordmark.split('').map((letter, index) => (
            <span className={`footer__letter footer__letter--${index}`} key={`${letter}-${index}`}>{letter}</span>
          ))}
        </span>
      </div>

      <div className="footer__base">
        {/* Pages are prerendered at build time; the year may tick over before the next build. */}
        <p suppressHydrationWarning>© {new Date().getFullYear()} {site.name}</p>
        <p>Made slowly in {site.location.split(',')[0]}.</p>
        <a className="footer__top" href="#top">Back to the top <span aria-hidden="true">↑</span></a>
      </div>
    </footer>
  );
}

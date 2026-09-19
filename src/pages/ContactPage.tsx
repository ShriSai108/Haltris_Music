import { ContactForm } from '../components/ContactForm';
import { SectionIntro } from '../components/SectionIntro';
import { site } from '../content/site';

export function ContactPage() {
  return (
    <main className="page">
      <SectionIntro eyebrow="Start a conversation" title="Contact">
        <p>Tell us what you are building, making, or looking for. We will route your note to the right place.</p>
      </SectionIntro>
      <section className="page-section page-section--contact" aria-label="Contact Haltris">
        <ContactForm />
        <aside className="contact-aside">
          <div>
            <p className="eyebrow">Prefer email?</p>
            <h2>Choose your route.</h2>
            <ul className="contact-routes">
              {site.emails.map((email) => (
                <li key={email.address}>
                  <span>{email.label}</span>
                  <a href={`mailto:${email.address}`}>{email.address}</a>
                </li>
              ))}
            </ul>
          </div>
          <address>
            <p className="eyebrow">Correspondence</p>
            {site.address}
          </address>
        </aside>
      </section>
    </main>
  );
}

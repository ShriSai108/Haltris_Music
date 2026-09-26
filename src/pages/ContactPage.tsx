import { ContactForm } from '../components/ContactForm';
import { SectionIntro } from '../components/SectionIntro';
import { site } from '../content/site';

export function ContactPage() {
  return (
    <main className="page">
      <SectionIntro eyebrow="Contact" title="Say hello. *Or send a song.*">
        <p>Pick what it is about and it lands in the right inbox, read by a real person.</p>
      </SectionIntro>

      <section className="section contact" aria-label="Contact Haltris" data-reveal>
        <ContactForm />

        <aside className="contact__aside">
          <div className="contact__card">
            <p className="eyebrow">Rather use email?</p>
            <ul className="contact__routes">
              {site.emails.map((email) => (
                <li key={email.address}>
                  <span>{email.label}</span>
                  <a href={`mailto:${email.address}`}>{email.address}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="contact__card">
            <p className="eyebrow">Sending a demo?</p>
            <ul className="contact__tips">
              <li>One link, private is fine. No attachments.</li>
              <li>Your best song first, not your newest.</li>
              <li>A line on who you are and what you want next.</li>
            </ul>
          </div>

          <div className="contact__card">
            <p className="eyebrow">Studio</p>
            <address>{site.address}</address>
          </div>
        </aside>
      </section>
    </main>
  );
}

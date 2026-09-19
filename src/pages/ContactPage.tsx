import { SectionIntro } from '../components/SectionIntro';
import { site } from '../content/site';

export function ContactPage() {
  return (
    <main className="page">
      <SectionIntro eyebrow="Start a conversation" title="Contact">
        <p>Tell us what you are building, making, or looking for. We will route your note to the right place.</p>
      </SectionIntro>
      <section className="page-section page-section--contact" aria-label="Contact Haltris">
        <form className="contact-form" action="/api/contact" method="post">
          <div className="form-grid">
            <label>
              Name
              <input name="name" type="text" autoComplete="name" required maxLength={120} />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>
          <label>
            Inquiry type
            <select name="inquiryType" defaultValue="support" required>
              <option value="support">Support</option>
              <option value="collaboration">Collaboration</option>
              <option value="artist">Artist submissions</option>
            </select>
          </label>
          <label>
            Message
            <textarea name="message" rows={7} required maxLength={5000} />
          </label>
          <label>
            Optional URL
            <input name="url" type="url" inputMode="url" placeholder="https://" maxLength={500} />
          </label>
          <label className="checkbox-label" htmlFor="consent">
            <input id="consent" name="consent" type="checkbox" value="true" required aria-describedby="consent-copy" />
            <span id="consent-copy">I consent to Haltris using my details to review and respond to this enquiry.</span>
          </label>
          <button className="button-link button-link--solid" type="submit">Send enquiry <span aria-hidden="true">↗</span></button>
        </form>
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

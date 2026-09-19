export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  updatedLabel: string;
  sections: LegalSection[];
  internalNote: string;
}

const internalNote = 'Review with legal counsel before launch.';

export const legalDocuments: Record<string, LegalDocument> = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    updatedLabel: 'Last updated · 19 September 2026',
    internalNote,
    sections: [
      {
        heading: 'What this policy covers',
        paragraphs: [
          'Haltris Music (“Haltris”, “we”, “us”) is an India-based music label. This policy explains how we handle information shared through this website, including when you contact us about support, collaboration, or artist submissions.',
        ],
      },
      {
        heading: 'Information you choose to share',
        paragraphs: ['Our contact route may collect the following information when you submit an enquiry:'],
        bullets: ['Name and email address', 'Inquiry type and message', 'Optional URL', 'Your consent to contact you about the enquiry'],
      },
      {
        heading: 'How we use and process email',
        paragraphs: [
          'We use submitted details to review and respond to your enquiry, route it to the appropriate Haltris inbox, protect the website, and keep a record of business communications. Email delivery may be handled by an SMTP provider configured by Haltris. We do not sell contact details or use them for unrelated marketing without an appropriate choice or permission.',
        ],
      },
      {
        heading: 'Retention and your rights',
        paragraphs: [
          'We retain enquiry records only for as long as reasonably needed to respond, maintain business records, resolve disputes, and meet applicable legal or security obligations. You may ask us to access, correct, or delete personal information, or withdraw consent where processing is based on consent, subject to lawful exceptions. Contact support@haltris.com with your request.',
        ],
      },
      {
        heading: 'Contact and grievance route',
        paragraphs: [
          'Questions about this policy may be sent to support@haltris.com. Haltris Music’s correspondence address is 234, 3rd Floor, Old Madras Rd, Hobli, Krishnarajapuram, Bengaluru, Karnataka 560016. We will assess and respond to privacy requests within a reasonable period under applicable Indian law.',
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Use',
    updatedLabel: 'Last updated · 19 September 2026',
    internalNote,
    sections: [
      {
        heading: 'Using this site',
        paragraphs: [
          'This website is operated by Haltris Music for label information, artist discovery, release previews, and enquiries. By using it, you agree to use the site lawfully, respect the rights of Haltris and its artists, and avoid interfering with its operation or security.',
        ],
      },
      {
        heading: 'Content and intellectual property',
        paragraphs: [
          'Unless stated otherwise, the Haltris name, marks, text, artwork, audio, video, visual treatments, and other site materials belong to Haltris Music or its licensors. You may view and share ordinary links for personal, non-commercial reference, but you may not copy, modify, distribute, commercialise, or imply endorsement from site content without permission.',
        ],
      },
      {
        heading: 'Preview releases and third-party preview links',
        paragraphs: [
          'Release pages may link to third-party services, including Toolost. Those services have their own terms and privacy practices. A preview link is not a guarantee that audio, artwork, or a release will remain available, be released on a particular date, or be offered in every territory.',
        ],
      },
      {
        heading: 'Availability and liability',
        paragraphs: [
          'We aim to keep the site accurate and available, but content may change and the site is provided on an “as available” basis. To the extent permitted by law, Haltris is not responsible for third-party services, interruptions, or losses arising from reliance on an upcoming release status or preview link.',
        ],
      },
      {
        heading: 'Governing contact route',
        paragraphs: [
          'For permission requests or questions about these terms, contact support@haltris.com. Haltris Music is based at 234, 3rd Floor, Old Madras Rd, Hobli, Krishnarajapuram, Bengaluru, Karnataka 560016. Applicable Indian law governs these terms, subject to mandatory rights available to you.',
        ],
      },
    ],
  },
  cookies: {
    slug: 'cookies',
    title: 'Cookie Policy',
    updatedLabel: 'Last updated · 19 September 2026',
    internalNote,
    sections: [
      {
        heading: 'Essential operation',
        paragraphs: [
          'Haltris may use essential browser storage or cookies needed to serve the site, remember a basic interface state, protect forms, and keep security features working. These technologies are not used to build an advertising profile.',
        ],
      },
      {
        heading: 'Optional analytics',
        paragraphs: [
          'If Haltris adds analytics, it will be treated as optional where required. We will identify the provider, explain the categories of information involved, and request or provide the applicable choice before enabling non-essential analytics. The current site does not promise that optional analytics is active.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You can manage cookies through your browser settings. Blocking essential technologies may affect navigation or form functionality. Contact support@haltris.com if you need help understanding a cookie or want to ask about an available preference route.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          'Cookie questions may be sent to support@haltris.com. Haltris Music’s address is 234, 3rd Floor, Old Madras Rd, Hobli, Krishnarajapuram, Bengaluru, Karnataka 560016.',
        ],
      },
    ],
  },
  'release-disclaimer': {
    slug: 'release-disclaimer',
    title: 'Release Disclaimer',
    updatedLabel: 'Last updated · 19 September 2026',
    internalNote,
    sections: [
      {
        heading: 'Upcoming release status',
        paragraphs: [
          'The Lil’ Sukku debut material shown on this site is an upcoming release preview. “Upcoming” means the release is being presented for discovery and is not represented as a currently released album or as a promise of a fixed release date.',
        ],
      },
      {
        heading: 'Preview availability',
        paragraphs: [
          'The preview CTA is a third-party preview link to Toolost. Playback, access, territory availability, account requirements, and service terms are controlled by that provider. A preview may be changed, removed, or replaced without notice.',
        ],
      },
      {
        heading: 'Rights and permissions',
        paragraphs: [
          'All Haltris and artist materials remain protected by applicable intellectual-property rights. Do not download, reproduce, redistribute, or use preview audio, artwork, or visuals outside the permissions offered by Haltris or the relevant service.',
        ],
      },
      {
        heading: 'Questions',
        paragraphs: [
          'For rights, press, or availability questions, contact Collaboration@haltris.com. General support is available at support@haltris.com. Haltris Music’s address is 234, 3rd Floor, Old Madras Rd, Hobli, Krishnarajapuram, Bengaluru, Karnataka 560016.',
        ],
      },
    ],
  },
};

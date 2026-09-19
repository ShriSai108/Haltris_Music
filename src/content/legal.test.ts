import { describe, expect, it } from 'vitest';
import { legalDocuments } from './legal';

describe('legal content', () => {
  it('defines every linked policy with launch-review metadata', () => {
    expect(Object.keys(legalDocuments)).toEqual(
      expect.arrayContaining(['privacy', 'terms', 'cookies', 'release-disclaimer']),
    );

    for (const document of Object.values(legalDocuments)) {
      expect(document.internalNote).toMatch(/review with legal counsel before launch/i);
      expect(document.sections.length).toBeGreaterThan(0);
    }
  });

  it('covers contact data, rights, preview links, and the supplied address', () => {
    const combined = Object.values(legalDocuments)
      .flatMap((document) => document.sections)
      .flatMap((section) => [section.heading, ...section.paragraphs, ...(section.bullets ?? [])])
      .join(' ');

    expect(combined).toMatch(/name and email address/i);
    expect(combined).toMatch(/retention/i);
    expect(combined).toMatch(/rights/i);
    expect(combined).toMatch(/third-party preview/i);
    expect(combined).toMatch(/upcoming/i);
    expect(combined).toContain('234, 3rd Floor, Old Madras Rd');
  });
});

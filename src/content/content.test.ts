import { artists } from './artists';
import { releaseDateLabel, releases } from './releases';

const socialUrlPattern = /(?:https?:\/\/)?(?:www\.)?(?:instagram|facebook|twitter|x\.com|tiktok|youtube|soundcloud)\./i;

describe('Haltris content model', () => {
  it("includes Lil' Sukku as the featured artist", () => {
    expect(artists).toContainEqual(
      expect.objectContaining({ slug: 'lil-sukku', name: "Lil' Sukku", featured: true }),
    );
  });

  it("serves Lil' Sukku's photo as sized, responsive WebP with no location field", () => {
    const { image } = artists[0];
    expect(image.src).toMatch(/^\/images\/lil-sukku-\d+\.webp$/);
    expect(image.srcSet.split(',').length).toBeGreaterThanOrEqual(3);
    expect(image.width).toBeGreaterThan(0);
    expect(image.height).toBeGreaterThan(0);
    expect(image.alt.length).toBeGreaterThan(10);
    expect(artists[0]).not.toHaveProperty('origin');
  });

  it('gives every artist pronouns for profile copy', () => {
    for (const artist of artists) {
      expect(artist.pronouns.possessive).toMatch(/^[a-z]+$/);
    }
  });

  it('includes the upcoming Lil\' Sukku preview release', () => {
    expect(releases).toContainEqual(
      expect.objectContaining({
        artistSlug: 'lil-sukku',
        previewUrl: 'https://toolost.com/release-preview/MTcyMTY0Mw',
        status: 'upcoming',
      }),
    );
  });

  it('keeps social URLs only in the dedicated socials fields', () => {
    for (const item of [...artists, ...releases]) {
      const { socials: _socials, links: _links, ...rest } = item as Record<string, unknown>;
      expect(JSON.stringify(rest)).not.toMatch(socialUrlPattern);
    }
  });

  it('labels a release without a date as to be announced, and formats one that has it', () => {
    expect(releaseDateLabel({})).toBe('Date to be announced');
    expect(releaseDateLabel({ releaseDate: 'not-a-date' })).toBe('Date to be announced');
    expect(releaseDateLabel({ releaseDate: '2026-11-06' })).toBe('6 November 2026');
  });
});

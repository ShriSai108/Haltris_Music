import { artists } from './artists';
import { releases } from './releases';

const socialUrlPattern = /(?:https?:\/\/)?(?:www\.)?(?:instagram|facebook|twitter|x\.com|tiktok|youtube|soundcloud)\./i;

describe('Haltris content model', () => {
  it("includes Lil' Sukku as the featured artist", () => {
    expect(artists).toContainEqual(
      expect.objectContaining({ slug: 'lil-sukku', name: "Lil' Sukku", featured: true }),
    );
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

  it('does not include social URLs in label content', () => {
    for (const item of [...artists, ...releases]) {
      expect(JSON.stringify(item)).not.toMatch(socialUrlPattern);
    }
  });
});

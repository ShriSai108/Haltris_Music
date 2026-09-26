import { artists } from '../content/artists';
import { releases } from '../content/releases';
import { site } from '../content/site';

/**
 * The single source of page metadata. The prerender step writes it into each
 * page's HTML, and the client applies the same values as people navigate.
 */

export type SocialPageType = 'website' | 'profile';

export interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  socialImageUrl: string;
  socialType: SocialPageType;
  /** False for the not-found page, which search engines should not index. */
  indexable: boolean;
  structuredData: readonly Record<string, unknown>[];
}

export const siteMetadata = {
  title: 'Haltris Music',
  description:
    'Haltris Music is a new music label in Bengaluru. We develop artists, shape releases, and make sure the music arrives the way it was meant to.',
  themeColor: '#08090d',
  canonicalOrigin: 'https://music.haltris.com',
  socialImagePath: '/og-image.jpg',
  socialImageWidth: 1200,
  socialImageHeight: 630,
} as const;

const staticRoutes = {
  '/': {
    title: siteMetadata.title,
    description: siteMetadata.description,
  },
  '/artists': {
    title: 'Artists | Haltris Music',
    description: 'The artists on the Haltris roster and the records we are making with them.',
  },
  '/releases': {
    title: 'Releases | Haltris Music',
    description: 'Haltris releases and previews, starting with our first record.',
  },
  '/about': {
    title: 'About | Haltris Music',
    description: 'How Haltris works with artists on songwriting, releases, artwork, and distribution, plus a press kit to download.',
  },
  '/contact': {
    title: 'Contact | Haltris Music',
    description: 'Send a demo, a collaboration idea, or a general enquiry to Haltris Music.',
  },
  '/privacy': {
    title: 'Privacy Policy | Haltris Music',
    description: 'How Haltris Music handles the personal information you send us.',
  },
  '/terms': {
    title: 'Terms of Use | Haltris Music',
    description: 'The terms that apply when you use the Haltris Music website.',
  },
  '/cookies': {
    title: 'Cookie Policy | Haltris Music',
    description: 'How cookies and similar technologies are used on the Haltris Music website.',
  },
  '/release-disclaimer': {
    title: 'Release Disclaimer | Haltris Music',
    description: 'What a Haltris release preview is, and what it is not.',
  },
} as const satisfies Record<string, { title: string; description: string }>;

export const NOT_FOUND_PATH = '/404';

/** Every route that exists, derived from content so new artists are picked up automatically. */
export const prerenderRoutes: readonly string[] = [
  ...Object.keys(staticRoutes),
  ...artists.map((artist) => `/artists/${artist.slug}`),
];

export function normalizePath(pathname: string) {
  const pathWithLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return pathWithLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

function absoluteUrl(pathname: string) {
  return new URL(pathname, siteMetadata.canonicalOrigin).href;
}

export function canonicalUrlForPath(pathname: string) {
  return absoluteUrl(normalizePath(pathname));
}

function organizationData() {
  const sameAs = site.socials.map((link) => link.url);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteMetadata.canonicalOrigin}/#organization`,
    name: site.name,
    url: `${siteMetadata.canonicalOrigin}/`,
    logo: absoluteUrl('/icon-512.png'),
    email: site.emails[0].address,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '234, 3rd Floor, Old Madras Rd, Hobli, Krishnarajapuram',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560016',
      addressCountry: 'IN',
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function artistData(artist: (typeof artists)[number]) {
  const sameAs = artist.socials.map((link) => link.url);
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    url: canonicalUrlForPath(`/artists/${artist.slug}`),
    image: absoluteUrl(artist.image.src),
    description: artist.bio,
    recordLabel: { '@id': `${siteMetadata.canonicalOrigin}/#organization` },
    ...(sameAs.length ? { sameAs } : {}),
    track: releases
      .filter((release) => release.artistSlug === artist.slug)
      .map((release) => ({
        '@type': 'MusicRecording',
        name: release.title,
        ...(release.releaseDate ? { datePublished: release.releaseDate } : {}),
      })),
  };
}

export function metadataForPath(pathname: string): PageMetadata {
  const canonicalPath = normalizePath(pathname);
  const artistMatch = canonicalPath.match(/^\/artists\/([^/]+)$/);
  const staticRoute = staticRoutes[canonicalPath as keyof typeof staticRoutes];
  const base = {
    socialImageUrl: absoluteUrl(siteMetadata.socialImagePath),
    canonicalUrl: canonicalUrlForPath(canonicalPath),
  };

  if (staticRoute) {
    return {
      ...base,
      ...staticRoute,
      socialType: 'website',
      indexable: true,
      structuredData: canonicalPath === '/' ? [organizationData()] : [],
    };
  }

  const artist = artistMatch ? artists.find((entry) => entry.slug === artistMatch[1]) : undefined;
  if (artist) {
    return {
      ...base,
      title: `${artist.name} | Haltris Music`,
      description: artist.bio,
      socialType: 'profile',
      indexable: true,
      structuredData: [artistData(artist)],
    };
  }

  return {
    ...base,
    title: 'Page not found | Haltris Music',
    description: 'We could not find that page. Return to Haltris Music to browse artists and releases.',
    socialType: 'website',
    indexable: false,
    structuredData: [],
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

/** JSON inside a script tag must not be able to close the tag. */
function scriptSafeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/** The per-page head tags, written into the prerendered HTML. */
export function renderHeadTags(pathname: string) {
  const metadata = metadataForPath(pathname);
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    metadata.indexable ? '' : '<meta name="robots" content="noindex" />',
    `<meta property="og:site_name" content="${siteMetadata.title}" />`,
    `<meta property="og:type" content="${metadata.socialType}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(metadata.socialImageUrl)}" />`,
    `<meta property="og:image:width" content="${siteMetadata.socialImageWidth}" />`,
    `<meta property="og:image:height" content="${siteMetadata.socialImageHeight}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.socialImageUrl)}" />`,
    metadata.indexable ? `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />` : '',
    ...metadata.structuredData.map((data) => `<script type="application/ld+json">${scriptSafeJson(data)}</script>`),
  ];

  return tags.filter(Boolean).join('\n    ');
}

export function renderSitemap(buildDate: string) {
  const urls = prerenderRoutes
    .map((route) => `  <url><loc>${canonicalUrlForPath(route)}</loc><lastmod>${buildDate}</lastmod></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteMetadata.canonicalOrigin}/sitemap.xml\n`;
}

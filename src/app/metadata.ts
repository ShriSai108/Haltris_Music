import { artists } from '../content/artists';

export type SocialPageType = 'website' | 'profile';

export interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  socialImageUrl: string;
  socialType: SocialPageType;
}

export const siteMetadata = {
  title: 'Haltris Music',
  description:
    'Haltris Music is an independent label for artists with something distinct to say, carefully amplified from Bengaluru to everywhere.',
  themeColor: '#0b0b0f',
  canonicalOrigin: 'https://haltris.com',
  socialImagePath: '/haltris-logo.png',
} as const;

const routeMetadata = {
  '/': {
    title: siteMetadata.title,
    description: siteMetadata.description,
  },
  '/artists': {
    title: 'Artists | Haltris Music',
    description: 'Meet the distinct voices shaping Haltris Music and explore each artist world.',
  },
  '/releases': {
    title: 'Releases | Haltris Music',
    description: 'Explore upcoming music, previews, and new work from the Haltris Music catalogue.',
  },
  '/about': {
    title: 'About | Haltris Music',
    description: 'Meet the independent Bengaluru label built around distinct voices, close collaboration, and lasting records.',
  },
  '/contact': {
    title: 'Contact | Haltris Music',
    description: 'Contact Haltris Music for support, collaborations, artist submissions, and label enquiries.',
  },
  '/privacy': {
    title: 'Privacy Policy | Haltris Music',
    description: 'Read how Haltris Music handles personal information and protects your privacy.',
  },
  '/terms': {
    title: 'Terms of Use | Haltris Music',
    description: 'Read the terms that apply when you use the Haltris Music website.',
  },
  '/cookies': {
    title: 'Cookie Policy | Haltris Music',
    description: 'Read how cookies and similar technologies are used on the Haltris Music website.',
  },
  '/release-disclaimer': {
    title: 'Release Disclaimer | Haltris Music',
    description: 'Read the Haltris Music release preview and availability disclaimer.',
  },
} as const satisfies Record<string, { title: string; description: string }>;

function normalizePath(pathname: string) {
  const pathWithLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return pathWithLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

export function canonicalUrlForPath(pathname: string) {
  return new URL(normalizePath(pathname), siteMetadata.canonicalOrigin).href;
}

export function metadataForPath(pathname: string): PageMetadata {
  const canonicalPath = normalizePath(pathname);
  const artistMatch = canonicalPath.match(/^\/artists\/([^/]+)$/);
  let metadata: { title: string; description: string; socialType?: SocialPageType } | undefined = routeMetadata[canonicalPath as keyof typeof routeMetadata];

  if (artistMatch) {
    const artistSlug = artistMatch[1];
    const artist = artists.find((entry) => entry.slug === artistSlug);

    if (artist) {
      metadata = {
        title: `${artist.name} | Haltris Music`,
        description: artist.bio,
        socialType: 'profile',
      };
    }
  }

  metadata ??= {
    title: 'Page not found | Haltris Music',
    description: 'The requested page could not be found. Return to Haltris Music to explore artists and releases.',
  };

  return {
    ...metadata,
    canonicalUrl: canonicalUrlForPath(canonicalPath),
    socialImageUrl: new URL(siteMetadata.socialImagePath, siteMetadata.canonicalOrigin).href,
    socialType: metadata.socialType ?? 'website',
  };
}

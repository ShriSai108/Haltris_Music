const siteOrigin = 'https://haltris.com';

type SocialPageType = 'website' | 'profile';

interface RouteMetadata {
  title: string;
  description: string;
  socialType?: SocialPageType;
}

const routeMetadata: Record<string, RouteMetadata> = {
  '/': {
    title: 'Haltris Music',
    description: 'Haltris Music is an independent label for artists with something distinct to say, carefully amplified from Bengaluru to everywhere.',
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
};

const notFoundMetadata: RouteMetadata = {
  title: 'Page not found | Haltris Music',
  description: 'The requested page could not be found. Return to Haltris Music to explore artists and releases.',
};

function normalizePath(pathname: string) {
  const pathWithLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return pathWithLeadingSlash.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

function metadataForPath(pathname: string): RouteMetadata {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === '/artists/lil-sukku') {
    return {
      title: "Lil' Sukku | Haltris Music",
      description: "Lil' Sukku makes restless, late-night music with a clear point of view. The first signal from Haltris is only the beginning.",
      socialType: 'profile',
    };
  }

  return routeMetadata[normalizedPath] ?? notFoundMetadata;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;',
  })[character] ?? character);
}

function replaceMeta(html: string, attribute: 'name' | 'property', key: string, value: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<meta\\s+${attribute}="${escapedKey}"\\s+content=")[^"]*("\\s*\\/?>)`, 'i');
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
}

export function renderRouteShell(html: string, pathname: string) {
  const metadata = metadataForPath(pathname);
  const canonicalPath = normalizePath(pathname);
  const canonicalUrl = new URL(canonicalPath, siteOrigin).href;
  let rendered = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  rendered = replaceMeta(rendered, 'name', 'description', metadata.description);
  rendered = replaceMeta(rendered, 'property', 'og:type', metadata.socialType ?? 'website');
  rendered = replaceMeta(rendered, 'property', 'og:title', metadata.title);
  rendered = replaceMeta(rendered, 'property', 'og:description', metadata.description);
  rendered = replaceMeta(rendered, 'property', 'og:url', canonicalUrl);
  rendered = replaceMeta(rendered, 'name', 'twitter:title', metadata.title);
  rendered = replaceMeta(rendered, 'name', 'twitter:description', metadata.description);
  return rendered.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
}

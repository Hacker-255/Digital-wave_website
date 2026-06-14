import { useEffect } from 'react';
import { canonicalUrl, HOME_DESCRIPTION, HOME_TITLE, pageForPath, SITE_URL } from '../../constants/seo';

const OG_IMAGE = `${SITE_URL}/digital-wave-logo.png`;

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attr, value);
  }
}

export function SeoMetadata({ pathname }: { pathname: string }) {
  useEffect(() => {
    const page = pageForPath(pathname);
    const canonical = canonicalUrl(page.path);
    const isHome = page.path === '/';

    document.title = page.title;
    setMeta('meta[name="description"]', 'content', page.description);
    setMeta('meta[name="keywords"]', 'content', page.keywords);
    setMeta('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:title"]', 'content', page.title);
    setMeta('meta[property="og:description"]', 'content', page.description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:image"]', 'content', OG_IMAGE);
    setMeta('meta[property="og:site_name"]', 'content', 'Digital Wave');
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', page.title);
    setMeta('meta[name="twitter:description"]', 'content', page.description);
    setMeta('meta[name="twitter:image"]', 'content', OG_IMAGE);

    document.querySelectorAll('script[data-seo-schema]').forEach((node) => node.remove());

    if (isHome) {
      const organization = document.createElement('script');
      organization.type = 'application/ld+json';
      organization.dataset.seoSchema = 'organization';
      organization.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Digital Wave',
        url: SITE_URL,
        logo: OG_IMAGE,
        description: HOME_DESCRIPTION,
        sameAs: [SITE_URL],
      });
      document.head.appendChild(organization);

      const localBusiness = document.createElement('script');
      localBusiness.type = 'application/ld+json';
      localBusiness.dataset.seoSchema = 'local-business';
      localBusiness.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Digital Wave',
        url: SITE_URL,
        image: OG_IMAGE,
        description: HOME_DESCRIPTION,
        areaServed: ['Egypt', 'Worldwide'],
        priceRange: '$$',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: 'contact@digital-wave.solutions',
          availableLanguage: ['English', 'Arabic'],
        },
      });
      document.head.appendChild(localBusiness);
    }
  }, [pathname]);

  return null;
}

export { HOME_DESCRIPTION, HOME_TITLE, OG_IMAGE };

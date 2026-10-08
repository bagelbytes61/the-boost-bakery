import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

const siteUrl = 'https://theboostbakery.com';
const defaultImage = `${siteUrl}/assets/boostbakery.png`;

@Injectable()
export class SeoTitleStrategy extends TitleStrategy {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const route = this.deepestRoute(snapshot.root);
    const pageTitle = this.buildTitle(snapshot) ?? 'The Boost Bakery | Custom Subaru WRX Tuning';
    const description = route.data['description'] as string | undefined;
    const canonicalPath = (route.data['canonicalPath'] as string | undefined) ?? '/';
    const robots = (route.data['robots'] as string | undefined) ?? 'index, follow';
    const canonicalUrl = `${siteUrl}${canonicalPath === '/' ? '' : canonicalPath}`;

    this.title.setTitle(pageTitle);
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ name: 'twitter:description', content: description });
    }
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:image', content: defaultImage });
    this.meta.updateTag({ property: 'og:site_name', content: 'The Boost Bakery' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:image', content: defaultImage });

    this.setCanonical(canonicalUrl);
    this.setStructuredData(canonicalPath);
  }

  private deepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = route;
    while (current.firstChild) current = current.firstChild;
    return current;
  }

  private setCanonical(url: string): void {
    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private setStructuredData(path: string): void {
    this.document.head.querySelectorAll('script[data-seo-schema]').forEach((node) => node.remove());
    const data = this.schemaFor(path);
    if (!data) return;

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-schema', 'true');
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  private schemaFor(path: string): Record<string, unknown> | undefined {
    const organization = {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'The Boost Bakery',
      url: siteUrl,
      logo: defaultImage,
      email: 'jlyda61@gmail.com',
      founder: { '@type': 'Person', name: 'Jeremy' },
      sameAs: [
        'https://www.tiktok.com/@bagelbytes61',
        'https://www.youtube.com/@bagelbytes61',
        'https://www.instagram.com/bagelbytes61'
      ]
    };

    if (path === '/') {
      return {
        '@context': 'https://schema.org',
        '@graph': [
          organization,
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            name: 'The Boost Bakery',
            alternateName: 'Boost Bakery',
            url: siteUrl,
            publisher: { '@id': `${siteUrl}/#organization` }
          },
          {
            '@type': 'Service',
            name: 'Custom Subaru WRX Tuning',
            description: 'Remote custom ECU calibration for 2015–2026 Subaru WRX models.',
            provider: { '@id': `${siteUrl}/#organization` },
            areaServed: 'US',
            url: `${siteUrl}/services/wrx-tuning`
          }
        ]
      };
    }

    if (path === '/services/wrx-tuning' || path === '/services/burble-tune') {
      const isFullTune = path.endsWith('wrx-tuning');
      return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: isFullTune ? 'Custom Subaru WRX ECU Tuning' : 'Subaru WRX Burble / Pop Tune',
        description: isFullTune
          ? 'Custom remote ECU calibration for 2015–2026 VA and VB Subaru WRX models.'
          : 'Sound-focused burble and pop calibration for compatible Subaru WRX setups.',
        provider: organization,
        areaServed: 'US',
        url: `${siteUrl}${path}`,
        offers: {
          '@type': 'Offer',
          price: isFullTune ? '350.00' : '100.00',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${siteUrl}${path}`
        }
      };
    }

    if (path === '/about') {
      return {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        url: `${siteUrl}/about`,
        mainEntity: organization
      };
    }

    return undefined;
  }
}

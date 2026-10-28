import { useEffect, useMemo, useState } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';

const pageFiles: Record<string, string> = {
  '/': 'index.html',
  '/services': 'services.html',
  '/service-general-care': 'service-general-care.html',
  '/service-vaccination': 'service-vaccination.html',
  '/service-surgery': 'service-surgery.html',
  '/service-dental-care': 'service-dental-care.html',
  '/service-grooming': 'service-grooming.html',
  '/service-diagnostics': 'service-diagnostics.html',
  '/packages': 'packages.html',
  '/team': 'team.html',
  '/about': 'about.html',
  '/facilities': 'facilities.html',
  '/contact': 'contact.html',
  '/appointment': 'appointment.html',
};

const imageMap: Record<string, string> = {
  'hero-pets-exact.webp': 'hero-pets-mockup.webp',
  'hero-clean.webp': 'hero-pets-mockup.webp',
  'hospital-exterior.webp': 'facilities.svg',
  'reception.webp': 'mobile-clinic.svg',
  'service-checkup.webp': 'pet-consultation.svg',
  'service-vaccination.webp': 'pet-vaccinations.svg',
  'service-surgery.webp': 'cat-surgery-1.svg',
  'service-dental.webp': 'pet-dental-care.svg',
  'service-grooming.webp': 'pet-hydrotherapy.svg',
  'service-diagnostics.webp': 'Advanced-CT-MRI-Imaging-1.svg',
};

const doctorInitials: Record<string, string> = {
  'doctor-1.webp': 'AR',
  'doctor-2.webp': 'SK',
  'doctor-3.webp': 'RO',
  'doctor-4.webp': 'CB',
};

const serviceRouteByFile: Record<string, string> = Object.fromEntries(
  Object.entries(pageFiles).map(([route, filename]) => [filename, route]),
);

function routeForLocation() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const cleanPath = base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
  return pageFiles[cleanPath] ? cleanPath : '/';
}

function rewritePage(markup: string, basePath: string) {
  const repairedMarkup = markup.replaceAll(
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8 7.8 0 0 0 0 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l8.12 8.12 8.12-8.12a5.5 5.5 0 0 0 0-7.78Z',
  );
  const documentPage = new DOMParser().parseFromString(repairedMarkup, 'text/html');
  documentPage.querySelectorAll('script, link[rel="stylesheet"]').forEach((node) => node.remove());

  documentPage.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
    const rawHref = anchor.getAttribute('href') || '';
    const [fileName] = rawHref.split(/[?#]/);
    const cleanRoute = serviceRouteByFile[fileName.split('/').pop() || ''];
    if (cleanRoute) {
      const suffix = rawHref.slice(fileName.length);
      anchor.href = `${basePath}${cleanRoute === '/' ? '/' : cleanRoute}${suffix}`;
    }
  });

  documentPage.querySelectorAll<HTMLImageElement>('img[src]').forEach((image) => {
    const originalPath = image.getAttribute('src') || '';
    const originalName = originalPath.split('/').pop() || '';
    const initials = doctorInitials[originalName];
    if (initials) {
      const portrait = documentPage.createElement('div');
      portrait.className = 'doctor-portrait-fallback';
      portrait.setAttribute('role', 'img');
      portrait.setAttribute('aria-label', image.alt || 'Veterinary clinician');
      portrait.textContent = initials;
      image.replaceWith(portrait);
      return;
    }
    const mappedName = imageMap[originalName] || originalName;
    image.src = `${basePath}/rvh/assets/${encodeURIComponent(mappedName).replace(/%20/g, '%20')}`;
  });

  documentPage.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const style = element.getAttribute('style') || '';
    const updated = style.replace(/assets\/([^'")\s]+)/g, (_match, name: string) => {
      const actualName = imageMap[name] || name;
      return `${basePath}/rvh/assets/${encodeURIComponent(actualName)}`;
    });
    element.setAttribute('style', updated);
  });

  documentPage.documentElement.lang = 'en';
  documentPage.documentElement.dir = 'ltr';
  return {
    html: documentPage.body.innerHTML,
    title: documentPage.title || 'Royal Veterinary Hospital',
    description:
      documentPage.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ||
      'Compassionate veterinary care in Sulaymaniyah, Kurdistan Region, Iraq.',
    direction: documentPage.documentElement.dir,
  };
}

function ArchivePage() {
  const route = routeForLocation();
  const [page, setPage] = useState<ReturnType<typeof rewritePage> | null>(null);
  const [error, setError] = useState(false);
  const sourceFile = useMemo(() => pageFiles[route], [route]);
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

  useEffect(() => {
    let active = true;
    setPage(null);
    setError(false);
    fetch(`${basePath}/rvh/pages/${sourceFile}`)
      .then((response) => {
        if (!response.ok) throw new Error('The page could not be loaded.');
        return response.text();
      })
      .then((markup) => {
        if (!active) return;
        const translated = rewritePage(markup, basePath);
        setPage(translated);
        document.title = translated.title;
        document.documentElement.lang = translated.direction === 'rtl' ? 'ku' : 'en';
        document.documentElement.dir = translated.direction;
        let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!description) {
          description = document.createElement('meta');
          description.name = 'description';
          document.head.append(description);
        }
        description.content = translated.description;
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [basePath, sourceFile]);

  useEffect(() => {
    if (!page) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = `${basePath}/rvh/styles.css`;
    stylesheet.dataset.royalArchive = 'true';
    document.head.append(stylesheet);

    const initialize = () => {
      const scripts: HTMLScriptElement[] = [];
      const startApp = () => {
        const appScript = document.createElement('script');
        appScript.src = `${basePath}/rvh/app.js`;
        appScript.onload = () => document.dispatchEvent(new Event('DOMContentLoaded'));
        document.body.append(appScript);
        scripts.push(appScript);
      };
      if (route === '/contact') {
        const leafletCss = document.createElement('link');
        leafletCss.rel = 'stylesheet';
        leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.append(leafletCss);
        const leaflet = document.createElement('script');
        leaflet.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leaflet.onload = startApp;
        leaflet.onerror = startApp;
        document.body.append(leaflet);
        scripts.push(leaflet);
      } else {
        startApp();
      }
      return scripts;
    };
    const scripts = initialize();
    document.body.id = 'top';
    return () => {
      stylesheet.remove();
      scripts.forEach((script) => script.remove());
    };
  }, [basePath, page, route]);

  if (error) {
    return (
      <div className="archive-error" role="alert">
        <h1>We couldn’t open this page</h1>
        <p>Please try again, or return to the hospital homepage.</p>
        <a href={`${basePath}/`}>Return to Royal Veterinary Hospital</a>
      </div>
    );
  }
  if (!page) {
    return (
      <div className="archive-loading" aria-label="Loading hospital information">
        <div className="archive-skeleton" />
      </div>
    );
  }
  return <div className="archive-page" dangerouslySetInnerHTML={{ __html: page.html }} />;
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ErrorBoundary resetKey={window.location.pathname}>
        <Switch>
          <Route component={ArchivePage} />
        </Switch>
      </ErrorBoundary>
    </WouterRouter>
  );
}

export default App;

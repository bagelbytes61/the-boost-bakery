import { RenderMode, ServerRoute } from '@angular/ssr';

const indexedRoutes = ['', 'services', 'services/wrx-tuning', 'services/burble-tune', 'contact', 'about'];

export const serverRoutes: ServerRoute[] = [
  ...indexedRoutes.map((path): ServerRoute => ({
    path,
    renderMode: RenderMode.Server
  })),
  {
    path: 'checkout',
    renderMode: RenderMode.Server,
    headers: { 'X-Robots-Tag': 'noindex, nofollow' }
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
    status: 404,
    headers: { 'X-Robots-Tag': 'noindex, nofollow' }
  }
];

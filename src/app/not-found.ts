import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <p>404 / Missed apex</p>
      <h1>This road doesn’t go anywhere.</h1>
      <span>The page may have moved, but the tuning shop is still open.</span>
      <a routerLink="/" class="btn btn-accent">Return home</a>
    </section>
  `,
  styles: [`
    .not-found { max-width: 850px; min-height: 65vh; margin: 0 auto; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
    .not-found p { color: #f36a63; font: 800 10px var(--font-display); letter-spacing: 2px; text-transform: uppercase; }
    .not-found h1 { max-width: 720px; margin: 18px 0; font-size: clamp(38px, 7vw, 76px); line-height: 1; letter-spacing: -2px; }
    .not-found span { color: var(--text-secondary); margin-bottom: 32px; }
  `]
})
export class NotFoundComponent {}

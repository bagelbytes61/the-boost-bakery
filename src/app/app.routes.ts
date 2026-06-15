import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ServicesComponent } from './services/services';
import { WrxTuningComponent } from './services/wrx-tuning/wrx-tuning';
import { CheckoutComponent } from './checkout/checkout';
import { ContactComponent } from './contact/contact';
import { AboutComponent } from './about/about';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'services', component: ServicesComponent },
  { path: 'services/wrx-tuning', component: WrxTuningComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent }
];

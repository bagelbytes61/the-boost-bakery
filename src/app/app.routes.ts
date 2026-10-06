import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ServicesComponent } from './services/services';
import { WrxTuningComponent } from './services/wrx-tuning/wrx-tuning';
import { BurbleTuneComponent } from './services/burble-tune/burble-tune';
import { CheckoutComponent } from './checkout/checkout';
import { ContactComponent } from './contact/contact';
import { AboutComponent } from './about/about';
import { NotFoundComponent } from './not-found';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: 'Custom Subaru WRX Tuning | The Boost Bakery',
    data: {
      description: 'Custom remote ECU tuning for 2015–2026 Subaru WRX VA and VB platforms, including FA24-swapped VA builds. Calibrated for your hardware and goals.',
      canonicalPath: '/'
    }
  },
  {
    path: 'services',
    component: ServicesComponent,
    title: 'Subaru WRX Tuning Services | The Boost Bakery',
    data: {
      description: 'Explore custom Subaru WRX ECU calibration and compatible burble tune services for 2015–2026 VA and VB platforms.',
      canonicalPath: '/services'
    }
  },
  {
    path: 'services/wrx-tuning',
    component: WrxTuningComponent,
    title: '2015–2026 Subaru WRX Custom Tune | The Boost Bakery',
    data: {
      description: 'Order a custom remote tune for your 2015–2026 Subaru WRX. VA, VB, and supported FA24-swapped VA calibrations built around your modifications.',
      canonicalPath: '/services/wrx-tuning'
    }
  },
  {
    path: 'services/burble-tune',
    component: BurbleTuneComponent,
    title: 'Subaru WRX Burble & Pop Tune | The Boost Bakery',
    data: {
      description: 'A sound-focused burble and pop calibration for compatible 2015–2026 Subaru WRX setups using Atlas and a supported OBDII adapter.',
      canonicalPath: '/services/burble-tune'
    }
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    title: 'Secure Checkout | The Boost Bakery',
    data: {
      description: 'Secure checkout for your custom Subaru WRX calibration.',
      canonicalPath: '/checkout',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: 'contact',
    component: ContactComponent,
    title: 'Contact Your Subaru WRX Tuner | The Boost Bakery',
    data: {
      description: 'Contact The Boost Bakery with questions about custom Subaru WRX tuning, vehicle compatibility, Atlas, or your current modifications.',
      canonicalPath: '/contact'
    }
  },
  {
    path: 'about',
    component: AboutComponent,
    title: 'About The Boost Bakery | Subaru WRX Tuning',
    data: {
      description: 'Meet Jeremy, the embedded software engineer and automotive enthusiast behind The Boost Bakery custom Subaru WRX calibrations.',
      canonicalPath: '/about'
    }
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found | The Boost Bakery',
    data: {
      description: 'The requested page could not be found.',
      canonicalPath: '/404',
      robots: 'noindex, nofollow'
    }
  }
];

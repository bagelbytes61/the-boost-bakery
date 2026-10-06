import { Component, ElementRef, ViewChild, inject, signal, AfterViewInit, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartItem, CartService } from '../services/cart.service';

interface TransactionDetails {
  id: string;
  payerName: string;
  email: string;
  amount: string;
  status: string;
}

interface OrderNotification {
  transaction: TransactionDetails;
  items: CartItem[];
}

type NotificationStatus = 'idle' | 'sending' | 'sent' | 'failed';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  cartService = inject(CartService);
  router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  paypalButtonsRendered = false;
  @ViewChild('paypalContainer') paypalContainer?: ElementRef;

  paymentSuccess = signal<boolean>(false);
  transactionDetails = signal<TransactionDetails | null>(null);
  notificationStatus = signal<NotificationStatus>('idle');
  private pendingNotification = signal<OrderNotification | null>(null);

  ngOnInit() {
    // If the cart is empty when they land on /checkout, redirect them back to Home
    if (this.cartService.itemCount() === 0 && !this.paymentSuccess()) {
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.cartService.itemCount() > 0 && !this.paymentSuccess()) {
      setTimeout(async () => {
        try {
          await this.loadPayPalSdk();
          this.renderPayPalButtons();
        } catch (error) {
          console.error('Failed to load PayPal SDK:', error);
        }
      }, 150);
    }
  }

  private loadPayPalSdk(): Promise<void> {
    if ((window as any).paypal) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AR3oocP0xatfjmrzKmVy-QzksW42_-iaAKlKMbSyvjcpvZPjzAYY3S9MWHYsTtyI4PRMxExZVAH42L-l&currency=USD&intent=capture';
      script.async = true;
      script.setAttribute('data-paypal-sdk', 'true');
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('PayPal SDK failed to load.')), { once: true });
      this.document.head.appendChild(script);
    });
  }

  renderPayPalButtons() {
    if (this.paypalButtonsRendered || !this.paypalContainer) return;
    this.paypalButtonsRendered = true;

    this.paypalContainer.nativeElement.innerHTML = '';

    try {
      (window as any).paypal.Buttons({
        style: {
          layout: 'vertical',
          color:  'gold',
          shape:  'rect',
          label:  'paypal'
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: 'The Boost Bakery - Calibration Services',
              amount: {
                currency_code: 'USD',
                value: this.cartService.cartTotal().toFixed(2)
              }
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const details = await actions.order.capture();
          await this.handlePaymentSuccess(details);
        },
        onError: (err: any) => {
          console.error('PayPal Checkout Error:', err);
          this.paypalButtonsRendered = false;
        }
      }).render(this.paypalContainer.nativeElement);
    } catch (e) {
      console.error('Failed to load PayPal buttons:', e);
      this.paypalButtonsRendered = false;
    }
  }

  async handlePaymentSuccess(details: any) {
    const transaction: TransactionDetails = {
      id: details.id,
      payerName: `${details.payer.name.given_name} ${details.payer.name.surname}`,
      email: details.payer.email_address,
      amount: details.purchase_units[0].payments.captures[0].amount.value,
      status: details.status
    };
    const orderItems = this.cartService.items().map((item) => ({
      ...item,
      addOns: item.addOns?.map((addOn) => ({ ...addOn })),
      specs: { ...item.specs }
    }));

    this.paymentSuccess.set(true);
    this.transactionDetails.set(transaction);
    this.pendingNotification.set({ transaction, items: orderItems });

    await this.sendOrderNotification();
  }

  async retryOrderNotification() {
    if (this.notificationStatus() === 'sending') return;
    await this.sendOrderNotification();
  }

  private async sendOrderNotification() {
    const order = this.pendingNotification();
    if (!order) return;

    this.notificationStatus.set('sending');

    try {
      const response = await fetch('/api/order-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        throw new Error(`Order notification failed with status ${response.status}`);
      }

      this.notificationStatus.set('sent');
      this.pendingNotification.set(null);
      this.cartService.clearCart();
    } catch (error) {
      console.error('Failed to register tune order:', error);
      this.notificationStatus.set('failed');
    }
  }
}

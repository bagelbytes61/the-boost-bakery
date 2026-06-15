import { Component, ElementRef, ViewChild, inject, signal, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

declare const paypal: any;

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  cartService = inject(CartService);
  router = inject(Router);

  paypalButtonsRendered = false;
  @ViewChild('paypalContainer') paypalContainer?: ElementRef;

  paymentSuccess = signal<boolean>(false);
  transactionDetails = signal<any>(null);

  ngOnInit() {
    // If the cart is empty when they land on /checkout, redirect them back to Home
    if (this.cartService.itemCount() === 0 && !this.paymentSuccess()) {
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit() {
    if (this.cartService.itemCount() > 0 && !this.paymentSuccess()) {
      setTimeout(() => {
        this.renderPayPalButtons();
      }, 150);
    }
  }

  renderPayPalButtons() {
    if (this.paypalButtonsRendered || !this.paypalContainer) return;
    this.paypalButtonsRendered = true;

    this.paypalContainer.nativeElement.innerHTML = '';

    try {
      paypal.Buttons({
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
          this.handlePaymentSuccess(details);
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

  handlePaymentSuccess(details: any) {
    this.paymentSuccess.set(true);
    this.transactionDetails.set({
      id: details.id,
      payerName: `${details.payer.name.given_name} ${details.payer.name.surname}`,
      email: details.payer.email_address,
      amount: details.purchase_units[0].payments.captures[0].amount.value,
      status: details.status
    });

    // Wipes cart securely after payment approved
    this.cartService.clearCart();
  }
}

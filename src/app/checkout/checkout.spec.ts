import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CheckoutComponent } from './checkout';
import { CartService } from '../services/cart.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartService: CartService;
  let mockRouter = {
    navigate: vi.fn()
  };

  beforeEach(async () => {
    // Mock the global PayPal SDK window object
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));

    (window as any).paypal = {
      Buttons: () => ({
        render: () => Promise.resolve()
      })
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        CartService,
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the Checkout component', () => {
    expect(component).toBeTruthy();
  });

  it('should hide payment success view by default', () => {
    expect(component.paymentSuccess()).toBeFalsy();
    expect(component.transactionDetails()).toBeNull();
  });

  it('should send the tune details after a successful payment capture', async () => {
    const mockDetails = {
      id: 'PAY-789012',
      status: 'COMPLETED',
      payer: {
        email_address: 'jlyda61@gmail.com',
        name: {
          given_name: 'Jeremy',
          surname: 'Lyda'
        }
      },
      purchase_units: [{
        payments: {
          captures: [{
            amount: {
              value: '350.00'
            }
          }]
        }
      }]
    };

    cartService.addToCart({
      id: 'wrx-tuning-123',
      name: 'Subaru WRX (2015-2026) Tuning',
      price: 350,
      specs: {
        modelYear: '2022',
        vin: 'JF1VA1A60G9800001',
        mileage: 45000,
        mods: 'Intake, J-Pipe',
        notes: '93 octane'
      }
    });

    await component.handlePaymentSuccess(mockDetails);
    
    expect(component.paymentSuccess()).toBeTruthy();
    expect(component.transactionDetails()).toBeTruthy();
    expect(component.transactionDetails()?.id).toBe('PAY-789012');
    expect(component.transactionDetails()?.payerName).toBe('Jeremy Lyda');
    expect(component.transactionDetails()?.email).toBe('jlyda61@gmail.com');
    expect(component.notificationStatus()).toBe('sent');
    expect(fetch).toHaveBeenCalledWith('/api/order-notification', expect.objectContaining({
      method: 'POST'
    }));
    expect(cartService.itemCount()).toBe(0);
  });

  it('should redirect back to home if landed on checkout with empty cart', () => {
    // Empty the cart
    cartService.clearCart();
    
    // Call ngOnInit manually or detect changes to trigger
    component.ngOnInit();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});

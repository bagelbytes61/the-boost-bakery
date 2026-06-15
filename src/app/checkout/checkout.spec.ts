import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('should create the Checkout component', () => {
    expect(component).toBeTruthy();
  });

  it('should hide payment success view by default', () => {
    expect(component.paymentSuccess()).toBeFalsy();
    expect(component.transactionDetails()).toBeNull();
  });

  it('should successfully handle capture of payment simulated response', () => {
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

    component.handlePaymentSuccess(mockDetails);
    
    expect(component.paymentSuccess()).toBeTruthy();
    expect(component.transactionDetails()).toBeTruthy();
    expect(component.transactionDetails().id).toBe('PAY-789012');
    expect(component.transactionDetails().payerName).toBe('Jeremy Lyda');
    expect(component.transactionDetails().email).toBe('jlyda61@gmail.com');
  });

  it('should redirect back to home if landed on checkout with empty cart', () => {
    // Empty the cart
    cartService.clearCart();
    
    // Call ngOnInit manually or detect changes to trigger
    component.ngOnInit();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});

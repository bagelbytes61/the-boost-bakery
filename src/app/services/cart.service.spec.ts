import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty cart', () => {
    expect(service.items().length).toBe(0);
    expect(service.itemCount()).toBe(0);
    expect(service.cartTotal()).toBe(0);
    expect(service.isCartOpen()).toBeFalsy();
  });

  it('should add items to the cart and compute totals', () => {
    const item1: CartItem = {
      id: 'wrx-tuning',
      name: 'Subaru WRX (2015-2026) Tuning',
      price: 350,
      specs: {
        modelYear: '2022',
        vin: '12345678901234567',
        mileage: 45000,
        mods: 'Intake, J-Pipe'
      }
    };

    service.addToCart(item1);
    
    expect(service.items().length).toBe(1);
    expect(service.itemCount()).toBe(1);
    expect(service.cartTotal()).toBe(350);
    expect(service.isCartOpen()).toBeTruthy(); // Automatically opens
  });

  it('should remove items by index and recalculate total', () => {
    const item1: CartItem = {
      id: 'wrx-tuning',
      name: 'Subaru WRX (2015-2026) Tuning',
      price: 350,
      specs: {
        modelYear: '2022',
        vin: '12345678901234567',
        mileage: 45000,
        mods: 'Intake'
      }
    };
    const item2: CartItem = {
      id: 'other-service',
      name: 'Support Package',
      price: 50,
      specs: {
        modelYear: '2019',
        vin: 'ABC12345678901234',
        mileage: 12000,
        mods: 'Stock'
      }
    };

    service.addToCart(item1);
    service.addToCart(item2);
    expect(service.cartTotal()).toBe(400);

    service.removeFromCart(0); // Remove item1
    expect(service.itemCount()).toBe(1);
    expect(service.cartTotal()).toBe(50);
    expect(service.items()[0].id).toBe('other-service');
  });

  it('should clear the cart entirely', () => {
    const item1: CartItem = {
      id: 'wrx-tuning',
      name: 'Subaru WRX (2015-2026) Tuning',
      price: 350,
      specs: {
        modelYear: '2022',
        vin: '12345678901234567',
        mileage: 45000,
        mods: 'Intake'
      }
    };

    service.addToCart(item1);
    expect(service.itemCount()).toBe(1);

    service.clearCart();
    expect(service.itemCount()).toBe(0);
    expect(service.cartTotal()).toBe(0);
  });
});

import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  specs: {
    modelYear: string;
    vin: string;
    mileage: number;
    mods: string;
    notes?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  items = signal<CartItem[]>([]);
  isCartOpen = signal<boolean>(false);

  itemCount = computed(() => this.items().length);
  cartTotal = computed(() => this.items().reduce((total, item) => total + item.price, 0));

  addToCart(item: CartItem) {
    this.items.set([...this.items(), item]);
    this.isCartOpen.set(true); // Auto-open cart drawer on item addition
  }

  removeFromCart(index: number) {
    const current = this.items();
    this.items.set(current.filter((_, i) => i !== index));
  }

  clearCart() {
    this.items.set([]);
  }

  openCart() {
    this.isCartOpen.set(true);
  }

  closeCart() {
    this.isCartOpen.set(false);
  }

  toggleCart() {
    this.isCartOpen.set(!this.isCartOpen());
  }
}

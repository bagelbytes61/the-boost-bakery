import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent {
  cartService = inject(CartService);
  router = inject(Router);

  closeCartDrawer() {
    this.cartService.closeCart();
  }

  proceedToCheckout() {
    this.cartService.closeCart(); // Close drawer first
    this.router.navigate(['/checkout']); // Redirect to the dedicated checkout page
  }
}

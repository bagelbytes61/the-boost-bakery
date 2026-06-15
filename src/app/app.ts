import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { CartComponent } from './cart/cart';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, SidebarComponent, CartComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  cartService = inject(CartService);

  @Output() sidebarMenuOpenUpdate = new EventEmitter<boolean>();
  sidebarMenuOpen: boolean = false;

  toggleSidebarMenu() {
    this.sidebarMenuOpen = !this.sidebarMenuOpen;
    this.sidebarMenuOpenUpdate.emit(this.sidebarMenuOpen);
  }
}

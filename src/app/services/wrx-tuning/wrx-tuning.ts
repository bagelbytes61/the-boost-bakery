import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-wrx-tuning',
  imports: [CommonModule, FormsModule],
  templateUrl: './wrx-tuning.html',
  styleUrl: './wrx-tuning.css'
})
export class WrxTuningComponent {
  cartService = inject(CartService);

  title = 'Subaru WRX (2015-2026) Tuning';
  price = 350;

  modelYear = signal<string>('2022');
  vin = signal<string>('');
  mileage = signal<number | null>(null);
  mods = signal<string>('');
  notes = signal<string>('');

  isSubmitting = signal<boolean>(false);
  orderSubmitted = signal<boolean>(false); // Preserved for testing assertions compatibility

  submitOrder() {
    if (!this.vin() || this.vin().length !== 17 || this.mileage() === null || this.mileage()! < 0 || !this.mods() || this.mods().trim().length === 0) return;
    this.isSubmitting.set(true);
    
    setTimeout(() => {
      this.cartService.addToCart({
        id: `wrx-tuning-${Date.now()}`,
        name: this.title,
        price: this.price,
        specs: {
          modelYear: this.modelYear(),
          vin: this.vin().toUpperCase(),
          mileage: this.mileage()!,
          mods: this.mods(),
          notes: this.notes() || undefined
        }
      });
      
      this.isSubmitting.set(false);
      this.orderSubmitted.set(true); // Confirms trigger to tests
      
      // Clear inputs for subsequent configurations
      this.vin.set('');
      this.mileage.set(null);
      this.mods.set('');
      this.notes.set('');
    }, 1000);
  }

  resetForm() {
    this.modelYear.set('2022');
    this.vin.set('');
    this.mileage.set(null);
    this.mods.set('');
    this.notes.set('');
    this.orderSubmitted.set(false);
  }
}

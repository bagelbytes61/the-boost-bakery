import { Component, computed, signal, inject } from '@angular/core';
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
  readonly fa24Swap = {
    id: 'fa24-swap',
    name: 'FA24 Swap',
    price: 75,
    description: 'Custom calibration for supported FA24-swapped VA WRX builds.'
  };
  readonly uelHeaderEmulation = {
    id: 'uel-header-emulation',
    name: 'Unequal Length Header Emulation (UELHE)',
    price: 295,
    description: 'Iconic Subie rumble with all the performance of equal length headers.'
  };
  readonly bigFactoryCam = {
    id: 'big-factory-cam',
    name: 'Big Factory Cam (BFC)',
    price: 195,
    description: 'Big-cam attitude with factory-smooth drivability.'
  };

  modelYear = signal<string>('2022');
  vin = signal<string>('');
  mileage = signal<number | null>(null);
  mods = signal<string>('');
  notes = signal<string>('');
  fa24SwapSelected = signal<boolean>(false);
  uelHeaderEmulationSelected = signal<boolean>(false);
  bigFactoryCamSelected = signal<boolean>(false);
  totalPrice = computed(
    () =>
      this.price +
      (this.fa24SwapSelected() ? this.fa24Swap.price : 0) +
      (this.uelHeaderEmulationSelected() ? this.uelHeaderEmulation.price : 0) +
      (this.bigFactoryCamSelected() ? this.bigFactoryCam.price : 0)
  );

  isSubmitting = signal<boolean>(false);
  orderSubmitted = signal<boolean>(false); // Preserved for testing assertions compatibility

  submitOrder() {
    if (!this.vin() || this.vin().length !== 17 || this.mileage() === null || this.mileage()! < 0 || !this.mods() || this.mods().trim().length === 0) return;
    this.isSubmitting.set(true);

    setTimeout(() => {
      const addOns = [
        ...(this.fa24SwapSelected() ? [this.fa24Swap] : []),
        ...(this.uelHeaderEmulationSelected() ? [this.uelHeaderEmulation] : []),
        ...(this.bigFactoryCamSelected() ? [this.bigFactoryCam] : [])
      ];

      this.cartService.addToCart({
        id: `wrx-tuning-${Date.now()}`,
        name: this.title,
        price: this.totalPrice(),
        addOns,
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
      this.fa24SwapSelected.set(false);
      this.uelHeaderEmulationSelected.set(false);
      this.bigFactoryCamSelected.set(false);
    }, 1000);
  }

  resetForm() {
    this.modelYear.set('2022');
    this.vin.set('');
    this.mileage.set(null);
    this.mods.set('');
    this.notes.set('');
    this.fa24SwapSelected.set(false);
    this.uelHeaderEmulationSelected.set(false);
    this.bigFactoryCamSelected.set(false);
    this.orderSubmitted.set(false);
  }
}

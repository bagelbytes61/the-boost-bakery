import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.css'
})
export class ServicesComponent {
  productName = 'Custom ECU Tuning Service';
  productPrice = 299;
  productDescription = 'Bespoke custom ECU calibration engineered specifically for your WRX platform, fuel type, and installed hardware mods. Optimized throttle behavior, safe timing targets, and seamless drivability.';

  vehicleYear = signal<string>('2021');
  transmissionType = signal<string>('Manual');
  vehicleMods = signal<string>('');

  isSubmitting = signal<boolean>(false);
  orderSubmitted = signal<boolean>(false);

  submitOrder() {
    this.isSubmitting.set(true);
    
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.orderSubmitted.set(true);
    }, 1500);
  }

  resetForm() {
    this.vehicleYear.set('2021');
    this.transmissionType.set('Manual');
    this.vehicleMods.set('');
    this.orderSubmitted.set(false);
  }
}

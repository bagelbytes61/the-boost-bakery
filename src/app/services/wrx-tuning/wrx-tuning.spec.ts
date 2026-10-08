import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WrxTuningComponent } from './wrx-tuning';

describe('WrxTuningComponent', () => {
  let component: WrxTuningComponent;
  let fixture: ComponentFixture<WrxTuningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrxTuningComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WrxTuningComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the WrxTuning component', () => {
    expect(component).toBeTruthy();
  });

  it('should define correct title and price', () => {
    expect(component.title).toBe('Subaru WRX (2015-2026) Tuning');
    expect(component.price).toBe(350);
  });

  it('should default to 2022 model year', () => {
    expect(component.modelYear()).toBe('2022');
  });

  it('should add $75 when the FA24 swap checkbox is selected', async () => {
    const checkbox = fixture.nativeElement.querySelector('input[name="fa24Swap"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(component.totalPrice()).toBe(350);

    checkbox.click();
    await fixture.whenStable();

    expect(component.fa24SwapSelected()).toBe(true);
    expect(component.totalPrice()).toBe(425);
    expect(fixture.nativeElement.querySelector('.btn-checkout').textContent).toContain('$425');

    checkbox.click();
    await fixture.whenStable();
    expect(component.totalPrice()).toBe(350);
  });

  it('should process calibration order asynchronously with valid inputs', () => {
    vi.useFakeTimers();
    try {
      expect(component.isSubmitting()).toBeFalsy();
      expect(component.orderSubmitted()).toBeFalsy();

      // Set inputs
      component.vin.set('12345678901234567');
      component.mileage.set(45000);
      component.mods.set('Cold Air Intake, Catback Exhaust');
      component.fa24SwapSelected.set(true);
      component.uelHeaderEmulationSelected.set(true);
      component.bigFactoryCamSelected.set(true);

      component.submitOrder();
      expect(component.isSubmitting()).toBeTruthy();

      // Fast-forward by 1500ms
      vi.advanceTimersByTime(1500);

      expect(component.isSubmitting()).toBeFalsy();
      expect(component.orderSubmitted()).toBeTruthy();
      expect(component.cartService.items()[0].price).toBe(915);
      expect(component.cartService.items()[0].addOns?.map((addOn) => addOn.name)).toEqual([
        'FA24 Swap',
        'Unequal Length Header Emulation (UELHE)',
        'Big Factory Cam (BFC)'
      ]);
      expect(component.cartService.items()[0].addOns?.[0].price).toBe(75);
      expect(component.fa24SwapSelected()).toBeFalsy();
      expect(component.totalPrice()).toBe(350);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should NOT submit order if inputs are invalid', () => {
    expect(component.isSubmitting()).toBeFalsy();
    expect(component.orderSubmitted()).toBeFalsy();

    // Missing vin / mileage
    component.submitOrder();
    expect(component.isSubmitting()).toBeFalsy();
    expect(component.orderSubmitted()).toBeFalsy();
  });

  it('should reset all signals when calling resetForm()', () => {
    component.vin.set('12345678901234567');
    component.mileage.set(45000);
    component.mods.set('Intake');
    component.notes.set('93 octane');
    component.fa24SwapSelected.set(true);
    component.uelHeaderEmulationSelected.set(true);
    component.bigFactoryCamSelected.set(true);
    component.orderSubmitted.set(true);

    component.resetForm();

    expect(component.vin()).toBe('');
    expect(component.mileage()).toBeNull();
    expect(component.mods()).toBe('');
    expect(component.notes()).toBe('');
    expect(component.fa24SwapSelected()).toBeFalsy();
    expect(component.uelHeaderEmulationSelected()).toBeFalsy();
    expect(component.bigFactoryCamSelected()).toBeFalsy();
    expect(component.orderSubmitted()).toBeFalsy();
  });
});

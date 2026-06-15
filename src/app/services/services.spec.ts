import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServicesComponent } from './services';

describe('ServicesComponent', () => {
  let component: ServicesComponent;
  let fixture: ComponentFixture<ServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the Services component', () => {
    expect(component).toBeTruthy();
  });

  it('should define correct default product specs', () => {
    expect(component.productName).toBe('Custom ECU Tuning Service');
    expect(component.productPrice).toBe(299);
  });

  it('should simulate order submission asynchronously', () => {
    vi.useFakeTimers();
    try {
      expect(component.isSubmitting()).toBeFalsy();
      expect(component.orderSubmitted()).toBeFalsy();

      component.submitOrder();
      expect(component.isSubmitting()).toBeTruthy();

      // Fast-forward by 1500ms
      vi.advanceTimersByTime(1500);

      expect(component.isSubmitting()).toBeFalsy();
      expect(component.orderSubmitted()).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});

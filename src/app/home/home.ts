import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  @ViewChild('bgVideo') bgVideo!: ElementRef<HTMLVideoElement>;

  toggleVideo() {
    if (this.bgVideo && this.bgVideo.nativeElement) {
      const video = this.bgVideo.nativeElement;
      if (video.paused) {
        video.play().catch(error => console.warn('Video play failed:', error));
      } else {
        video.pause();
      }
    }
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Output() menuOpenUpdate = new EventEmitter<boolean>();
  @Input() menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.menuOpenUpdate.emit(this.menuOpen);
  }
}

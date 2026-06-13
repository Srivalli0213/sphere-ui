import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent {
  @Input() activeMenu: string | undefined = 'dashboard';
  @Output() activeMenuChange = new EventEmitter<string>();
  @Output() menuChange = new EventEmitter<string>();

  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  selectMenu(menuId: string) {
    this.activeMenu = menuId;
    this.activeMenuChange.emit(menuId);
    this.menuChange.emit(menuId);
  }
}

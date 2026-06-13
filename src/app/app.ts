import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  title = 'sphere-ui';
  activeMenu = 'dashboard';

  constructor(private router: Router) {}

  ngOnInit() {
    this.syncMenuWithRoute();
  }

  onMenuChange(menuId: string) {
    this.activeMenu = menuId;
    this.router.navigate([`/${menuId}`]);
  }

  private syncMenuWithRoute() {
    const urlSegment = this.router.url.split('/')[1];
    if (urlSegment) {
      this.activeMenu = urlSegment;
    }
  }
}

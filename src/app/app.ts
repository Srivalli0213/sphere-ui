import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
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
    this.syncMenuWithRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.syncMenuWithRoute(event.urlAfterRedirects));
  }

  onMenuChange(menuId: string) {
    this.activeMenu = menuId;
    this.router.navigate([`/${menuId}`]);
  }

  private syncMenuWithRoute(url: string) {
    const urlSegment = url.split('/')[1];
    if (urlSegment) {
      this.activeMenu = urlSegment;
    }
  }
}

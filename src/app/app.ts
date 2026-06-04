import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SphereComponent } from './sphere/sphere.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, SphereComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'sphere-ui';
}

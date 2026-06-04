import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  topKpis = [
    { label: 'Completed Projects', value: 82 },
    { label: 'Pending Projects', value: 23 },
    { label: 'Total Projects', value: 124 }
  ];

  bottomKpis = [
    { label: 'Trending Projects', value: 9 },
    { label: 'Upcoming Projects', value: 10 }
  ];

  projectBreakdown = [
    { label: 'Hackathon Projects', value: 30, color: '#00d4ff' },
    { label: 'Final Projects', value: 50, color: '#ff00ff' },
    { label: 'Research Projects', value: 20, color: '#7c3aed' }
  ];

  get totalProjectCount(): number {
    return this.projectBreakdown.reduce((sum, item) => sum + item.value, 0);
  }

  get pieGradient(): string {
    let start = 0;
    const segments = this.projectBreakdown.map(segment => {
      const end = start + segment.value;
      const slice = `${segment.color} ${start}% ${end}%`;
      start = end;
      return slice;
    });
    return `conic-gradient(from 0deg, ${segments.join(', ')})`;
  }
}

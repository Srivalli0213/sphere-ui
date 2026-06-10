import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';

type RawProject = {
  id?: number;
  type?: string;
  status?: string;
  startDate?: string | null;
  deadline?: string | null;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  topKpis = [
    { label: 'Completed Projects', value: 0 },
    { label: 'In Progress', value: 0 },
    { label: 'Total Projects', value: 0 }
  ];

  bottomKpis = [
    { label: 'Trending Projects', value: 0 },
    { label: 'Upcoming Projects', value: 0 }
  ];

  projectBreakdown: { label: string; value: number; color: string }[] = [];

  // list of completed project details for dashboard
  completedProjects: Array<{ projectTitle?: string; contact?: string; startDate?: string | null; deadline?: string | null }> = [];

  // Material table
  displayedColumns: string[] = ['projectTitle', 'contact', 'startDate', 'deadline'];
  dataSource = new MatTableDataSource<any>([]);

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.http.get<RawProject[]>('assets/kiet-projects.json').subscribe({
      next: projects => this.computeMetrics(projects || []),
      error: () => this.computeMetrics([])
    });
  }

  private computeMetrics(projects: RawProject[]): void {
    const total = projects.length;
    const completed = projects.filter(p => (p.status || '').toLowerCase() === 'completed').length;
    // count only explicit "in progress" statuses for the dashboard
    const inProgress = projects.filter(p => (p.status || '').toLowerCase() === 'in progress').length;

    this.topKpis = [
      { label: 'Completed Projects', value: completed },
      { label: 'In Progress', value: inProgress },
      { label: 'Total Projects', value: total }
    ];

    // breakdown by normalized type
    const typeCounts: Record<string, number> = {};
    projects.forEach(p => {
      const t = (p.type || 'Hackathon Project').trim();
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    const palette = ['#00d4ff', '#ff00ff', '#7c3aed', '#34d399', '#f59e0b'];
    this.projectBreakdown = Object.entries(typeCounts).map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }));

    // upcoming = deadlines in future
    const now = Date.now();
    const upcoming = projects.filter(p => p.deadline && !isNaN(Date.parse(p.deadline)) && Date.parse(p.deadline!) > now).length;

    // trending: top type value
    const trendingValue = this.projectBreakdown.length ? Math.max(...this.projectBreakdown.map(x => x.value)) : 0;

    this.bottomKpis = [
      { label: 'Trending Projects', value: trendingValue },
      { label: 'Upcoming Projects', value: upcoming }
    ];

    // prepare completed projects list
    this.completedProjects = projects
      .filter(p => (p.status || '').toLowerCase() === 'completed')
      .map(p => ({ projectTitle: (p as any).projectTitle || (p as any).title || 'Untitled', contact: (p as any).contact || (p as any).email || 'contact@example.com', startDate: p.startDate ?? null, deadline: p.deadline ?? null }));

    // populate mat-table datasource
    this.dataSource.data = this.completedProjects;
  }

  applyFilter(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  get totalProjectCount(): number {
    return this.projectBreakdown.reduce((sum, item) => sum + item.value, 0);
  }

  get pieGradient(): string {
    // use precise fractional percentages to avoid rounding drift
    let start = 0;
    const total = this.totalProjectCount || 1;
    const segments = this.projectBreakdown.map(segment => {
      const percent = (segment.value / total) * 100; // fractional percent
      const end = start + percent;
      // use fixed decimals to ensure valid CSS values
      const slice = `${segment.color} ${start.toFixed(3)}% ${end.toFixed(3)}%`;
      start = end;
      return slice;
    });
    return `conic-gradient(from 0deg, ${segments.join(', ')})`;
  }
}

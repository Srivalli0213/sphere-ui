import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService, NormalizedProject } from '../projects/projects.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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

  constructor(private readonly projectsService: ProjectsService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectsService.getProjects().subscribe({
      next: (projects: NormalizedProject[]) => this.computeMetrics(projects || []),
      error: () => this.computeMetrics([])
    });
  }

  private computeMetrics(projects: NormalizedProject[]): void {
    const total = projects.length;
    const completed = projects.filter(p => (p.status || '').toLowerCase() === 'completed').length;
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

    // ensure view updates
    console.log('[Dashboard] computeMetrics:', { total, completed, inProgress });
    this.cdr.markForCheck();
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

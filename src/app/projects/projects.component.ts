import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

type Project = {
  id: number;
  projectTitle: string;
  type: 'Hackathon Project' | 'Final Project' | 'Other';
  contact: string;
  status: 'completed' | 'in progress' | 'open';
};

type ProjectJson = Partial<Project> & {
  id?: number | string;
  status?: 'completed' | 'in progress' | 'open' | string;
  projectType?: string;
  title?: string;
  email?: string;
};

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  
  projects: Project[] = [];
  loaded = false;
  private readonly minSpinnerMs = 300; // minimum spinner visible time in ms
  private loadingStartedAt = 0;

  constructor(private readonly http: HttpClient, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getKIETProjects();
  }


  private readonly statuses: Project['status'][] = ['completed', 'in progress', 'open'];

  private normalizeProject(project: ProjectJson, index: number): Project {
    const title = project.projectTitle ?? project.title ?? 'Untitled Project';
    const type = this.normalizeProjectType(project.type ?? project.projectType);
    const rawId = project.id;
    const id = rawId != null ? Number(rawId) : index + 1;
    const statusFromJson = project.status as Project['status'] | undefined;
    const status = statusFromJson ?? this.pickRandomStatus(index);

    return {
      id,
      projectTitle: title,
      type,
      contact: project.contact ?? project.email ?? 'contact@example.com',
      status
    };
  }

  private pickRandomStatus(index: number): Project['status'] {
    // deterministic pseudo-random pick based on index
    return this.statuses[index % this.statuses.length];
  }


  private normalizeProjectType(type?: string): Project['type'] {
    if (type === 'Final Project' || type === 'Final Year Project') {
      return 'Final Project';
    }

    if (type === 'Other') {
      return 'Other';
    }

    return 'Hackathon Project';
  }

  getKIETProjects() {
    this.loaded = false;
    this.loadingStartedAt = Date.now();

    this.http.get<ProjectJson[]>('assets/kiet-projects.json').subscribe({
      next: projects => {
        this.projects = projects.map((project, i) => this.normalizeProject(project, i));
        const elapsed = Date.now() - this.loadingStartedAt;
        const remaining = Math.max(0, this.minSpinnerMs - elapsed);
        setTimeout(() => { this.loaded = true; this.cdr.markForCheck(); }, remaining);
      },
      error: () => {
        this.projects = [];
        const elapsed = Date.now() - this.loadingStartedAt;
        const remaining = Math.max(0, this.minSpinnerMs - elapsed);
        setTimeout(() => { this.loaded = true; this.cdr.markForCheck(); }, remaining);
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectsService, NormalizedProject } from './projects.service';

type Project = {
  id: number;
  projectTitle: string;
  type: 'Hackathon Project' | 'Final Project' | 'Other';
  contact: string;
  status: 'completed' | 'in progress' | 'open';
  startDate?: string | null;
  deadline?: string | null;
  studentGroup?: string | null;
  rating?: number;
};

type ProjectJson = {
  id?: number | string;
  projectTitle?: string;
  type?: string;
  status?: string;
  projectType?: string;
  title?: string;
  contact?: string;
  email?: string;
  startDate?: string | null;
  deadline?: string | null;
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
  private allProjects: Project[] = [];
  loaded = false;
  private readonly minSpinnerMs = 300; // minimum spinner visible time in ms
  private loadingStartedAt = 0;

  constructor(private readonly projectsService: ProjectsService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getKIETProjects();
  }

  getKIETProjects() {
    this.loaded = false;
    this.loadingStartedAt = Date.now();

    this.projectsService.getProjects().subscribe({
      next: (projects: NormalizedProject[]) => {
        // service returns NormalizedProject[]; map each to internal Project via normalizeProject
        this.allProjects = projects.map((project: any, i: number) => this.normalizeProject(project as ProjectJson, i));
        this.projects = [...this.allProjects];
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

  private readonly statuses: Project['status'][] = ['completed', 'in progress', 'open'];

  applyFilter(event: Event) {
    const q = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (!q) {
      this.projects = [...this.allProjects];
      return;
    }
    this.projects = this.allProjects.filter(p => {
      return (`${p.projectTitle} ${p.contact} ${p.type}`.toLowerCase()).includes(q);
    });
  }

  /**
   * Prompt for a new project title and add a simple project entry locally.
   * This keeps behavior minimal: it updates the displayed list immediately.
   * Integrate with backend creation flow later as needed.
   */
  addProject() {
    const title = prompt('Enter project title');
    if (!title) return;

    const newId = this.allProjects.length ? Math.max(...this.allProjects.map(p => Number(p.id))) + 1 : 1;
    const newProject: Project = {
      id: Number(newId),
      projectTitle: title,
      type: 'Other',
      contact: 'contact@example.com',
      status: 'open',
      startDate: null,
      deadline: null,
      studentGroup: '1Y -2020-2024',
      rating: 1
    };

    // prepend so user sees the created project first
    this.allProjects = [newProject, ...this.allProjects];
    this.projects = [newProject, ...this.projects];
    // ensure change detection updates view
    this.cdr.markForCheck();
  }

  private normalizeProject(project: ProjectJson, index: number): Project {
    const title = project.projectTitle ?? project.title ?? 'Untitled Project';
    const type = this.normalizeProjectType(project.type ?? project.projectType);
    const rawId = project.id;
    const id = rawId != null ? Number(rawId) : index + 1;
    const statusFromJson = project.status as Project['status'] | undefined;
    const status = statusFromJson ?? this.pickRandomStatus(index);

    // derive student group from startDate using requested cohort labels
    let studentGroup: string | null = null;
    if (project.startDate) {
      const y = new Date(project.startDate).getFullYear();
      if (!isNaN(y)) {
        const cohortStart = 2020 + Math.floor((y - 2020) / 4) * 4;
        let index = Math.floor((cohortStart - 2020) / 4) + 1;
        if (index < 1) index = 1;
        if (index > 4) index = ((index - 1) % 4) + 1;
        const bucketStarts = [2020, 2024, 2028, 2032];
        const start = bucketStarts[index - 1];
        studentGroup = `${index}Y -${start}-${start + 4}`;
      }
    }

    if (!studentGroup) studentGroup = '1Y -2020-2024';

    // compute rating from status: completed->5, in progress->3, open->1
    let rating = 1;
    const s = (status || '').toLowerCase();
    if (s === 'completed') rating = 5;
    else if (s === 'in progress') rating = 3;
    else rating = 1;

    return {
      id,
      projectTitle: title,
      type,
      contact: project.contact ?? project.email ?? 'contact@example.com',
      status,
      startDate: project.startDate ?? null,
      deadline: project.deadline ?? null,
      studentGroup,
      rating
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

}

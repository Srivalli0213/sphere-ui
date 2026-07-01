import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type NormalizedProject = {
  id: number;
  projectTitle: string;
  type: string;
  contact: string;
  status: string;
  startDate?: string | null;
  deadline?: string | null;
  studentGroup?: string | null;
  rating?: number;
};

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly LOCAL_STORAGE_KEY = 'sphere-ui-added-projects';

  constructor(private readonly http: HttpClient) {}

  getProjects(): Observable<NormalizedProject[]> {
    return this.http.get<any[]>('assets/kiet-projects.json').pipe(
      map(list => {
        const baseProjects = (list || []).map((p, i) => this.normalizeProject(p, i));
        const addedProjects = this.getAddedProjectsFromStorage();
        return [...baseProjects, ...addedProjects];
      })
    );
  }

  addProjectToStorage(project: NormalizedProject): void {
    const added = this.getAddedProjectsFromStorage();
    added.push(project);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(added));

    // attempt to persist to local API which updates src/assets/kiet-projects.json
    // the API is optional; if it's not running the app continues to work with localStorage
    try {
      this.http.post('http://localhost:3001/api/projects', project).subscribe({
        next: () => console.log('Project persisted to local JSON via API'),
        error: (err) => console.warn('Could not persist project to API:', err?.message || err)
      });
    } catch (e) {
      // swallow errors - persistence to local JSON is best-effort
      console.warn('Failed to POST project to API', e);
    }
  }

  private getAddedProjectsFromStorage(): NormalizedProject[] {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private normalizeProject(p: any, i: number): NormalizedProject {
    const id = p.id != null ? Number(p.id) : i + 1;
    const title = p.projectTitle ?? p.title ?? 'Untitled Project';
    const type = p.type ?? p.projectType ?? 'Hackathon Project';
    const contact = p.contact ?? p.email ?? 'contact@example.com';
    const status = (p.status ?? 'open').toString();

    // derive studentGroup from startDate year if available
    let studentGroup: string | null = null;
    if (p.startDate) {
      const y = new Date(p.startDate).getFullYear();
      if (!isNaN(y)) {
        // compute cohort bins starting at 2020 with 4-year windows
        const cohortStart = 2020 + Math.floor((y - 2020) / 4) * 4;
        let index = Math.floor((cohortStart - 2020) / 4) + 1; // 1-based Y label
        // clamp index between 1 and 4
        if (index < 1) index = 1;
        if (index > 4) index = ((index - 1) % 4) + 1;
        // map to student group labels
        const studentGroupLabels = ['Freshers', 'Second years', 'Third years', 'Final years'];
        studentGroup = studentGroupLabels[index - 1];
      }
    }

    // ensure a default group when studentGroup is not determined
    if (!studentGroup) studentGroup = 'Freshers';

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
      contact,
      status,
      startDate: p.startDate ?? null,
      deadline: p.deadline ?? null,
      studentGroup,
      rating
    };
  }
}

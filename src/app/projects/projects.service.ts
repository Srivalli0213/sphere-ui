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
  constructor(private readonly http: HttpClient) {}

  getProjects(): Observable<NormalizedProject[]> {
    return this.http.get<any[]>('assets/kiet-projects.json').pipe(
      map(list => (list || []).map((p, i) => this.normalizeProject(p, i)))
    );
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
        // map to fixed buckets starting at 2020, 2024, 2028, 2032
        const bucketStarts = [2020, 2024, 2028, 2032];
        const start = bucketStarts[index - 1];
        studentGroup = `${index}Y -${start}-${start + 4}`;
      }
    }

    // ensure a default bucket when studentGroup is not determined
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
      contact,
      status,
      startDate: p.startDate ?? null,
      deadline: p.deadline ?? null,
      studentGroup,
      rating
    };
  }
}

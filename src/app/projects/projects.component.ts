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

type NewProjectForm = {
  projectTitle: string;
  type: 'Hackathon Project' | 'Final Project' | 'Other';
  status: 'completed' | 'in progress' | 'open';
  contact: string;
  studentGroup: string;
  startDate: string | null;
  deadline: string | null;
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
  private readonly minSpinnerMs = 300;
  private loadingStartedAt = 0;

  showAddProjectModal = false;
  newProjectForm: NewProjectForm = {
   projectTitle: '',
   type: 'Hackathon Project',
   status: 'open',
   contact: '',
   studentGroup: 'Freshers',
   startDate: null,
   deadline: null
  };

  constructor(private readonly projectsService: ProjectsService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
   this.getKIETProjects();
  }

  getKIETProjects() {
   this.loaded = false;
   this.loadingStartedAt = Date.now();

   this.projectsService.getProjects().subscribe({
     next: (projects: NormalizedProject[]) => {
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

  addProject() {
   this.showAddProjectModal = true;
  }

  exportProjects() {
   this.projectsService.exportProjectsToJson();
  }

  closeAddProjectModal() {
   this.showAddProjectModal = false;
   this.resetForm();
  }

  submitAddProject() {
   if (!this.newProjectForm.projectTitle.trim() || !this.newProjectForm.contact.trim()) {
     alert('Please fill in all required fields');
     return;
   }

   const newId = this.allProjects.length ? Math.max(...this.allProjects.map(p => Number(p.id))) + 1 : 1;
   const newProject: Project = {
     id: Number(newId),
     projectTitle: this.newProjectForm.projectTitle,
     type: this.newProjectForm.type,
     contact: this.newProjectForm.contact,
     status: this.newProjectForm.status,
     startDate: this.newProjectForm.startDate,
     deadline: this.newProjectForm.deadline,
     studentGroup: this.newProjectForm.studentGroup,
     rating: this.computeRating(this.newProjectForm.status)
   };

   this.allProjects = [...this.allProjects, newProject];
   this.projects = [...this.projects, newProject];
    
   this.projectsService.addProjectToStorage(newProject);
    
   this.closeAddProjectModal();
   this.cdr.markForCheck();
  }

  private resetForm() {
   this.newProjectForm = {
     projectTitle: '',
     type: 'Hackathon Project',
     status: 'open',
     contact: '',
     studentGroup: 'Freshers',
     startDate: null,
     deadline: null
   };
  }

  private computeRating(status: Project['status']): number {
   const s = (status || '').toLowerCase();
   if (s === 'completed') return 5;
   if (s === 'in progress') return 3;
   return 1;
  }

  private normalizeProject(project: ProjectJson, index: number): Project {
   const title = project.projectTitle ?? project.title ?? 'Untitled Project';
   const type = this.normalizeProjectType(project.type ?? project.projectType);
   const rawId = project.id;
   const id = rawId != null ? Number(rawId) : index + 1;
   const statusFromJson = project.status as Project['status'] | undefined;
   const status = statusFromJson ?? this.pickRandomStatus(index);

   let studentGroup: string | null = null;
   if (project.startDate) {
     const y = new Date(project.startDate).getFullYear();
     if (!isNaN(y)) {
       const cohortStart = 2020 + Math.floor((y - 2020) / 4) * 4;
       let index = Math.floor((cohortStart - 2020) / 4) + 1;
       if (index < 1) index = 1;
       if (index > 4) index = ((index - 1) % 4) + 1;
       const studentGroupLabels = ['Freshers', 'Second years', 'Third years', 'Final years'];
       studentGroup = studentGroupLabels[index - 1];
     }
   }

   if (!studentGroup) studentGroup = 'Freshers';

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

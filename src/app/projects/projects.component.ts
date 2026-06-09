import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

type Project = {
  projectTitle: string;
  type: 'Hackathon Project' | 'Final Project' | 'Other';
  contact: string;
};

type ProjectJson = Partial<Project> & {
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
  projectTypeOptions: Project['type'][] = ['Hackathon Project', 'Final Project', 'Other'];
  projects: Project[] = this.defaultProjects;
  loaded = true;

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<ProjectJson[]>('/projects.json').subscribe({
      next: projects => {
        this.projects = projects.map(project => this.normalizeProject(project));
        this.loaded = true;
      },
      error: () => {
        this.projects = this.defaultProjects;
        this.loaded = true;
      }
    });
  }

  private get defaultProjects(): Project[] {
    return [
      { projectTitle: 'Campus Event Planner', type: 'Hackathon Project', contact: 'aarav.sharma@gmail.com' },
      { projectTitle: 'Student Result Portal', type: 'Final Project', contact: 'priya.nair@gmail.com' },
      { projectTitle: 'Library Book Tracker', type: 'Other', contact: 'rohan.mehta@gmail.com' },
      { projectTitle: 'Smart Attendance System', type: 'Hackathon Project', contact: 'ananya.rao@gmail.com' },
      { projectTitle: 'Online Feedback App', type: 'Final Project', contact: 'karthik.iyer@gmail.com' }
    ];
  }

  private normalizeProject(project: ProjectJson): Project {
    const type = this.normalizeProjectType(project.type ?? project.projectType);

    return {
      projectTitle: project.projectTitle ?? project.title ?? 'Untitled Project',
      type,
      contact: project.contact ?? project.email ?? 'contact@example.com'
    };
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

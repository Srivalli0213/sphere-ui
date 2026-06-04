import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

type Project = {
  studentId: string;
  studentName: string;
  type: 'Hackathon Project' | 'Final Project' | 'Other';
  contact: string;
};

type ProjectJson = Partial<Project> & {
  studentid?: string;
  studentname?: string;
  projectType?: string;
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
      { studentName: 'Aarav Sharma', studentId: 'STU001', type: 'Hackathon Project', contact: 'aarav.sharma@gmail.com' },
      { studentName: 'Priya Nair', studentId: 'STU002', type: 'Final Project', contact: 'priya.nair@gmail.com' },
      { studentName: 'Rohan Mehta', studentId: 'STU003', type: 'Other', contact: 'rohan.mehta@gmail.com' },
      { studentName: 'Ananya Rao', studentId: 'STU004', type: 'Hackathon Project', contact: 'ananya.rao@gmail.com' },
      { studentName: 'Karthik Iyer', studentId: 'STU005', type: 'Final Project', contact: 'karthik.iyer@gmail.com' }
    ];
  }

  private normalizeProject(project: ProjectJson): Project {
    const type = this.normalizeProjectType(project.type ?? project.projectType);
    const studentName = project.studentName ?? project.studentname ?? '';

    return {
      studentId: project.studentId ?? project.studentid ?? '',
      studentName,
      type,
      contact: project.contact ?? project.email ?? this.createGmailAddress(studentName)
    };
  }

  private createGmailAddress(studentName: string): string {
    const username = studentName.trim().toLowerCase().replace(/\s+/g, '.');
    return `${username || 'student'}@gmail.com`;
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

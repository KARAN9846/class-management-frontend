import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TeacherAssignmentService } from '../services/teacher-assignment.service';
import { TeacherAssignment } from '../models/teacher-assignment.model';

@Component({
  selector: 'app-teacher-assignment-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-assignment-view.html',
  styleUrl: './teacher-assignment-view.scss'
})
export class TeacherAssignmentView implements OnInit {

  private readonly service = inject(TeacherAssignmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  assignment: TeacherAssignment | null = null;

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid teacher assignment.';
      return;
    }

    this.loadAssignment(id);
  }

  loadAssignment(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getById(id).subscribe({
      next: response => {
        this.assignment = response.data ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load teacher assignment:', error);

        this.assignment = null;
        this.loading = false;
        this.errorMessage =
          error?.error?.message ||
          'Failed to load teacher assignment. Please try again.';

        this.cdr.detectChanges();
      }
    });
  }

  edit(): void {
    if (!this.assignment) {
      return;
    }

    this.router.navigate([
      '/admin/teacher-assignments',
      this.assignment.id,
      'edit'
    ]);
  }

  back(): void {
    this.router.navigate(['/admin/teacher-assignments']);
  }
}
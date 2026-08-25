import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherService } from '../services/teacher.service';
import { Teacher } from '../models/teacher.model';

@Component({
  selector: 'app-teacher-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-details.html',
  styleUrl: './teacher-details.scss'
})
export class TeacherDetails implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teacherService = inject(TeacherService);
  private readonly cdr = inject(ChangeDetectorRef);

  teacher: Teacher | null = null;

  loading = false;
  errorMessage = '';

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid teacher ID';
      return;
    }

    this.loadTeacher(id);
  }

  loadTeacher(id: number): void {

    this.loading = true;
    this.errorMessage = '';

    this.teacherService
      .getTeacherById(id)
      .subscribe({

        next: (response: any) => {

          this.teacher = response.data;
          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to load teacher details';

          this.loading = false;

          this.cdr.detectChanges();
        }

      });
  }

  editTeacher(): void {

    if (!this.teacher) {
      return;
    }

    this.router.navigate([
      '/admin/teachers',
      this.teacher.id,
      'edit'
    ]);
  }

  goBack(): void {

    this.router.navigate(['/admin/teachers']);
  }

}

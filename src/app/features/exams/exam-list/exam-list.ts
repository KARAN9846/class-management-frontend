import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { PermissionService } from '../../../core/auth/permission.service';
import { ExamService } from '../services/exam.service';
import { Exam, ExamStatus } from '../models/exam.model';
import { ExamHeroComponent } from '../shared/exam-hero/exam-hero';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ExamHeroComponent],
  templateUrl: './exam-list.html',
  styleUrl: './exam-list.scss'
})
export class ExamListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);
  private readonly permissions = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly role = this.route.snapshot.data['examRole'] as 'ADMIN' | 'TEACHER';
  readonly baseRoute = this.role === 'ADMIN' ? '/admin/exams' : '/teacher/exams';

  exams: Exam[] = [];
  searchTerm = '';
  selectedStatus: ExamStatus | '' = '';
  loading = false;
  busyExamId: number | null = null;
  errorMessage = '';

  page = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    this.loadExams();
  }

  get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  get canCreate(): boolean {
    return this.isAdmin || this.permissions.hasPermission('EXAM_CREATE');
  }

  get canEdit(): boolean {
    return this.isAdmin || this.permissions.hasPermission('EXAM_EDIT');
  }

  get canPublish(): boolean {
    return this.isAdmin || this.permissions.hasPermission('EXAM_PUBLISH');
  }

  loadExams(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters = {
      search: this.searchTerm.trim() || undefined,
      status: this.selectedStatus || undefined,
      page: this.page,
      size: this.pageSize,
      sortBy: 'examDate',
      sortDirection: 'desc' as const
    };

    const request$ = this.isAdmin
      ? this.examService.getAdminExams(filters)
      : this.examService.getTeacherExams(filters);

    request$.subscribe({
      next: response => {
        const result = response.data;
        this.exams = result?.content ?? [];
        this.totalPages = result?.totalPages ?? 0;
        this.totalElements = result?.totalElements ?? 0;
        this.page = result?.number ?? this.page;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        this.exams = [];
        this.errorMessage =
          error?.error?.message || 'Could not load exams. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  search(): void {
    this.page = 0;
    this.loadExams();
  }

  changeStatus(status: ExamStatus | ''): void {
    this.selectedStatus = status;
    this.page = 0;
    this.loadExams();
  }

  goToPage(nextPage: number): void {
    if (nextPage < 0 || nextPage >= this.totalPages) {
      return;
    }
    this.page = nextPage;
    this.loadExams();
  }

  createExam(): void {
    this.router.navigate([this.baseRoute, 'create']);
  }

  get canManageMarks(): boolean {
    return this.isAdmin || this.permissions.hasPermission('EXAM_MARKS_MANAGE');
  }

  manageMarks(exam: Exam): void {
    if (exam.status !== 'PUBLISHED' || !this.canManageMarks) {
      return;
    }
    this.router.navigate([this.baseRoute, exam.id, 'marks']);
  }

  editExam(exam: Exam): void {
    if (exam.status !== 'DRAFT' || !this.canEdit) {
      return;
    }
    this.router.navigate([this.baseRoute, exam.id, 'edit']);
  }

  publishExam(exam: Exam): void {
    if (exam.status !== 'DRAFT' || !this.canPublish || this.busyExamId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Publish "${exam.title}"? This freezes the candidate roster for this exam.`
    );
    if (!confirmed) {
      return;
    }

    this.busyExamId = exam.id;
    this.errorMessage = '';

    const request$ = this.isAdmin
      ? this.examService.publishAdminExam(exam.id)
      : this.examService.publishTeacherExam(exam.id);

    request$.subscribe({
      next: () => {
        this.busyExamId = null;
        this.loadExams();
      },
      error: error => {
        this.errorMessage =
          error?.error?.message || 'Could not publish the exam.';
        this.busyExamId = null;
        this.cdr.markForCheck();
      }
    });
  }

  deleteExam(exam: Exam): void {
    if (exam.status !== 'DRAFT' || !this.canEdit || this.busyExamId !== null) {
      return;
    }

    if (!window.confirm(`Delete draft exam "${exam.title}"?`)) {
      return;
    }

    this.busyExamId = exam.id;
    this.errorMessage = '';

    const request$ = this.isAdmin
      ? this.examService.deleteAdminExam(exam.id)
      : this.examService.deleteTeacherExam(exam.id);

    request$.subscribe({
      next: () => {
        this.busyExamId = null;
        if (this.exams.length === 1 && this.page > 0) {
          this.page--;
        }
        this.loadExams();
      },
      error: error => {
        this.errorMessage =
          error?.error?.message || 'Could not delete the exam.';
        this.busyExamId = null;
        this.cdr.markForCheck();
      }
    });
  }

  trackExam(_: number, exam: Exam): number {
    return exam.id;
  }
}

import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import { GlobalSearchService } from '../../../core/services/global-search.service';

import { GlobalSearchStudentQuickView } from '../global-search/global-search.models';

import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-student-quick-view',
  standalone: true,
  templateUrl: './student-quick-view.component.html',
  styleUrl: './student-quick-view.component.scss'
})
export class StudentQuickViewComponent implements OnChanges {

  // =========================================================
  // INPUTS
  // =========================================================

  @Input()
  studentId: number | null = null;


  // =========================================================
  // OUTPUTS
  // =========================================================

  @Output()
  closed = new EventEmitter<void>();

@Output() openStudent = new EventEmitter<number>();


  // =========================================================
  // SERVICES
  // =========================================================

  private readonly searchService =
    inject(GlobalSearchService);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // STATE
  // =========================================================

  student:
    GlobalSearchStudentQuickView | null = null;

  loading = false;

  private requestId = 0;


  // =========================================================
  // INPUT CHANGE
  // =========================================================

  ngOnChanges(): void {

    if (!this.studentId) {

      this.student = null;

      this.loading = false;

      return;
    }

    this.loadStudent(
      this.studentId
    );

  }


  // =========================================================
  // LOAD STUDENT
  // =========================================================

  private loadStudent(
    studentId: number
  ): void {

    const currentRequestId =
      ++this.requestId;


    this.student = null;

    this.loading = true;

    this.cdr.detectChanges();


    this.searchService
      .getStudentQuickView(studentId)
      .pipe(

        takeUntilDestroyed(
          this.destroyRef
        ),

        finalize(() => {

          if (
            currentRequestId !==
            this.requestId
          ) {
            return;
          }

          this.loading = false;

          this.cdr.detectChanges();

        })

      )
      .subscribe({

        next: student => {

          if (
            currentRequestId !==
            this.requestId
          ) {
            return;
          }

          this.student =
            student;

          this.cdr.detectChanges();

        },

        error: error => {

          if (
            currentRequestId !==
            this.requestId
          ) {
            return;
          }

          console.error(
            'Student quick view failed:',
            error
          );

          this.student = null;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // CLOSE
  // =========================================================

  close(): void {

    ++this.requestId;

    this.student = null;

    this.loading = false;

    this.closed.emit();

  }


  // =========================================================
  // OPEN STUDENT
  // =========================================================

open(): void {
  if (!this.studentId) return;
  this.openStudent.emit(this.studentId);
}


  // =========================================================
  // ESCAPE
  // =========================================================

  @HostListener(
    'document:keydown.escape'
  )
  onEscape(): void {

    if (
      this.studentId ||
      this.loading
    ) {

      this.close();

    }

  }

}
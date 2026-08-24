import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AcademicYearService } from './services/academic-year.service';

import {
  AcademicYear,
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest
} from './academic-year.model';

@Component({
  selector: 'app-academic-years',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './academic-years.html',
  styleUrl: './academic-years.scss'
})
export class AcademicYearsComponent implements OnInit {

  private readonly academicYearService = inject(AcademicYearService);
  private readonly cdr = inject(ChangeDetectorRef);

  searchTerm = '';

  statusFilter: 'ALL' | 'ACTIVE' | 'CLOSED' = 'ALL';

  showForm = false;

  editingYear: AcademicYear | null = null;

  academicYears: AcademicYear[] = [];

  loading = false;

  saving = false;

  errorMessage = '';

  form = {
    name: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'CLOSED'
  };


  // =========================
  // INITIAL LOAD
  // =========================

  ngOnInit(): void {
    this.loadAcademicYears();
  }


  // =========================
  // LOAD
  // =========================

  loadAcademicYears(): void {

    this.loading = true;

    this.errorMessage = '';

    this.academicYearService.getAll().subscribe({

      next: (response) => {

        this.academicYears = response.data.content;

        this.loading = false;

        this.cdr.markForCheck();

      },

      error: (error) => {

        console.error('Failed to load academic years:', error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to load academic years.';

        this.loading = false;

        this.cdr.markForCheck();

      }

    });
  }


  // =========================
  // FILTER
  // =========================

  get filteredYears(): AcademicYear[] {
  return this.academicYears.filter(year => {

    const matchesSearch =
      year.name
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

    const status =
      year.isActive ? 'ACTIVE' : 'CLOSED';

    const matchesStatus =
      this.statusFilter === 'ALL' ||
      status === this.statusFilter;

    return matchesSearch && matchesStatus;
  });
}


  // =========================
  // FORM
  // =========================

  openAddForm(): void {

    this.editingYear = null;

    this.form = {

      name: '',

      startDate: '',

      endDate: '',

      status: 'ACTIVE'

    };

    this.showForm = true;

  }


  openEditForm(year: AcademicYear): void {

    this.editingYear = year;

    this.form = {

      name: year.name,

      startDate: year.startDate,

      endDate: year.endDate,

      status: year.isActive
        ? 'ACTIVE'
        : 'CLOSED'

    };

    this.showForm = true;

  }


  closeForm(): void {

    this.showForm = false;

    this.editingYear = null;

  }


  // =========================
  // SAVE
  // =========================

  saveYear(): void {

    if (

      !this.form.name ||

      !this.form.startDate ||

      !this.form.endDate

    ) {

      return;

    }


    this.saving = true;

    this.errorMessage = '';


    // UPDATE

    if (this.editingYear) {

      const request: UpdateAcademicYearRequest = {

        name: this.form.name,

        startDate: this.form.startDate,

        endDate: this.form.endDate,

        isActive:
          this.form.status === 'ACTIVE'

      };


      this.academicYearService

        .update(this.editingYear.id, request)

        .subscribe({

          next: () => {

            this.saving = false;

            this.closeForm();

            this.loadAcademicYears();

          },

          error: (error) => {

            console.error(
              'Failed to update academic year:',
              error
            );

            this.errorMessage =
              error?.error?.message ||
              'Failed to update academic year.';

            this.saving = false;

            this.cdr.markForCheck();

          }

        });


      return;

    }


    // CREATE

    const request: CreateAcademicYearRequest = {

      name: this.form.name,

      startDate: this.form.startDate,

      endDate: this.form.endDate

    };


    this.academicYearService

      .create(request)

      .subscribe({

        next: () => {

          this.saving = false;

          this.closeForm();

          this.loadAcademicYears();

        },

        error: (error) => {

          console.error(
            'Failed to create academic year:',
            error
          );

            this.errorMessage =
              error?.error?.message ||
              'Failed to create academic year.';

            this.saving = false;

            this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // SET CURRENT
  // =========================

  setCurrent(year: AcademicYear): void {

    if (year.isCurrent) {
      return;
    }


    this.academicYearService

      .setCurrent(year.id)

      .subscribe({

        next: () => {

          this.loadAcademicYears();

        },

        error: (error) => {

          console.error(
            'Failed to set current academic year:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to set current academic year.';

          this.cdr.markForCheck();

        }

      });

  }


  // =========================
  // DELETE
  // =========================

  deleteYear(year: AcademicYear): void {

    if (!window.confirm(`Delete academic year "${year.name}"?`)) {
      return;
    }


    this.errorMessage = '';


    this.academicYearService

      .delete(year.id)

      .subscribe({

        next: () => {

          this.loadAcademicYears();

        },

        error: (error) => {

          console.error(
            'Failed to delete academic year:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete academic year.';

          this.cdr.markForCheck();

        }

      });

  }

}

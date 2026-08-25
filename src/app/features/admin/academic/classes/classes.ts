import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AcademicClass } from './class.model';
import { Section, CreateSectionRequest } from './section.model';
import { ClassService } from './class.service';
import { SectionService } from './section.service';
import { AcademicYearService } from '../academic-years/services/academic-year.service';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    SearchInputComponent
  ],
  templateUrl: './classes.html',
  styleUrl: './classes.scss'
})
export class ClassesComponent implements OnInit {
  private readonly classService = inject(ClassService);
  private readonly sectionService = inject(SectionService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly cdr = inject(ChangeDetectorRef);

  searchTerm = '';
  academicYearFilter: number | 'ALL' = 'ALL';

  academicYears: { id: number; name: string }[] = [];
  classes: AcademicClass[] = [];

  loading = false;
  saving = false;
  errorMessage = '';

  showForm = false;
  editingClass: AcademicClass | null = null;

  showSectionForm = false;
  editingSection: Section | null = null;
  selectedClass: AcademicClass | null = null;

  form = {
    name: '',
    academicYearId: 0
  };

  sectionForm: CreateSectionRequest = {
    classId: 0,
    name: ''
  };

  ngOnInit(): void {
    this.loadClasses();
  }

  onSearch(value: string): void {
    this.searchTerm = value;
  }

  get filteredClasses(): AcademicClass[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.classes.filter(cls => {
      const matchesSearch =
        !search || cls.name.toLowerCase().includes(search);

      const matchesYear =
        this.academicYearFilter === 'ALL' ||
        cls.academicYearId === this.academicYearFilter;

      return matchesSearch && matchesYear;
    });
  }

  loadClasses(): void {
    this.loading = true;
    this.errorMessage = '';

    this.academicYearService.getAll().subscribe({
      next: yearsResponse => {
        this.academicYears = yearsResponse.data.content.map(year => ({
          id: year.id,
          name: year.name
        }));

        this.classService.getClasses().subscribe({
          next: classesResponse => {
            this.classes = classesResponse.data.map(cls => {
              const year = yearsResponse.data.content.find(
                y => y.id === cls.academicYearId
              );

              return {
                ...cls,
                academicYear: year?.name ?? '',
                sections: []
              };
            });

            this.loadSections();
          },
          error: error => {
            console.error('Failed to load classes:', error);
            this.errorMessage =
              error?.error?.message || 'Failed to load classes.';
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: error => {
        console.error('Failed to load academic years:', error);
        this.errorMessage =
          error?.error?.message || 'Failed to load academic years.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadSections(): void {
    if (!this.classes.length) {
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    const requests = this.classes.map(cls =>
      this.sectionService.getSections(cls.id)
    );

    forkJoin(requests).subscribe({
      next: responses => {
        this.classes = this.classes.map((cls, index) => ({
          ...cls,
          sections: responses[index].data
        }));

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to load sections:', error);
        this.errorMessage =
          error?.error?.message || 'Failed to load sections.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openAddForm(): void {
    this.editingClass = null;
    this.form = {
      name: '',
      academicYearId: this.academicYears[0]?.id ?? 0
    };
    this.showForm = true;
  }

  openEditForm(cls: AcademicClass): void {
    this.editingClass = cls;
    this.form = {
      name: cls.name,
      academicYearId: cls.academicYearId
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingClass = null;
  }

  saveClass(): void {
    const name = this.form.name.trim();

    if (!name || !this.form.academicYearId) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const request = {
      name,
      academicYearId: this.form.academicYearId
    };

    if (this.editingClass) {
      this.classService.updateClass(
        this.editingClass.id,
        request
      ).subscribe({
        next: () => {
          this.saving = false;
          this.closeForm();
          this.loadClasses();
        },
        error: error => {
          console.error('Failed to update class:', error);
          this.errorMessage =
            error?.error?.message || 'Failed to update class.';
          this.saving = false;
          this.cdr.markForCheck();
        }
      });

      return;
    }

    this.classService.createClass(request).subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.loadClasses();
      },
      error: error => {
        console.error('Failed to create class:', error);
        this.errorMessage =
          error?.error?.message || 'Failed to create class.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteClass(cls: AcademicClass): void {
    if (!confirm(`Delete ${cls.name}?`)) {
      return;
    }

    this.errorMessage = '';

    this.classService.deleteClass(cls.id).subscribe({
      next: () => {
        this.loadClasses();
      },
      error: error => {
        console.error('Failed to delete class:', error);
        this.errorMessage =
          error?.error?.message || 'Failed to delete class.';
        this.cdr.markForCheck();
      }
    });
  }

  openAddSectionForm(cls: AcademicClass): void {
    this.selectedClass = cls;
    this.editingSection = null;
    this.sectionForm = {
      classId: cls.id,
      name: ''
    };
    this.showSectionForm = true;
  }

  openEditSectionForm(section: Section): void {
    this.selectedClass =
      this.classes.find(cls => cls.id === section.classId) ?? null;

    this.editingSection = section;
    this.sectionForm = {
      classId: section.classId,
      name: section.name
    };
    this.showSectionForm = true;
  }

  closeSectionForm(): void {
    this.showSectionForm = false;
    this.editingSection = null;
    this.selectedClass = null;
  }

  saveSection(): void {
    const name = this.sectionForm.name.trim();

    if (!name || !this.sectionForm.classId) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const request: CreateSectionRequest = {
      classId: this.sectionForm.classId,
      name
    };

    if (this.editingSection) {
      this.sectionService.updateSection(
        this.editingSection.id,
        request
      ).subscribe({
        next: () => {
          this.saving = false;
          this.closeSectionForm();
          this.loadClasses();
        },
        error: error => {
          console.error('Failed to update section:', error);
          this.errorMessage =
            error?.error?.message || 'Failed to update section.';
          this.saving = false;
          this.cdr.markForCheck();
        }
      });

      return;
    }

    this.sectionService.createSection(request).subscribe({
      next: () => {
        this.saving = false;
        this.closeSectionForm();
        this.loadClasses();
      },
      error: error => {
        console.error('Failed to create section:', error);
        this.errorMessage =
          error?.error?.message || 'Failed to create section.';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteSection(section: Section): void {
    if (!confirm(`Delete section ${section.name}?`)) {
      return;
    }

    this.errorMessage = '';

    this.sectionService.deleteSection(section.id).subscribe({
      next: () => {
        this.loadClasses();
      },
      error: error => {
        console.error('Failed to delete section:', error);
        this.errorMessage =
          error?.error?.message || 'Failed to delete section.';
        this.cdr.markForCheck();
      }
    });
  }
}
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  DataTableComponent,
  TableAction,
  TableColumn
} from '../../../../shared/components/data-table/data-table.component';

import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

import {
  School,
  CreateSchoolRequest,
  UpdateSchoolRequest
} from './school.model';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { SchoolService } from './services/school.service';

@Component({
  selector: 'app-school',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    SearchInputComponent,
    PageHeaderComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './school.html',
  styleUrl: './school.scss'
})
export class SchoolComponent implements OnInit {

  private readonly schoolService = inject(SchoolService);
  private readonly cdr = inject(ChangeDetectorRef);

  /* TABLE CONFIG */

  columns: TableColumn[] = [
    { key: 'name', label: 'School' },
    { key: 'code', label: 'Code' },
    { key: 'address', label: 'Address' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'isActive', label: 'Status', type: 'status' }
  ];

  actions: TableAction[] = [
    { label: 'Edit', type: 'edit' },
    { label: 'Delete', type: 'delete', danger: true }
  ];

  /* STATE */

  searchTerm = '';

  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'CODE_ASC' | 'CODE_DESC' = 'NAME_ASC';

  showForm = false;

  editingSchool: School | null = null;

  schools: School[] = [];

  loading = false;

  saving = false;

  errorMessage = '';

  /* DELETE CONFIRMATION */

  showDeleteDialog = false;

  schoolToDelete: School | null = null;

  /* FORM */

  form = {
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  };

  /* INIT */

  ngOnInit(): void {
    this.loadSchools();
  }

  /* SEARCH */

  onSearch(value: string): void {
    this.searchTerm = value;
  }

  /* LOAD */

  loadSchools(): void {

    this.loading = true;
    this.errorMessage = '';

    this.schoolService.getAll().subscribe({
      next: (response) => {

        this.schools = response.data.content;

        this.loading = false;

        this.cdr.markForCheck();
      },

      error: (error) => {

        console.error(error);

        this.errorMessage =
          error?.error?.message || 'Failed to load schools.';

        this.loading = false;

        this.cdr.markForCheck();
      }
    });
  }

  /* FILTER */

get filteredSchools(): School[] {

  const search = this.searchTerm
    .toLowerCase()
    .trim();

  const filtered = this.schools.filter(school => {

    const searchMatch =
      !search ||
      school.name.toLowerCase().includes(search) ||
      (school.code ?? '').toLowerCase().includes(search) ||
      (school.email ?? '').toLowerCase().includes(search) ||
      (school.phone ?? '').toLowerCase().includes(search);

    const status =
      school.isActive ? 'ACTIVE' : 'INACTIVE';

    const statusMatch =
      this.statusFilter === 'ALL' ||
      status === this.statusFilter;

    return searchMatch && statusMatch;
  });

  return [...filtered].sort((a, b) => {

    switch (this.sortBy) {

      case 'NAME_DESC':
        return b.name.localeCompare(a.name);

      case 'CODE_ASC':
        return (a.code ?? '').localeCompare(b.code ?? '');

      case 'CODE_DESC':
        return (b.code ?? '').localeCompare(a.code ?? '');

      case 'NAME_ASC':
      default:
        return a.name.localeCompare(b.name);
    }
  });
}

  /* DOWNLOAD PDF */

  downloadSchoolsPdf(): void {

    const schools = this.filteredSchools;

    if (!schools.length) {
      return;
    }

    const doc = new jsPDF('landscape');

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('School List', 14, 18);

    // Generated date
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text(
      `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
      14,
      25
    );

    // Active filters
    const filterText = [
      this.searchTerm
        ? `Search: ${this.searchTerm}`
        : null,
      this.statusFilter !== 'ALL'
        ? `Status: ${this.statusFilter}`
        : null
    ]
      .filter(Boolean)
      .join(' | ');

    if (filterText) {
      doc.text(filterText, 14, 31);
    }

    // Table
    autoTable(doc, {
      startY: filterText ? 37 : 32,

      head: [[
        'School Name',
        'Code',
        'Address',
        'Phone',
        'Email',
        'Status'
      ]],

      body: schools.map(school => [
        school.name,
        school.code ?? '-',
        school.address ?? '-',
        school.phone ?? '-',
        school.email ?? '-',
        school.isActive ? 'Active' : 'Inactive'
      ]),

      theme: 'grid',

      styles: {
        fontSize: 8,
        cellPadding: 4
      },

      headStyles: {
        fontStyle: 'bold'
      },

      alternateRowStyles: {
        cellPadding: 4
      },

      margin: {
        left: 14,
        right: 14
      }
    });

    // Download
    doc.save(
      `schools-${this.getDownloadDate()}.pdf`
    );
  }


  private getDownloadDate(): string {

    return new Date()
      .toISOString()
      .split('T')[0];
  }



  /* TABLE ACTION */

  onAction(event: any): void {

    const school: School = event.row;

    switch (event.action.type) {

      case 'edit':
        this.openEditForm(school);
        break;

      case 'delete':
        this.deleteSchool(school);
        break;
    }
  }

  /* FORM */

  openAddForm(): void {

    this.editingSchool = null;

    this.form = {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      status: 'ACTIVE'
    };

    this.showForm = true;
  }

  openEditForm(school: School): void {

    this.editingSchool = school;

    this.form = {
      name: school.name,
      code: school.code ?? '',
      address: school.address ?? '',
      phone: school.phone ?? '',
      email: school.email ?? '',
      status: school.isActive ? 'ACTIVE' : 'INACTIVE'
    };

    this.showForm = true;
  }

  closeForm(): void {

    this.showForm = false;

    this.editingSchool = null;
  }

  /* SAVE */

  saveSchool(): void {

    if (!this.form.name.trim()) {
      return;
    }

    this.saving = true;

    if (this.editingSchool) {

      const request: UpdateSchoolRequest = {
        name: this.form.name.trim(),
        code: this.form.code.trim() || undefined,
        address: this.form.address.trim() || undefined,
        phone: this.form.phone.trim() || undefined,
        email: this.form.email.trim() || undefined,
        isActive: this.form.status === 'ACTIVE'
      };

      this.schoolService
        .update(this.editingSchool.id, request)
        .subscribe({

          next: () => {

            this.saving = false;

            this.closeForm();

            this.loadSchools();
          },

          error: (error) => {

            console.error(error);

            this.errorMessage =
              error?.error?.message ||
              'Failed to update school.';

            this.saving = false;

            this.cdr.markForCheck();
          }
        });

      return;
    }

    const request: CreateSchoolRequest = {
      name: this.form.name.trim(),
      code: this.form.code.trim() || undefined,
      address: this.form.address.trim() || undefined,
      phone: this.form.phone.trim() || undefined,
      email: this.form.email.trim() || undefined
    };

    this.schoolService.create(request).subscribe({

      next: () => {

        this.saving = false;

        this.closeForm();

        this.loadSchools();
      },

      error: (error) => {

        console.error(error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to create school.';

        this.saving = false;

        this.cdr.markForCheck();
      }
    });
  }

  /* DELETE */

  deleteSchool(school: School): void {

    this.schoolToDelete = school;

    this.showDeleteDialog = true;

    this.cdr.markForCheck();
  }

  cancelDeleteSchool(): void {

    this.showDeleteDialog = false;

    this.schoolToDelete = null;

    this.cdr.markForCheck();
  }

  confirmDeleteSchool(): void {

    const school = this.schoolToDelete;

    if (!school) {
      return;
    }

    this.showDeleteDialog = false;

    this.schoolToDelete = null;

    this.schoolService.delete(school.id).subscribe({

      next: () => {
        this.loadSchools();
      },

      error: (error) => {

        console.error(error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to delete school.';

        this.cdr.markForCheck();
      }
    });
  }
}
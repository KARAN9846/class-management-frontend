import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  DataTableComponent,
  TableAction,
  TableColumn
} from '../../../../shared/components/data-table/data-table.component';

import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';

import {
  FeeStructure
} from '../models/fee-structure.model';

import { FeeStructureService } from '../services/fee-structure.service';

import { FeeStructureCreateComponent } from '../fee-structure-create/fee-structure-create';

@Component({
  selector: 'app-fee-structure-list',
  standalone: true,

  imports: [
    DataTableComponent,
    FormsModule,
    FeeStructureCreateComponent
  ],

  templateUrl: './fee-structure-list.html',
  styleUrl: './fee-structure-list.scss'
})
export class FeeStructureList implements OnInit {

  private readonly feeStructureService =
    inject(FeeStructureService);

  private readonly academicYearService =
    inject(AcademicYearService);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // MODAL
  // =====================================================

  isCreateModalOpen = false;


  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }


  onFeeStructureCreated(): void {
    this.isCreateModalOpen = false;
    this.loadFeeStructures();
  }


  // =====================================================
  // DATA
  // =====================================================

  feeStructures: FeeStructure[] = [];

  academicYears: {
    id: number;
    name: string;
  }[] = [];


  // =====================================================
  // FILTER
  // =====================================================

  academicYearFilter: number | 'ALL' = 'ALL';

  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';


  get filteredFeeStructures(): FeeStructure[] {

    if (this.statusFilter === 'ALL') {
      return this.feeStructures;
    }

    if (this.statusFilter === 'ACTIVE') {
      return this.feeStructures.filter(
        fee => fee.isActive
      );
    }

    return this.feeStructures.filter(
      fee => !fee.isActive
    );
  }


  // =====================================================
  // STATE
  // =====================================================

  loading = false;

  errorMessage = '';


  // =====================================================
  // TABLE
  // =====================================================

  columns: TableColumn[] = [

    {
      key: 'className',
      label: 'Class',
      width: '25%'
    },

    {
      key: 'academicYearName',
      label: 'Academic Year',
      width: '25%'
    },

    {
      key: 'feeAmount',
      label: 'Fee Amount',
      width: '20%'
    },

    {
      key: 'isActive',
      label: 'Status',
      width: '15%',
      type: 'status',
      align: 'center'
    }

  ];


  // =====================================================
  // ACTIONS
  // =====================================================

  actions: TableAction[] = [

    {
      label: 'Edit',
      type: 'edit'
    }

  ];


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadAcademicYears();

  }


  // =====================================================
  // LOAD ACADEMIC YEARS
  // =====================================================

  private loadAcademicYears(): void {

    this.loading = true;
    this.errorMessage = '';

    this.academicYearService
      .getAll()
      .subscribe({

        next: response => {

          this.academicYears =
            response.data.content.map(year => ({
              id: year.id,
              name: year.name
            }));

          this.loadFeeStructures();

        },

        error: error => {

          console.error(
            'Failed to load academic years',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load academic years.';

          this.loading = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // LOAD FEE STRUCTURES
  // =====================================================

  loadFeeStructures(): void {

    this.loading = true;
    this.errorMessage = '';

    const academicYearId =
      this.academicYearFilter === 'ALL'
        ? undefined
        : this.academicYearFilter;

    this.feeStructureService
      .getAll(academicYearId)
      .subscribe({

        next: (response: FeeStructure[]) => {

          this.feeStructures =
            response ?? [];

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: error => {

          console.error(
            'Failed to load fee structures',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load fee structures.';

          this.loading = false;

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // FILTER
  // =====================================================

  onAcademicYearChange(): void {

    this.loadFeeStructures();

  }


  onStatusChange(): void {

    this.cdr.detectChanges();

  }


  // =====================================================
  // CREATE
  // =====================================================

  createFeeStructure(): void {

    this.isCreateModalOpen = true;

  }


  // =====================================================
  // ROW ACTIONS
  // =====================================================

  getRowActions(
    feeStructure: FeeStructure
  ): TableAction[] {

    const actions: TableAction[] = [

      {
        label: 'Edit',
        type: 'edit'
      }

    ];

    if (feeStructure.isActive) {

      actions.push({
        label: 'Deactivate',
        type: 'deactivate',
        danger: true
      });

    } else {

      actions.push({
        label: 'Activate',
        type: 'activate'
      });

    }

    return actions;

  }


  // =====================================================
  // ACTION CLICK
  // =====================================================

  onActionClick(event: {
    action: TableAction;
    row: FeeStructure;
  }): void {

    const {
      action,
      row
    } = event;

    switch (action.type) {

      case 'edit':

        this.editFeeStructure(row);

        break;

      case 'activate':

        this.activateFeeStructure(row);

        break;

      case 'deactivate':

        this.deactivateFeeStructure(row);

        break;

    }

  }


  // =====================================================
  // EDIT
  // =====================================================

  editFeeStructure(
    feeStructure: FeeStructure
  ): void {

    this.router.navigate([
      '/admin/fees/fee-structures',
      feeStructure.id,
      'edit'
    ]);

  }


  // =====================================================
  // ACTIVATE
  // =====================================================

  activateFeeStructure(
    feeStructure: FeeStructure
  ): void {

    if (feeStructure.isActive) {
      return;
    }

    this.feeStructureService
      .updateStatus(
        feeStructure.id,
        {
          isActive: true
        }
      )
      .subscribe({

        next: () => {

          this.loadFeeStructures();

        },

        error: error => {

          console.error(
            'Failed to activate fee structure',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to activate fee structure.';

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // DEACTIVATE
  // =====================================================

  deactivateFeeStructure(
    feeStructure: FeeStructure
  ): void {

    if (!feeStructure.isActive) {
      return;
    }

    this.feeStructureService
      .updateStatus(
        feeStructure.id,
        {
          isActive: false
        }
      )
      .subscribe({

        next: () => {

          this.loadFeeStructures();

        },

        error: error => {

          console.error(
            'Failed to deactivate fee structure',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to deactivate fee structure.';

          this.cdr.detectChanges();

        }

      });

  }


  // =====================================================
  // BACK TO FEE MANAGEMENT
  // =====================================================

  goBackToFeeManagement(): void {

    this.router.navigate([
      '/admin/fees'
    ]);

  }

}
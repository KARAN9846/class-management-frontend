import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { DashboardService } from '../../dashboard/services/dashboard.service';
import {
  AcademicStructureDashboardData,
  AcademicStructureClass
} from '../../dashboard/models/dashboard.model';

import { SchoolComponent } from '../schools/school';
import { School } from '../schools/school.model';
import { SchoolService } from '../schools/services/school.service';

import { AcademicYearsComponent } from '../academic-years/academic-years';
import { ClassesComponent } from '../classes/classes';
import { SubjectsComponent } from '../subjects/subjects';
import { PasswordManagementComponent } from '../password-management/password-management';
import { BranchComponent } from '../branches/branch';
import { BoardMediumComponent } from '../board-media/board-medium';


type AcademicTab =
  | 'overview'
  | 'academic-years'
  | 'schools'
  | 'branches'
  | 'board-medium'
  | 'classes'
  | 'subjects'
  | 'password-management';


@Component({
  selector: 'app-academic-workspace',
  standalone: true,
imports: [
  CommonModule,
  AcademicYearsComponent,
  SchoolComponent,
  ClassesComponent,
  SubjectsComponent,
  PasswordManagementComponent,
  BranchComponent,
  BoardMediumComponent,
],
  templateUrl: './academic-workspace.html',
  styleUrl: './academic-workspace.scss'
})
export class AcademicWorkspaceComponent implements OnInit {

  private readonly dashboardService =
    inject(DashboardService);

  private readonly schoolService =
    inject(SchoolService);

  private readonly cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // TAB
  // =========================================================

  activeTab: AcademicTab = 'overview';


  // =========================================================
  // ACADEMIC DATA
  // =========================================================

  academicData: AcademicStructureDashboardData | null = null;

  schools: School[] = [];


  // =========================================================
  // STATE
  // =========================================================

  loading = false;

  errorMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.loadOverview();
  }


  // =========================================================
  // TAB
  // =========================================================

  setActiveTab(tab: AcademicTab): void {
    this.activeTab = tab;
  }


  // =========================================================
  // LOAD OVERVIEW
  // =========================================================

  private loadOverview(): void {

    this.loading = true;

    this.errorMessage = '';


    this.dashboardService
      .getAcademicStructureDashboard()
      .subscribe({

        next: response => {

          this.academicData = response.data;

          this.loadSchools();

        },

        error: error => {

          console.error(
            'Failed to load academic structure:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to load academic overview.';

          this.loading = false;

          this.cdr.markForCheck();
        }

      });
  }


  // =========================================================
  // LOAD SCHOOLS
  // =========================================================

  private loadSchools(): void {

    this.schoolService
      .getAll()
      .subscribe({

        next: response => {

          this.schools =
            response.data.content ?? [];

          this.loading = false;

          this.cdr.markForCheck();
        },

        error: error => {

          console.error(
            'Failed to load schools:',
            error
          );

          /*
           * Academic structure is still usable even if
           * schools fail to load.
           */
          this.schools = [];

          this.errorMessage =
            error?.error?.message ||
            'Academic structure loaded, but schools could not be loaded.';

          this.loading = false;

          this.cdr.markForCheck();
        }

      });
  }


  // =========================================================
  // HELPERS
  // =========================================================

  get classes(): AcademicStructureClass[] {

    return this.academicData?.classes ?? [];
  }


  get totalActiveSchools(): number {

    return this.schools.filter(
      school => school.isActive
    ).length;
  }


  get totalInactiveSchools(): number {

    return this.schools.filter(
      school => !school.isActive
    ).length;
  }


  get hasAcademicData(): boolean {

    return !!this.academicData;
  }


  get hasClasses(): boolean {

    return this.classes.length > 0;
  }


  get hasSchools(): boolean {

    return this.schools.length > 0;
  }
}
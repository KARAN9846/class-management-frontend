import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

import {
  SuperAdminDashboardData,
  SuperAdminOrganizationSummary
} from '../../../admin/dashboard/models/dashboard.model';

import {
  DashboardService
} from '../../../admin/dashboard/services/dashboard.service';

import { ChangeDetectorRef } from '@angular/core';

Chart.register(...registerables);

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.scss'
})
export class SuperAdminDashboard
  implements OnInit, AfterViewInit, OnDestroy {

  private readonly dashboardService = inject(DashboardService);

  @ViewChild('organizationStatusChart')
  organizationStatusChart?: ElementRef<HTMLCanvasElement>;

  @ViewChild('resourceChart')
  resourceChart?: ElementRef<HTMLCanvasElement>;

  @ViewChild('organizationTrendChart')
  organizationTrendChart?: ElementRef<HTMLCanvasElement>;

  dashboard: SuperAdminDashboardData | null = null;

  loading = true;

  error = '';

  private statusChart?: Chart;

  private resourceChartInstance?: Chart;

  private organizationTrendChartInstance?: Chart;

  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    this.renderChartsWhenReady();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  loadDashboard(): void {

    this.loading = true;
    this.error = '';

    this.dashboardService.getSuperAdminDashboard().subscribe({

next: response => {
  if (response.success) {
    this.dashboard = response.data;
  } else {
    this.error =
      response.message || 'Unable to load Super Admin dashboard.';
  }

  this.loading = false;
  this.cdr.detectChanges();

  setTimeout(() => this.renderCharts());
},



error: error => {
  console.error('Super Admin dashboard loading failed:', error);

  this.error =
    error?.error?.message ||
    'Unable to load Super Admin dashboard.';

  this.loading = false;
  this.cdr.detectChanges();
},
    });
  }

  refresh(): void {
    this.loadDashboard();
  }

  private renderChartsWhenReady(): void {

    if (!this.loading && this.dashboard) {
      this.renderCharts();
    }
  }

  private renderCharts(): void {

    if (!this.dashboard) {
      return;
    }

    this.destroyCharts();

    this.renderOrganizationStatusChart();

    this.renderResourceChart();

    this.renderOrganizationTrendChart();
  }

  private renderOrganizationStatusChart(): void {

    const canvas =
      this.organizationStatusChart?.nativeElement;

    if (!canvas || !this.dashboard) {
      return;
    }

    const overview = this.dashboard.overview;

    const config: ChartConfiguration<'doughnut'> = {

      type: 'doughnut',

      data: {
        labels: [
          'Active',
          'Inactive'
        ],

        datasets: [
          {
            data: [
              overview.activeOrganizations,
              overview.inactiveOrganizations
            ],

            backgroundColor: [
              '#2563eb',
              '#cbd5e1'
            ],

            borderWidth: 0,

            hoverOffset: 5
          }
        ]
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        cutout: '72%',

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: (context) => {

                const value =
                  Number(context.raw) || 0;

                const total =
                  overview.totalOrganizations;

                const percentage =
                  total > 0
                    ? ((value / total) * 100).toFixed(1)
                    : '0.0';

                return ` ${value} organizations (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.statusChart =
      new Chart(canvas, config);
  }

  private renderResourceChart(): void {

    const canvas =
      this.resourceChart?.nativeElement;

    if (!canvas || !this.dashboard) {
      return;
    }

    const resources =
      this.dashboard.resourceDistribution;

    const config: ChartConfiguration<'bar'> = {

      type: 'bar',

      data: {

        labels: [
          'Students',
          'Teachers',
          'Classes',
          'Sections',
          'Subjects',
          'Roles'
        ],

        datasets: [
          {
            label: 'Platform Resources',

            data: [
              resources.students,
              resources.teachers,
              resources.classes,
              resources.sections,
              resources.subjects,
              resources.roleAssignments
            ],

            backgroundColor: [
              '#2563eb',
              '#0ea5e9',
              '#6366f1',
              '#8b5cf6',
              '#14b8a6',
              '#f59e0b'
            ],

            borderRadius: 4,

            barThickness: 18
          }
        ]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        indexAxis: 'y',

        plugins: {

          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${Number(context.raw).toLocaleString()}`
            }
          }
        },

        scales: {

          x: {
            beginAtZero: true,

            grid: {
              color: '#eef2f7'
            },

            ticks: {
              color: '#64748b'
            }
          },

          y: {

            grid: {
              display: false
            },

            ticks: {
              color: '#334155',

              font: {
                weight: 600
              }
            }
          }
        }
      }
    };

    this.resourceChartInstance =
      new Chart(canvas, config);
  }

  private renderOrganizationTrendChart(): void {

    const canvas =
      this.organizationTrendChart?.nativeElement;

    if (!canvas || !this.dashboard) {
      return;
    }

    const trend =
      this.dashboard.organizationCreationTrend;

    const config: ChartConfiguration<'line'> = {

      type: 'line',

      data: {

        labels:
          trend.map(item => item.month),

        datasets: [
          {
            label: 'Organizations Created',

            data:
              trend.map(item => item.organizationsCreated),

            borderColor: '#2563eb',

            backgroundColor: 'rgba(37, 99, 235, 0.08)',

            fill: true,

            tension: 0.3,

            pointRadius: 3,

            pointHoverRadius: 5
          }
        ]
      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${Number(context.raw).toLocaleString()} organizations`
            }
          }
        },

        scales: {

          x: {

            grid: {
              display: false
            },

            ticks: {
              color: '#64748b',

              maxRotation: 0
            }
          },

          y: {

            beginAtZero: true,

            ticks: {
              precision: 0,

              color: '#64748b'
            },

            grid: {
              color: '#eef2f7'
            }
          }
        }
      }
    };

    this.organizationTrendChartInstance =
      new Chart(canvas, config);
  }

  private destroyCharts(): void {

    this.statusChart?.destroy();

    this.resourceChartInstance?.destroy();

    this.organizationTrendChartInstance?.destroy();

    this.statusChart = undefined;

    this.resourceChartInstance = undefined;

    this.organizationTrendChartInstance = undefined;
  }

  trackByOrganizationId(
    index: number,
    organization: SuperAdminOrganizationSummary
  ): number {

    return organization.organizationId;
  }

  trackByInsight(
    index: number,
    insight: {
      title: string;
      organizationId?: number;
    }
  ): string {

    return `${insight.organizationId ?? 'platform'}-${insight.title}`;
  }

  get topOrganizations(): SuperAdminOrganizationSummary[] {

    return this.dashboard?.organizations.slice(0, 5) ?? [];
  }

  get attentionOrganizations(): SuperAdminOrganizationSummary[] {

    return this.dashboard?.organizations
      .filter(item => item.needsAttention)
      .slice(0, 5) ?? [];
  }

  get maxStudents(): number {

    return Math.max(
      ...(this.dashboard?.organizations.map(
        item => item.students
      ) ?? [1]),
      1
    );
  }

  getStudentBarWidth(
    students: number
  ): number {

    return Math.max(
      students > 0
        ? Math.round(
            (students / this.maxStudents) * 100
          )
        : 0,
      students > 0 ? 6 : 0
    );
  }

  formatNumber(value: number): string {

    return value.toLocaleString('en-IN');
  }

  formatPercentage(value: number): string {

    return `${value.toFixed(1)}%`;
  }

  formatRatio(value: number): string {

    return value.toFixed(1);
  }
}
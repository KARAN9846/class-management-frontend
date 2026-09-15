import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { StudentFeeService } from '../../fees/services/student-fee.service';

interface StudentFee {
    id: number;
    studentId: number;
    studentName: string;
    rollNumber: string | null;
    academicYearId: number;
    academicYearName: string;
    classId: number;
    className: string;
    sectionId: number;
    sectionName: string;
    feeStructureId: number;
    originalAmount: number;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    payableAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
}

interface ClassAnalysis {
    classId: number;
    className: string;
    students: number;
    expected: number;
    collected: number;
    outstanding: number;
    collectionRate: number;
    unpaid: number;
    partial: number;
    paid: number;
}

interface AlertItem {
    type: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    count?: number;
    amount?: number;
    actionLabel?: string;
}

interface StudentActionRow extends StudentFee {
    collectionRate: number;
    risk: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Component({
    selector: 'app-fees-insider',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DecimalPipe,
        RouterModule
    ],
    templateUrl: './fees-insider.html',
    styleUrl: './fees-insider.scss'
})
export class FeesInsider implements OnInit {

    private readonly studentFeeService = inject(StudentFeeService);
    private readonly cdr = inject(ChangeDetectorRef);

    loading = false;
    errorMessage = '';

    allFees: StudentFee[] = [];
    selectedAcademicYear = 'ALL';
    searchTerm = '';

    academicYears: string[] = [];

    totalStudents = 0;
    expectedAmount = 0;
    collectedAmount = 0;
    outstandingAmount = 0;
    totalDiscount = 0;

    fullyPaidStudents = 0;
    partialStudents = 0;
    unpaidStudents = 0;

    collectionRate = 0;
    paymentCoverage = 0;
    averageOutstanding = 0;
    averageFee = 0;
    discountRate = 0;

    classAnalysis: ClassAnalysis[] = [];
    topOutstanding: StudentActionRow[] = [];
    actionRows: StudentActionRow[] = [];
    alerts: AlertItem[] = [];

    readonly maxClassOutstanding = () => {
        return Math.max(
            ...this.classAnalysis.map(item => item.outstanding),
            1
        );
    };

    readonly maxStudentOutstanding = () => {
        return Math.max(
            ...this.actionRows.map(item => item.remainingAmount),
            1
        );
    };

    ngOnInit(): void {
        this.loadFees();
    }

    loadFees(): void {
        this.loading = true;
        this.errorMessage = '';

this.studentFeeService.getAll().subscribe({
    next: (response) => {
        this.allFees = Array.isArray(response.data)
            ? response.data
            : [];

        this.academicYears = [
            ...new Set(
                this.allFees
                    .map(fee => fee.academicYearName)
                    .filter(Boolean)
            )
        ];

        this.rebuildDashboard();
        this.loading = false;
        this.cdr.detectChanges();
    },
    error: (error: unknown) => {
        console.error('Failed to load Fees Insider data', error);
        this.errorMessage =
            'Unable to load fee analytics right now. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
    }
});
    }

    rebuildDashboard(): void {
        const fees = this.filteredSourceFees();

        this.calculateSummary(fees);
        this.buildClassAnalysis(fees);
        this.buildStudentQueue(fees);
        this.buildAlerts(fees);
    }

    filteredSourceFees(): StudentFee[] {
        let fees = this.allFees;

        if (this.selectedAcademicYear !== 'ALL') {
            fees = fees.filter(
                fee => fee.academicYearName === this.selectedAcademicYear
            );
        }

        return fees;
    }

    onAcademicYearChange(): void {
        this.rebuildDashboard();
    }

    onSearchChange(): void {
        this.buildStudentQueue(this.filteredSourceFees());
    }

    calculateSummary(fees: StudentFee[]): void {
        this.totalStudents = fees.length;

        this.expectedAmount = this.sum(
            fees.map(fee => this.money(fee.payableAmount))
        );

        this.collectedAmount = this.sum(
            fees.map(fee => this.money(fee.paidAmount))
        );

        this.outstandingAmount = this.sum(
            fees.map(fee => this.money(fee.remainingAmount))
        );

        this.totalDiscount = this.sum(
            fees.map(fee => this.money(fee.discountAmount))
        );

        this.fullyPaidStudents = fees.filter(
            fee => this.money(fee.remainingAmount) <= 0
        ).length;

        this.unpaidStudents = fees.filter(
            fee => this.money(fee.paidAmount) <= 0
        ).length;

        this.partialStudents = fees.filter(
            fee =>
                this.money(fee.paidAmount) > 0 &&
                this.money(fee.remainingAmount) > 0
        ).length;

        this.collectionRate = this.expectedAmount > 0
            ? (this.collectedAmount / this.expectedAmount) * 100
            : 0;

        this.paymentCoverage = this.totalStudents > 0
            ? ((this.totalStudents - this.unpaidStudents) / this.totalStudents) * 100
            : 0;

        this.averageOutstanding = this.totalStudents > 0
            ? this.outstandingAmount / this.totalStudents
            : 0;

        this.averageFee = this.totalStudents > 0
            ? this.expectedAmount / this.totalStudents
            : 0;

        const originalAmount = this.sum(
            fees.map(fee => this.money(fee.originalAmount))
        );

        this.discountRate = originalAmount > 0
            ? (this.totalDiscount / originalAmount) * 100
            : 0;
    }

    buildClassAnalysis(fees: StudentFee[]): void {
        const map = new Map<number, ClassAnalysis>();

        for (const fee of fees) {
            const existing = map.get(fee.classId);

            if (!existing) {
                map.set(fee.classId, {
                    classId: fee.classId,
                    className: fee.className,
                    students: 1,
                    expected: this.money(fee.payableAmount),
                    collected: this.money(fee.paidAmount),
                    outstanding: this.money(fee.remainingAmount),
                    collectionRate: 0,
                    unpaid: this.isUnpaid(fee) ? 1 : 0,
                    partial: this.isPartial(fee) ? 1 : 0,
                    paid: this.isPaid(fee) ? 1 : 0
                });
                continue;
            }

            existing.students++;
            existing.expected += this.money(fee.payableAmount);
            existing.collected += this.money(fee.paidAmount);
            existing.outstanding += this.money(fee.remainingAmount);

            if (this.isUnpaid(fee)) existing.unpaid++;
            if (this.isPartial(fee)) existing.partial++;
            if (this.isPaid(fee)) existing.paid++;
        }

        this.classAnalysis = [...map.values()]
            .map(item => ({
                ...item,
                expected: this.round(item.expected),
                collected: this.round(item.collected),
                outstanding: this.round(item.outstanding),
                collectionRate: item.expected > 0
                    ? (item.collected / item.expected) * 100
                    : 0
            }))
            .sort((a, b) => b.outstanding - a.outstanding);
    }

    buildStudentQueue(fees: StudentFee[]): void {
        const query = this.searchTerm.trim().toLowerCase();

        let rows = fees
            .filter(fee => this.money(fee.remainingAmount) > 0)
            .map(fee => ({
                ...fee,
                collectionRate: this.getCollectionRate(fee),
                risk: this.getRisk(fee)
            }));

        if (query) {
            rows = rows.filter(row =>
                row.studentName.toLowerCase().includes(query) ||
                (row.rollNumber ?? '').toLowerCase().includes(query) ||
                row.className.toLowerCase().includes(query) ||
                row.sectionName.toLowerCase().includes(query)
            );
        }

        this.actionRows = rows
            .sort((a, b) => b.remainingAmount - a.remainingAmount)
            .slice(0, 10);

        this.topOutstanding = [...rows]
            .sort((a, b) => b.remainingAmount - a.remainingAmount)
            .slice(0, 5);
    }

    buildAlerts(fees: StudentFee[]): void {
        const unpaid = fees.filter(fee => this.isUnpaid(fee));
        const partial = fees.filter(fee => this.isPartial(fee));
        const highOutstanding = fees.filter(
            fee => this.getOutstandingRate(fee) >= 50
        );

        const lowCollectionClasses = this.classAnalysis.filter(
            item => item.collectionRate < 50 && item.students > 0
        );

        const alerts: AlertItem[] = [];

        if (unpaid.length > 0) {
            alerts.push({
                type: 'critical',
                title: 'Students with no payment',
                description: `${unpaid.length} student(s) have not made any fee payment.`,
                count: unpaid.length,
                amount: this.sum(
                    unpaid.map(fee => this.money(fee.payableAmount))
                ),
                actionLabel: 'Follow up'
            });
        }

        if (highOutstanding.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'High outstanding exposure',
                description: `${highOutstanding.length} student(s) still owe at least 50% of their payable fee.`,
                count: highOutstanding.length,
                amount: this.sum(
                    highOutstanding.map(fee => this.money(fee.remainingAmount))
                ),
                actionLabel: 'Review'
            });
        }

        if (lowCollectionClasses.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'Low-performing classes',
                description: `${lowCollectionClasses.length} class(es) are below 50% collection.`,
                count: lowCollectionClasses.length,
                actionLabel: 'Analyze'
            });
        }

        if (partial.length > 0) {
            alerts.push({
                type: 'info',
                title: 'Partial payments need follow-up',
                description: `${partial.length} student(s) have started paying but still have a balance.`,
                count: partial.length,
                amount: this.sum(
                    partial.map(fee => this.money(fee.remainingAmount))
                ),
                actionLabel: 'View queue'
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                type: 'info',
                title: 'Fee position looks healthy',
                description: 'No major collection risk was detected in the current data.'
            });
        }

        this.alerts = alerts;
    }

    getCollectionRate(fee: StudentFee): number {
        const payable = this.money(fee.payableAmount);

        if (payable <= 0) return 100;

        return Math.min(
            100,
            Math.max(0, (this.money(fee.paidAmount) / payable) * 100)
        );
    }

    getOutstandingRate(fee: StudentFee): number {
        const payable = this.money(fee.payableAmount);

        if (payable <= 0) return 0;

        return Math.min(
            100,
            Math.max(0, (this.money(fee.remainingAmount) / payable) * 100)
        );
    }

    getRisk(fee: StudentFee): 'HIGH' | 'MEDIUM' | 'LOW' {
        const outstandingRate = this.getOutstandingRate(fee);

        if (this.isUnpaid(fee) || outstandingRate >= 75) {
            return 'HIGH';
        }

        if (outstandingRate >= 50) {
            return 'MEDIUM';
        }

        return 'LOW';
    }

    isUnpaid(fee: StudentFee): boolean {
        return this.money(fee.paidAmount) <= 0;
    }

    isPartial(fee: StudentFee): boolean {
        return (
            this.money(fee.paidAmount) > 0 &&
            this.money(fee.remainingAmount) > 0
        );
    }

    isPaid(fee: StudentFee): boolean {
        return this.money(fee.remainingAmount) <= 0;
    }

    classOutstandingWidth(item: ClassAnalysis): number {
        return (item.outstanding / this.maxClassOutstanding()) * 100;
    }

    studentOutstandingWidth(row: StudentActionRow): number {
        return (row.remainingAmount / this.maxStudentOutstanding()) * 100;
    }

    collectionGaugeStyle(): string {
        const rate = Math.min(100, Math.max(0, this.collectionRate));

        return `conic-gradient(
            #16a34a 0deg ${rate * 3.6}deg,
            #e8eef5 ${rate * 3.6}deg 360deg
        )`;
    }

    statusLabel(row: StudentActionRow): string {
        if (this.isUnpaid(row)) return 'NO PAYMENT';
        if (this.isPartial(row)) return 'PARTIAL';
        return 'PAID';
    }

    riskClass(risk: string): string {
        return risk.toLowerCase();
    }

    formatCurrency(value: number): string {
        return `₹${this.round(value).toLocaleString('en-IN')}`;
    }

    private sum(values: number[]): number {
        return this.round(
            values.reduce((total, value) => total + (Number(value) || 0), 0)
        );
    }

    private money(value: number | null | undefined): number {
        return Number(value) || 0;
    }

    private round(value: number): number {
        return Math.round((Number(value) || 0) * 100) / 100;
    }
}

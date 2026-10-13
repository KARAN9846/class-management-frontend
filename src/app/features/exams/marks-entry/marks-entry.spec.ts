import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { Exam, ExamMark } from '../models/exam.model';
import { ExamService } from '../services/exam.service';
import { MarksEntryComponent } from './marks-entry';

describe('MarksEntryComponent bulk selection', () => {
  let fixture: ComponentFixture<MarksEntryComponent>;
  let component: MarksEntryComponent;
  let examService: {
    saveTeacherMarks: ReturnType<typeof vi.fn>;
    saveAdminMarks: ReturnType<typeof vi.fn>;
  };

  const exam = {
    id: 10,
    maximumMarks: 100,
    status: 'PUBLISHED'
  } as Exam;

  const mark = (candidateId: number): ExamMark => ({
    candidateId,
    studentId: candidateId,
    enrollmentId: candidateId,
    firstName: `Student ${candidateId}`,
    lastName: 'Test',
    rollNumber: `${candidateId}`,
    enrollmentNumber: `EN-${candidateId}`,
    markStatus: 'PENDING',
    score: null,
    version: 0,
    updatedAt: '2026-10-13T00:00:00'
  });

  beforeEach(async () => {
    examService = {
      saveTeacherMarks: vi.fn(),
      saveAdminMarks: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MarksEntryComponent],
      providers: [
        { provide: ExamService, useValue: examService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { examRole: 'TEACHER' },
              paramMap: { get: () => '10' }
            }
          }
        },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarksEntryComponent);
    component = fixture.componentInstance;
    component.exam = exam;
  });

  it('clears confirmed selections and merges saved statuses', () => {
    const first = mark(1);
    const second = mark(2);
    component.marks = [first, second];
    component.selected = { 1: true, 2: true };
    component.markSelectedNotApplicable();

    expect(component.selectedCount).toBe(2);
    expect(component.bulkActionStatus).toBe('NOT_APPLICABLE');

    examService.saveTeacherMarks.mockReturnValue(of({
      success: true,
      message: 'Saved',
      data: [
        { ...first, markStatus: 'NOT_APPLICABLE', version: 1 },
        { ...second, markStatus: 'NOT_APPLICABLE', version: 1 }
      ]
    }));

    component.confirmBulkAction();

    expect(component.selectedCount).toBe(0);
    expect(component.dirtyCount).toBe(0);
    expect(component.bulkActionStatus).toBeNull();
    expect(component.marks.map(item => item.markStatus)).toEqual([
      'NOT_APPLICABLE',
      'NOT_APPLICABLE'
    ]);
  });

  it('preserves selection and unsaved statuses when saving fails', () => {
    component.marks = [mark(1)];
    component.selected = { 1: true };
    component.markSelectedAbsent();
    examService.saveTeacherMarks.mockReturnValue(throwError(() => ({
      error: { message: 'Save failed' }
    })));

    component.confirmBulkAction();

    expect(component.selectedCount).toBe(1);
    expect(component.dirtyCount).toBe(1);
    expect(component.marks[0].markStatus).toBe('ABSENT');
    expect(component.bulkActionError).toBe('Save failed');
    expect(component.bulkActionStatus).toBe('ABSENT');
  });

  it('cancels a bulk action without changing marks or calling the API', () => {
    component.marks = [mark(1)];
    component.selected = { 1: true };

    component.markSelectedExempt();
    component.closeBulkAction();

    expect(component.marks[0].markStatus).toBe('PENDING');
    expect(component.selectedCount).toBe(1);
    expect(examService.saveTeacherMarks).not.toHaveBeenCalled();
  });

  it('can save Not Applicable then select a different group as Absent', () => {
    const first = mark(1);
    const second = mark(2);
    component.marks = [first, second];
    component.selected = { 1: true };
    component.markSelectedNotApplicable();
    examService.saveTeacherMarks.mockReturnValueOnce(of({
      success: true,
      message: 'Saved',
      data: [{ ...first, markStatus: 'NOT_APPLICABLE', version: 1 }]
    }));

    component.confirmBulkAction();
    component.toggleSelection(2, true);
    component.markSelectedAbsent();

    expect(component.selectedCount).toBe(1);
    expect(component.bulkActionCandidateIds).toEqual([2]);
    expect(component.bulkActionStatus).toBe('ABSENT');
  });

  it('prevents duplicate confirmation submissions while saving', () => {
    const response$ = new Subject<never>();
    component.marks = [mark(1)];
    component.selected = { 1: true };
    component.markSelectedAbsent();
    examService.saveTeacherMarks.mockReturnValue(response$);

    component.confirmBulkAction();
    component.confirmBulkAction();

    expect(examService.saveTeacherMarks).toHaveBeenCalledTimes(1);
  });
});

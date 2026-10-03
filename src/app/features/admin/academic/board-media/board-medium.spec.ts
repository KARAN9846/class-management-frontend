import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BoardMediumService } from './services/board-medium.service';
import { BoardMediumComponent } from './board-medium';

describe('BoardMediumComponent', () => {
  let component: BoardMediumComponent;
  let fixture: ComponentFixture<BoardMediumComponent>;
  let service: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const record = {
    id: 7,
    name: 'GSEB - English Medium',
    isActive: true,
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
  };

  beforeEach(async () => {
    service = {
      getAll: vi.fn(() => of({ content: [record] })),
      create: vi.fn(() => of(record)),
      update: vi.fn(() => of(record)),
      delete: vi.fn(() => of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [BoardMediumComponent],
      providers: [
        { provide: BoardMediumService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardMediumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('opens the selected record and updates it with the supported payload', () => {
    component.onTableAction({
      action: { label: 'Edit', type: 'edit' },
      row: record,
    });

    expect(component.showForm).toBe(true);
    expect(component.editingBoardMedium).toEqual(record);
    expect(component.form.name).toBe(record.name);

    component.form.name = 'GSEB - Gujarati Medium';
    component.saveBoardMedium();

    expect(service.update).toHaveBeenCalledWith(7, {
      name: 'GSEB - Gujarati Medium',
    });
  });
});
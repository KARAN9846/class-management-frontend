import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApiService } from '../../../../core/services/api.service';
import { AcademicYearService } from '../../academic/academic-years/services/academic-year.service';
import { SchoolService } from '../../academic/schools/services/school.service';

describe('Smart Import paginated candidate services', () => {
  let api: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { get: vi.fn(() => of({})) };

    TestBed.configureTestingModule({
      providers: [
        SchoolService,
        AcademicYearService,
        { provide: ApiService, useValue: api }
      ]
    });
  });

  it('preserves School defaults and accepts an explicit page and size', () => {
    const service = TestBed.inject(SchoolService);

    service.getAll().subscribe();
    service.getAll(2, 25).subscribe();

    expect(api.get).toHaveBeenNthCalledWith(
      1,
      '/schools?page=0&size=50&sort=createdAt,desc'
    );
    expect(api.get).toHaveBeenNthCalledWith(
      2,
      '/schools?page=2&size=25&sort=createdAt,desc'
    );
  });

  it('preserves Academic Year defaults and accepts an explicit page and size', () => {
    const service = TestBed.inject(AcademicYearService);

    service.getAll().subscribe();
    service.getAll(3, 20).subscribe();

    expect(api.get).toHaveBeenNthCalledWith(
      1,
      '/academic-years?page=0&size=50&sort=createdAt,desc'
    );
    expect(api.get).toHaveBeenNthCalledWith(
      2,
      '/academic-years?page=3&size=20&sort=createdAt,desc'
    );
  });
});

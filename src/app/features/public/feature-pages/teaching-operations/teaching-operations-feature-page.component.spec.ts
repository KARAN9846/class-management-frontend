import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingOperationsFeaturePageComponent } from './teaching-operations-feature-page.component';

describe('TeachingOperationsFeaturePageComponent', () => {
  let fixture: ComponentFixture<TeachingOperationsFeaturePageComponent>;
  let component: TeachingOperationsFeaturePageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeachingOperationsFeaturePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TeachingOperationsFeaturePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders exactly two main feature sections and the shared page chrome', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelectorAll('main > section').length).toBe(2);
    expect(host.querySelector('app-navbar')).not.toBeNull();
    expect(host.querySelector('app-software-showcase')).not.toBeNull();
    expect(host.querySelector('app-book-demo')).not.toBeNull();
    expect(host.querySelector('app-footer')).not.toBeNull();
  });

  it('places the matching walkthrough immediately before the demo call to action', () => {
    const host = fixture.nativeElement as HTMLElement;
    const showcase = host.querySelector('app-software-showcase');
    const bookDemo = host.querySelector('app-book-demo');

    expect(showcase?.textContent).toContain('See Teaching Operations in Action');
    expect(showcase?.querySelector<HTMLAnchorElement>('.youtube-link')?.href).toBe(
      'https://www.youtube.com/watch?v=aTJrm0m6Onw',
    );
    expect(showcase?.nextElementSibling).toBe(bookDemo);
  });

  it('starts on attendance and switches all three preview tabs', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(component.activePreview()).toBe('attendance');
    expect(host.querySelector('#teaching-panel-attendance')).not.toBeNull();

    component.selectPreview('assignments');
    fixture.detectChanges();
    expect(host.querySelector('#teaching-panel-assignments')).not.toBeNull();

    component.selectPreview('exams');
    fixture.detectChanges();
    expect(host.querySelector('#teaching-panel-exams')).not.toBeNull();
  });

  it('keeps illustrative totals internally consistent', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Total Students');
    expect(host.textContent).toContain('Present');
    expect(host.textContent).toContain('Absent');
    expect(host.textContent).not.toContain('Late');

    component.selectPreview('assignments');
    fixture.detectChanges();
    expect(host.textContent).toContain('24 expected');
    expect(host.textContent).toContain('18 submitted');
    expect(host.textContent).toContain('6 pending');
  });
});

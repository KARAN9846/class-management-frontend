import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftwareShowcaseComponent } from './software-showcase.component';

describe('SoftwareShowcaseComponent', () => {
  let fixture: ComponentFixture<SoftwareShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoftwareShowcaseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SoftwareShowcaseComponent);
    fixture.componentRef.setInput('videoId', 'HX7DKhTV46w');
    fixture.componentRef.setInput('youtubeUrl', 'https://www.youtube.com/watch?v=HX7DKhTV46w');
    fixture.componentRef.setInput('heading', 'See Academic Management in Action');
    fixture.componentRef.setInput(
      'description',
      'Explore how academic information and everyday administrative workflows come together.',
    );
    fixture.detectChanges();
  });

  it('renders accessible showcase copy and a safe external YouTube link', () => {
    const host = fixture.nativeElement as HTMLElement;
    const section = host.querySelector('section');
    const heading = host.querySelector('h2');
    const link = host.querySelector<HTMLAnchorElement>('.youtube-link');

    expect(section?.getAttribute('aria-labelledby')).toBe(heading?.id);
    expect(host.querySelector('.showcase-eyebrow')?.textContent?.trim()).toBe(
      'PRODUCT WALKTHROUGH',
    );
    expect(heading?.textContent?.trim()).toBe('See Academic Management in Action');
    expect(link?.href).toBe('https://www.youtube.com/watch?v=HX7DKhTV46w');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toContain('noopener');
    expect(link?.rel).toContain('noreferrer');
  });

  it('does not create a YouTube iframe during initial rendering', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('iframe')).toBeNull();
    expect(host.querySelector('.video-frame')).not.toBeNull();
    expect(host.querySelector('.video-placeholder')).not.toBeNull();
  });
});

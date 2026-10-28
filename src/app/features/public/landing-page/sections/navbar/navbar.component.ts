import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly landingSectionPrefix = input('');
  readonly seamlessTransition = input(false);
  readonly menuOpen = signal(false);

  sectionHref(sectionId: string): string {
    return `${this.landingSectionPrefix()}#${sectionId}`;
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:pointerdown', ['$event'])
  handleOutsidePointer(event: PointerEvent): void {
    const target = event.target;

    if (
      this.menuOpen() &&
      target instanceof Node &&
      !this.hostElement.nativeElement.contains(target)
    ) {
      this.closeMenu();
    }
  }

  @HostListener('window:scroll')
  handlePageScroll(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    }
  }
}

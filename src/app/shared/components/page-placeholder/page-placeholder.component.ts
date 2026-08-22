import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-placeholder',
  standalone: true,
  templateUrl: './page-placeholder.component.html',
  styleUrl: './page-placeholder.component.scss'
})
export class PagePlaceholderComponent {

  @Input() title = 'Coming Soon';

  @Input() description =
    'This page is currently under development.';
}
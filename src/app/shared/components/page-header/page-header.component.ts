import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {

  @Input() title = '';

  @Input() description = '';

  @Input() breadcrumb = '';

  @Input() actionLabel = '';

  @Input() showAction = false;

  @Output() actionClick = new EventEmitter<void>();


  onActionClick(): void {
    this.actionClick.emit();
  }
}
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {

  @Input() title = 'No data found';

  @Input() description = 'There are no records available to display.';

  @Input() actionLabel = '';

  @Input() showAction = false;

  @Output() actionClick = new EventEmitter<void>();


  onActionClick(): void {
    this.actionClick.emit();
  }
}
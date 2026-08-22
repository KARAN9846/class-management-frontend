import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {

  @Input() title = 'Something went wrong';

  @Input() description =
    'We could not load the requested information. Please try again.';

  @Input() actionLabel = 'Try Again';

  @Input() showAction = true;

  @Output() actionClick = new EventEmitter<void>();

  onActionClick(): void {
    this.actionClick.emit();
  }
}
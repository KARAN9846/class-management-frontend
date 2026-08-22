import { Component, Input } from '@angular/core';

export type StatusBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {

  @Input() label = '';

  @Input() variant: StatusBadgeVariant = 'neutral';

  @Input() dot = true;
}
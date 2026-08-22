import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {

  @Input() message = 'Loading...';

  @Input() fullPage = false;

  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
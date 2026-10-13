import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-exam-hero',
  standalone: true,
  templateUrl: './exam-hero.html',
  styleUrl: './exam-hero.scss'
})
export class ExamHeroComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  @Input() eyebrow = 'ACADEMIC MANAGEMENT';
  @Input() compact = false;
}

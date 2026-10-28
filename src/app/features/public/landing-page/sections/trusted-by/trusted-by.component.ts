import { Component } from '@angular/core';

interface Testimonial {
  readonly id: string;
  readonly quote: string;
  readonly authorName: string;
  readonly authorRole: string;
  readonly institutionName: string;
  readonly initials: string;
  readonly imageUrl?: string;
}

@Component({
  selector: 'app-trusted-by',
  standalone: true,
  imports: [],
  templateUrl: './trusted-by.component.html',
  styleUrl: './trusted-by.component.scss',
})
export class TrustedByComponent {
  readonly testimonials: readonly Testimonial[] = [
    {
      id: 'ajay-bhartiya',
      quote:
        'CMS has made it much easier for us to keep academic information and day-to-day institute work organized. The platform is clear, practical, and helps our team manage operations with greater confidence.',
      authorName: 'Ajay Bhartiya',
      authorRole: 'Founder',
      institutionName: 'Mahavir Classes',
      initials: 'AB',
      imageUrl: 'assets/images/ajay-bhartiya.png',
    },
    {
      id: 'sample-review-2',
      quote:
        'The structured class and teaching views help us spend less time moving between records and more time supporting our students.',
      authorName: 'Arjun Mehta',
      authorRole: 'Academic Coordinator',
      institutionName: 'Northfield Academy',
      initials: 'AM',
    },
    {
      id: 'sample-review-3',
      quote:
        'Daily information is presented in a simple, organized way. It makes routine academic work feel more manageable for our team.',
      authorName: 'Neha Verma',
      authorRole: 'Teacher',
      institutionName: 'Greenway Institute',
      initials: 'NV',
    },
  ];
}

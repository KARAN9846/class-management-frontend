import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent {

  @Input() placeholder = 'Search...';
  @Input() disabled = false;

  @Output() searchChange = new EventEmitter<string>();

  searchValue = '';

  onSearchChange(): void {
    this.searchChange.emit(this.searchValue.trim());
  }

  clearSearch(): void {
    this.searchValue = '';
    this.searchChange.emit('');
  }
}
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchInputComponent),
    multi: true
  }]
})
export class SearchInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Search...';
  @Input() disabled = false;

  @Output() searchChange = new EventEmitter<string>();

  searchValue = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.searchValue = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSearchChange(): void {
    const value = this.searchValue.trim();

    this.onChange(value);
    this.onTouched();
    this.searchChange.emit(value);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.onChange('');
    this.onTouched();
    this.searchChange.emit('');
  }
}
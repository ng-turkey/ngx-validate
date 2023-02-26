import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[validationStyle]',
  exportAs: 'validationStyle',
  standalone: true,
})
export class ValidationStyleDirective {
  elRef = inject(ElementRef);
}

import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[validationStyle]',
  exportAs: 'validationStyle',
})
export class ValidationStyleDirective {
  constructor(public elRef: ElementRef) {}
}

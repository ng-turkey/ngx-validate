import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[validationStyle]',
})
export class ValidationStyleDirective {
  constructor(public elRef: ElementRef) {}
}

import { Directive, inject, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[validationTarget]',
  exportAs: 'validationTarget',
  standalone: true,
})
export class ValidationTargetDirective {
  vcRef = inject(ViewContainerRef);
}

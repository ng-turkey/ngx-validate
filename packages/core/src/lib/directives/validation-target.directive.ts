import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[validationTarget]',
  exportAs: 'validationTarget',
})
export class ValidationTargetDirective {
  constructor(public vcRef: ViewContainerRef) {}
}

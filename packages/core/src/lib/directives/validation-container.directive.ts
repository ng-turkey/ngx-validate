import { Directive, Input } from '@angular/core';
import { ValidationTargetDirective } from './validation-target.directive';

@Directive({
  selector: '[validationContainer]',
})
export class ValidationContainerDirective {
  @Input()
  target: ValidationTargetDirective;
}

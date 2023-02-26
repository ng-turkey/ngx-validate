import { ContentChild, Directive } from '@angular/core';
import { ValidationTargetDirective } from './validation-target.directive';

@Directive({
  selector: '[validationContainer]',
  exportAs: 'validationContainer',
  standalone: true,
})
export class ValidationContainerDirective {
  @ContentChild(ValidationTargetDirective)
  targetRef: ValidationTargetDirective;
}

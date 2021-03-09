import { ContentChild, Directive } from '@angular/core';
import { ValidationTargetDirective } from './validation-target.directive';

@Directive({
  selector: '[validationContainer]',
})
export class ValidationContainerDirective {
  @ContentChild(ValidationTargetDirective, { static: false })
  targetRef: ValidationTargetDirective;
}

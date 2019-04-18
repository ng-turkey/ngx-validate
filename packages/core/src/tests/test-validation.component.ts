import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-test-validation',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TestValidationComponent {
  form = new FormGroup({ name: new FormControl(null, { validators: [Validators.required] }) });

  onSubmit() {
    return;
  }
}

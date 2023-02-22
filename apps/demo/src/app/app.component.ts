import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { Validation } from '@ngx-validate/core';
import { comparePasswords, validatePassword } from '@ngx-validate/validators';

const { minLength, required, requiredTrue } = Validators;

const PASSWORD_FIELDS = ['password', 'repeat'];

const mapErrorsFn: Validation.MapErrorsFn = (errors, groupErrors, control) => {
  if (!PASSWORD_FIELDS.find(field => field === control.name)) return errors;

  return errors.concat(groupErrors.filter(({ key }) => key === 'passwordMismatch'));
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  form: UntypedFormGroup;

  mapErrorsFn: Validation.MapErrorsFn = mapErrorsFn;

  get username(): AbstractControl {
    return this.form.controls.username;
  }

  constructor(private fb: UntypedFormBuilder) {
    this.form = this.fb.group({
      credentials: this.fb.group(
        {
          username: [
            '',
            {
              validators: [required, minLength(3)],
            },
          ],
          ...PASSWORD_FIELDS.reduce(
            (acc, key) => ({
              ...acc,
              [key]: [
                '',
                {
                  validators: [
                    required,
                    minLength(6),
                    validatePassword(['small', 'capital', 'number']),
                  ],
                },
              ],
            }),
            {},
          ),
        },
        {
          validators: [comparePasswords(PASSWORD_FIELDS)],
        },
      ),
      consent: [
        false,
        {
          validators: [requiredTrue],
        },
      ],
    });
  }
  submit(ngForm: FormGroupDirective) {
    if (this.form.invalid) return;
    console.log('Form value:', this.form.value);
    ngForm.resetForm();
  }
}

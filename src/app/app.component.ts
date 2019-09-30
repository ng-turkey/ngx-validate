import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  comparePasswords,
  validatePassword,
  Validation,
} from '@ngx-validate/core';

const { minLength, required, requiredTrue } = Validators;

const PASSWORD_FIELDS = ['password', 'repeat'];

const mapErrorsFn: Validation.MapErrorsFn = (errors, groupErrors, control) => {
  if (PASSWORD_FIELDS.indexOf(control.name) < 0) return errors;

  return errors.concat(
    groupErrors.filter(({ key }) => key === 'passwordMismatch'),
  );
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  form: FormGroup;

  mapErrorsFn: Validation.MapErrorsFn = mapErrorsFn;

  get username(): AbstractControl {
    return this.form.controls.username;
  }

  constructor(private fb: FormBuilder) {
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
}

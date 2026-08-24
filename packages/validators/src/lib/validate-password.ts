import { AbstractControl, ValidatorFn } from '@angular/forms';
import { addCommas, normalizeDiacritics } from '@ngx-validate/core';
import { PasswordRules } from './password-rules';

export function validatePassword(
  shouldContain: PasswordRules = ['small', 'capital', 'number', 'special'],
): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;

    const value = normalizeDiacritics(control.value);

    const regex = {
      small: /.*[a-z].*/,
      capital: /.*[A-Z].*/,
      number: /.*[0-9].*/,
      special: /.*[^0-9a-zA-Z].*/,
    };

    const missing: string[] = shouldContain.filter(key => !regex[key].test(value));

    return missing.length
      ? {
          invalidPassword: {
            missing,
            description: addCommas(
              missing.map(
                key =>
                  ({
                    small: 'a small letter',
                    capital: 'a capital',
                    number: 'a number',
                    special: 'a special character',
                  }[key] || key),
              ),
            ),
          },
        }
      : null;
  };
}

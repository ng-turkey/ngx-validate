import { AbstractControl, ValidatorFn } from '@angular/forms';
import { addCommas, normalizeDiacritics } from '../utils';

export function comparePasswords([controlName1, controlName2]: string[]): ValidatorFn {
  return (group: AbstractControl) => {
    const password: string = group.get(controlName1)?.value;
    const repeat: string = group.get(controlName2)?.value;

    return !password || !repeat || password === repeat
      ? null
      : {
          passwordMismatch: {
            fields: [controlName1, controlName2],
          },
        };
  };
}

export type PasswordRules = ('small' | 'capital' | 'number' | 'special')[];

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
                  }[key] as string),
              ),
            ),
          },
        }
      : null;
  };
}

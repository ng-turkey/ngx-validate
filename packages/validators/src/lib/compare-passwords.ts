import { AbstractControl, ValidatorFn } from '@angular/forms';

export function comparePasswords([controlName1, controlName2]: string[]): ValidatorFn {
  return (group: AbstractControl) => {
    if (!group) return null;

    const password = group.get(controlName1)?.value;
    const repeat = group.get(controlName2)?.value;

    return !password || !repeat || password === repeat
      ? null
      : {
          passwordMismatch: {
            fields: [controlName1, controlName2],
          },
        };
  };
}

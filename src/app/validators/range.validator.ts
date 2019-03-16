import { AbstractControl, ValidatorFn } from '@angular/forms';

export function rangeValidator(minValue: number, maxValue: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value < minValue || control.value > maxValue) {
      return { range: true };
    }
    return null;
  };
}

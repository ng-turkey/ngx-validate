import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TrackByFunction,
  ViewEncapsulation,
} from '@angular/core';
import { Validation } from '@ngx-validate/shared/models';

@Component({
  selector: 'validation-error',
  template: `
    <div *ngFor="let error of errors; trackBy: trackByFn" class="invalid-feedback">
      {{ error.message }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [NgFor],
})
export class ValidationErrorComponent {
  validationErrors: Validation.Error[];

  trackByFn: TrackByFunction<Validation.Error> = (_, item) => item.key;

  get errors(): Validation.Error[] {
    return this.validationErrors || [];
  }
}

import { ChangeDetectionStrategy, Component, Inject, TrackByFunction, ViewEncapsulation } from '@angular/core';
import { Validation } from '../models';

@Component({
  selector: 'validation-error',
  template: `
    <div *ngFor="let error of errors; trackBy: trackByFn" class="invalid-feedback">{{ error.message }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ValidationErrorComponent {
  trackByFn: TrackByFunction<string> = (_, item) => item;

  constructor(
    @Inject('VALIDATION_ERRORS')
    public errors: Validation.Error[],
  ) {}
}

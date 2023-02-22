import { InjectionToken } from '@angular/core';
import { Validation } from '@ngx-validate/shared/models';

export const VALIDATION_BLUEPRINTS = new InjectionToken<Validation.Blueprints>(
  'validation.blueprints',
);

import { InjectionToken } from '@angular/core';
import { Validation } from '../models';

export const VALIDATION_MAP_ERRORS_FN = new InjectionToken<Validation.MapErrorsFn>('validation.map.errors.fn');

import { InjectionToken, TemplateRef, Type } from '@angular/core';

export const VALIDATION_ERROR_TEMPLATE = new InjectionToken<TemplateRef<any> | Type<any>>('validation.error.template');

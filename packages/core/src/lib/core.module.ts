import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AbstractValidationDirective } from './abstracts/abstract-validation.directive';
import { ValidationErrorComponent } from './components/validation-error.component';
import { BLUEPRINTS } from './constants/blueprints';
import { ValidationContainerDirective } from './directives/validation-container.directive';
import { ValidationGroupDirective } from './directives/validation-group.directive';
import { ValidationStyleDirective } from './directives/validation-style.directive';
import { ValidationTargetDirective } from './directives/validation-target.directive';
import { ValidationDirective } from './directives/validation.directive';
import { Validation } from './models/validation.model';
import { VALIDATION_BLUEPRINTS } from './tokens/blueprints.token';
import { VALIDATION_ERROR_TEMPLATE } from './tokens/error-template.token';
import { VALIDATION_INVALID_CLASSES } from './tokens/invalid-classes.token';
import { VALIDATION_MAP_ERRORS_FN } from './tokens/map-errors-fn.token';
import { VALIDATION_TARGET_SELECTOR } from './tokens/target-selector.token';
import { VALIDATION_VALIDATE_ON_SUBMIT } from './tokens/validate-on-submit.token';
import { defaultMapErrorsFn } from './utils/mappers';
import { SKIP_VALIDATION } from './tokens';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [
    ValidationContainerDirective,
    ValidationGroupDirective,
    ValidationStyleDirective,
    ValidationTargetDirective,
    ValidationDirective,
  ],
  declarations: [
    ValidationErrorComponent,
    AbstractValidationDirective,
    ValidationContainerDirective,
    ValidationGroupDirective,
    ValidationStyleDirective,
    ValidationTargetDirective,
    ValidationDirective,
  ],
})
export class NgxValidateCoreModule {
  static forRoot(config = {} as Validation.Config): ModuleWithProviders<NgxValidateCoreModule> {
    return {
      ngModule: NgxValidateCoreModule,
      providers: [
        {
          provide: VALIDATION_BLUEPRINTS,
          useValue: config.blueprints || BLUEPRINTS,
        },
        {
          provide: VALIDATION_ERROR_TEMPLATE,
          useValue: config.errorTemplate || ValidationErrorComponent,
        },
        {
          provide: VALIDATION_INVALID_CLASSES,
          useValue: config.invalidClasses || 'is-invalid',
        },
        {
          provide: VALIDATION_MAP_ERRORS_FN,
          useValue: config.mapErrorsFn || defaultMapErrorsFn,
        },
        {
          provide: VALIDATION_TARGET_SELECTOR,
          useValue: config.targetSelector,
        },
        {
          provide: VALIDATION_VALIDATE_ON_SUBMIT,
          useValue: config.validateOnSubmit,
        },
        {
          provide: SKIP_VALIDATION,
          useValue: config.skipValidation || false,
        },
      ],
    };
  }
}

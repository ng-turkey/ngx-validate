import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validation } from './models';
import { ValidationErrorComponent } from './components/validation-error.component';

@NgModule({
  imports: [CommonModule],
  exports: [],
  declarations: [ValidationErrorComponent],
  entryComponents: [ValidationErrorComponent],
})
export class NgxValidateCoreModule {
  static forRoot(config = {} as Validation.Config): ModuleWithProviders {
    return {
      ngModule: NgxValidateCoreModule,
      providers: [
        {
          provide: 'VALIDATION_CONFIG',
          useValue: {
            blueprints: config.blueprints,
            errorTemplate: config.errorTemplate,
            invalidClasses: config.invalidClasses,
            mapErrorsFn: config.mapErrorsFn,
            targetSelector: config.targetSelector,
            validateOnSubmit: config.validateOnSubmit,
          },
        },
      ],
    };
  }
}

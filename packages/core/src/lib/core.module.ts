import { ModuleWithProviders, NgModule } from '@angular/core';
import { Validation } from './models';
import { BLUEPRINTS } from './constants';

@NgModule({
  declarations: [],
  imports: [],
  exports: [],
})
export class NgxValidateCoreModule {
  static forRoot(config = {} as Validation.Config): ModuleWithProviders {
    return {
      ngModule: NgxValidateCoreModule,
      providers: [
        {
          provide: 'VALIDATION_CONFIG',
          useValue: {
            blueprints: config.blueprints || BLUEPRINTS,
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

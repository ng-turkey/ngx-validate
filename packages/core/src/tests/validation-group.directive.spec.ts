import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator';
import { ValidationErrorComponent } from '../lib/components/validation-error.component';
import { BLUEPRINTS } from '../lib/constants';
import { ValidationGroupDirective } from '../lib/directives/validation-group.directive';
import {
  VALIDATION_BLUEPRINTS,
  VALIDATION_ERROR_TEMPLATE,
  VALIDATION_INVALID_CLASSES,
  VALIDATION_MAP_ERRORS_FN,
  VALIDATION_TARGET_SELECTOR,
  VALIDATION_VALIDATE_ON_SUBMIT,
} from '../lib/tokens';
import { defaultMapErrorsFn } from '../lib/utils/mappers';

describe('ValidationGroupDirective', () => {
  let spectator: SpectatorDirective<ValidationGroupDirective>;
  let directive: ValidationGroupDirective;
  let form: FormGroup;

  const createDirective = createDirectiveFactory({
    directive: ValidationGroupDirective,
    imports: [FormsModule, ReactiveFormsModule],
    providers: [
      {
        provide: VALIDATION_BLUEPRINTS,
        useValue: BLUEPRINTS,
      },
      {
        provide: VALIDATION_ERROR_TEMPLATE,
        useValue: ValidationErrorComponent,
      },
      {
        provide: VALIDATION_INVALID_CLASSES,
        useValue: 'is-invalid',
      },
      {
        provide: VALIDATION_MAP_ERRORS_FN,
        useValue: defaultMapErrorsFn,
      },
      {
        provide: VALIDATION_TARGET_SELECTOR,
        useValue: null,
      },
      {
        provide: VALIDATION_VALIDATE_ON_SUBMIT,
        useValue: false,
      },
    ],
  });

  describe('without parent', () => {
    beforeEach(() => {
      form = new FormGroup({
        name: new FormControl(null, { validators: [Validators.required] }),
      });
      spectator = createDirective('<form [formGroup]="form"></form>', {
        hostProps: { form },
      });

      directive = spectator.directive;
    });

    it('should be created', () => {
      expect(directive).toBeDefined();
    });

    it('should emit the value$ when the form value change', done => {
      directive.value$.subscribe(formRef => {
        expect(formRef.get('name').value).toEqual('test');
        done();
      });
      form.get('name').setValue('test');
    });

    it('should emit submit$ when the form submitted', done => {
      directive.submit$.subscribe(formRef => {
        expect(formRef).toEqual(form);
        done();
      });

      spectator.dispatchFakeEvent('form', 'submit');
    });

    it('should not call preventDefault on form submit', () => {
      form.get('name').setValue('test');

      const preventDefault = jasmine.createSpy('preventDefault');

      directive.elRef.nativeElement.onsubmit({ preventDefault });

      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('with parent', () => {
    it('should not emit submit$ when the directive have a parent instance', () => {
      const parentForm = new FormGroup({
        parentName: new FormControl(null, { validators: [Validators.required] }),
      });

      spectator = createDirective(
        '<form [formGroup]="parentForm"><div id="child-form" [formGroup]="form"></div></form>',
        {
          hostProps: { form, parentForm },
        },
      );

      directive = spectator.queryAll(ValidationGroupDirective)[1];

      spyOn(directive.cdRef, 'markForCheck');

      spectator.dispatchFakeEvent('#child-form', 'submit');
      spectator.detectChanges();

      expect(directive.cdRef.markForCheck).not.toHaveBeenCalled();
    });
  });
});

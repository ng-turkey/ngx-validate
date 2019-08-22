import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
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
import { TestValidationComponent } from './test-validation.component';

export interface UValidationGroupDirective {
  formGroup: FormGroupDirective;
  validationGroup: ValidationGroupDirective;
  component: TestValidationComponent;
  fixture: ComponentFixture<TestValidationComponent>;
}

describe('ValidationGroupDirective', function(this: UValidationGroupDirective) {
  describe('as a unit', () => {
    beforeEach(() => {
      TestBed.overrideComponent(TestValidationComponent, {
        set: {
          template: `
          <form [formGroup]="form">
            <input formControlName="name" />
            <button type="submit"></button>
          </form>
          `,
        },
      });

      TestBed.configureTestingModule({
        imports: [FormsModule, ReactiveFormsModule],
        declarations: [ValidationGroupDirective, TestValidationComponent],
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
      }).compileComponents();

      this.fixture = TestBed.createComponent(TestValidationComponent);
      this.component = this.fixture.componentInstance;
      this.formGroup = this.fixture.debugElement
        .query(By.directive(FormGroupDirective))
        .injector.get(FormGroupDirective);
      this.validationGroup = this.fixture.debugElement
        .query(By.directive(ValidationGroupDirective))
        .injector.get(ValidationGroupDirective);
      this.fixture.detectChanges();
    });

    it('should be created', () => {
      expect(this.validationGroup).not.toBeUndefined();
    });

    it('should have form group directive injected', () => {
      expect(this.validationGroup.groupRef).toEqual(this.formGroup);
    });

    it('should emit value$ on form value change', done => {
      this.validationGroup.value$.subscribe(form => {
        expect(form.get('name').value).toEqual('test');
        done();
      });
      this.component.form.get('name').setValue('test');
    });

    it('should emit submit$ on form submit', done => {
      this.validationGroup.submit$.subscribe(form => {
        expect(form).toEqual(this.component.form);
        done();
      });
      this.fixture.debugElement.nativeElement.querySelector('button').click();
    });

    it('should emit status$ on form status change', done => {
      this.validationGroup.status$.subscribe(form => {
        expect(form.valid).toBe(true);
        done();
      });
      this.component.form.get('name').setValue('John');
    });
  });
});

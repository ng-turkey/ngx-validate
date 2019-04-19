import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidationErrorComponent } from '../lib/components/validation-error.component';
import { BLUEPRINTS } from '../lib/constants';
import { defaultMapErrorsFn } from '../lib/utils/mappers';
import { By } from '@angular/platform-browser';
import { Validation } from '../lib/models';

export interface UValidationErrorComponent {
  component: ValidationErrorComponent;
  fixture: ComponentFixture<ValidationErrorComponent>;
  errors: Validation.Error[];
}

describe('ValidationErrorComponent', function(this: UValidationErrorComponent) {
  describe('as a unit', () => {
    this.errors = [
      { key: 'required', message: 'This field is required' },
      { key: 'requiredTrue', message: 'Must be checked' },
    ];

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ValidationErrorComponent],
        providers: [
          {
            provide: 'VALIDATION_CONFIG',
            useValue: {
              blueprints: BLUEPRINTS,
              errorTemplate: ValidationErrorComponent,
              invalidClasses: 'is-invalid',
              mapErrorsFn: defaultMapErrorsFn,
            },
          },
          {
            provide: 'VALIDATION_ERRORS',
            useValue: this.errors,
          },
        ],
      }).compileComponents();

      this.fixture = TestBed.createComponent(ValidationErrorComponent);
      this.component = this.fixture.componentInstance;
      this.fixture.detectChanges();
    });

    it('should be created', () => {
      expect(this.component).not.toBeUndefined();
    });

    it('should have invalid-feedback as class', () => {
      const el: HTMLElement = this.fixture.debugElement.query(By.css('div')).nativeElement;
      expect(el.className).toBe('invalid-feedback');
    });

    it('should have as many div elements as errors', () => {
      const elements = this.fixture.debugElement.queryAll(By.css('div'));
      expect(elements.length).toBe(this.errors.length);
    });

    it('should have div elements error message', () => {
      const textContents = this.fixture.debugElement
        .queryAll(By.css('div'))
        .map(el => (el.nativeElement as HTMLElement).textContent);

      expect(textContents).toEqual(this.errors.map(({ message }) => message));
    });
  });
});

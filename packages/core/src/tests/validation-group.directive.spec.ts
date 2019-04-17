import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick, async } from '@angular/core/testing';
import { TestValidationComponent } from './test-validation.component';
import { ValidationGroupDirective } from '../lib/directives/validation-group.directive';
import { FormsModule, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { BLUEPRINTS } from '../lib/constants';
import { ValidationErrorComponent } from '../lib/components/validation-error.component';
import { defaultMapErrorsFn } from '../lib/utils/mappers';
import { By } from '@angular/platform-browser';

export interface UValidationGroupDirective {
  formGroup: FormGroupDirective;
  validationGroup: ValidationGroupDirective;
  component: TestValidationComponent;
  fixture: ComponentFixture<TestValidationComponent>;
}

describe('ValidationGroupDirective', function(this: UValidationGroupDirective) {
  describe('implicitly', () => {
    beforeEach(async(() => {
      TestBed.overrideComponent(TestValidationComponent, {
        set: {
          template: `
          <form [formGroup]="form">
            <input type="text" formControlName="name" />
          </form>
          `,
        },
      });

      TestBed.configureTestingModule({
        imports: [FormsModule, ReactiveFormsModule],
        declarations: [ValidationGroupDirective, TestValidationComponent],
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
    }));

    it('should be created', () => {
      expect(this.validationGroup).not.toBeUndefined();
    });

    it('should have form group directive injected', () => {
      expect(this.validationGroup.groupRef).toEqual(this.formGroup);
    });

    // it('should be value$ emitted on change value', done => {
    //   this.component.form.get('name').setValue('testing');
    //   console.log(this.component.form.get('name').value);
    //   this.validationGroup.value$.subscribe(res => {
    //     console.log(res);
    //     expect(this.component.form.get('name').value).toEqual('testing');
    //     done();
    //   });
    // });

    // it('should be value$ emitted on change value', done => {
    //   this.component.form.get('name').setValue('test');
    //   this.validationGroup.submit$.subscribe(res => {
    //     done();
    //   });
    //   // this.validationGroup.submit$.next(this.component.form);
    //   (this.component.formRef.nativeElement as HTMLFormElement).submit();
    //   expect(this.validationGroup).toBeTruthy();
    // });

    // it('should have empty string as dispose', () => {
    //   expect(this.disposer.dispose).toBe('');
    // });

    // it('should call ngOnChanges on init', () => {
    //   spyOn(this.disposer, 'ngOnChanges');
    //   this.fixture.detectChanges();

    //   expect(this.disposer.ngOnChanges).toHaveBeenCalledTimes(1); // because, let-context
    // });

    // it('should call ngOnChanges on reset$', () => {
    //   this.fixture.detectChanges();

    //   spyOn(this.disposer, 'ngOnChanges');
    //   this.provider.reset$.next();

    //   expect(this.disposer.ngOnChanges).toHaveBeenCalledTimes(1);
    // });

    // it('should not call ngOnChanges on reset$ if provider not found', () => {
    //   this.disposer['provider'] = null;
    //   this.fixture.detectChanges();

    //   spyOn(this.disposer, 'ngOnChanges');
    //   this.provider.reset$.next();

    //   expect(this.disposer.ngOnChanges).toHaveBeenCalledTimes(0);
    // });

    // it('should dispose property when provided', () => {
    //   const prop: keyof TestProviderComponent = 'target';

    //   this.provider.provide = prop;
    //   this.provider.reset$.next();
    //   this.provider.change$.next(prop);

    //   this.fixture.detectChanges();

    //   expect(this.element.innerText).toBe(this.provider.component[prop]);
    // });
  });

  // describe('explicitly', () => {
  //   beforeEach(() => {
  //     this.provider = new ContextProviderComponent(({
  //       _view: { component: new TestProviderComponent() },
  //     } as any) as ChangeDetectorRef);

  //     TestBed.overrideComponent(TestDisposerComponent, {
  //       set: {
  //         template: `
  //           <ng-template [contextDisposer]="provided" let-target="target">
  //             {{ target }}
  //           </ng-template>
  //         `,
  //       },
  //     });

  //     TestBed.configureTestingModule({
  //       declarations: [ValidationGroupDirective, TestDisposerComponent],
  //     }).compileComponents();

  //     this.fixture = TestBed.createComponent(TestDisposerComponent);
  //     this.element = this.fixture.nativeElement;
  //     this.disposer = this.fixture.componentInstance.disposer;
  //     this.disposer['provider'] = this.provider as any;
  //   });

  //   it('should dispose property when provided', () => {
  //     const prop: keyof TestProviderComponent = 'target';

  //     this.provider.provide = prop;
  //     this.provider.reset$.next();
  //     this.provider.change$.next(prop);

  //     this.fixture.detectChanges();

  //     expect(this.element.innerText).toBe(this.provider.component[prop]);
  //   });

  //   it('should not dispose when provided property is not disposed', () => {
  //     this.fixture.componentInstance.provided = 'test';

  //     const prop: keyof TestProviderComponent = 'target';

  //     this.provider.provide = prop;
  //     this.provider.reset$.next();
  //     this.provider.change$.next(prop);

  //     this.fixture.detectChanges();

  //     expect(this.element.innerText).toBe('');
  //   });
  // });
});

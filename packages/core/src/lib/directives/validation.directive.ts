import {
  AfterViewInit,
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  EmbeddedViewRef,
  inject,
  Injector,
  OnDestroy,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UntypedFormGroup, FormGroupDirective, NgControl, ValidationErrors } from '@angular/forms';
import { generateValidationError } from '@ngx-validate/shared/utils';
import { merge, Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AbstractValidationDirective } from '../abstracts';
import { Validation } from '@ngx-validate/shared/models';
import { ValidationContainerDirective } from './validation-container.directive';
import { ValidationGroupDirective } from './validation-group.directive';
import { ValidationStyleDirective } from './validation-style.directive';
import { ValidationTargetDirective } from './validation-target.directive';
import { ValidationErrorComponent } from '../components';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[formControl],[formControlName]',
  exportAs: 'validationDirective',
  standalone: true,
})
export class ValidationDirective
  extends AbstractValidationDirective
  implements AfterViewInit, OnDestroy
{
  private errorRef: ComponentRef<ValidationErrorComponent> | EmbeddedViewRef<unknown>;
  private markElement: HTMLElement;
  private isSubmitted = false;
  private subscriptions = new Subscription();

  get validation$(): Observable<UntypedFormGroup> {
    return merge(
      this.parent.getStream('status').pipe(map(() => null)),
      this.parent.getStream('value').pipe(map(() => null)),
      this.parent.getStream('submit'),
    );
  }

  parentRef: ValidationGroupDirective = inject(ValidationGroupDirective, {
    skipSelf: true,
  });

  private injector = inject(Injector);
  private cdRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private control: NgControl = inject(NgControl, { self: true });
  private renderer: Renderer2 = inject(Renderer2);
  private vcRef: ViewContainerRef = inject(ViewContainerRef);

  private markRef: ValidationStyleDirective = inject(ValidationStyleDirective, {
    optional: true,
    skipSelf: true,
  });

  private targetRef: ValidationTargetDirective = inject(ValidationTargetDirective, {
    optional: true,
    skipSelf: true,
  });

  private containerRef: ValidationContainerDirective = inject(ValidationContainerDirective, {
    optional: true,
  });

  private formGroupDirective: FormGroupDirective = inject(FormGroupDirective, {
    optional: true,
  });

  private buildErrors(errors: ValidationErrors): Validation.Error[] {
    return Object.keys(errors || {}).map(key =>
      generateValidationError(key, errors[key], this.blueprints[key]),
    );
  }

  private insertErrorClasses() {
    this.renderer.addClass(this.markElement, this.invalidClasses);
  }

  private insertErrors(this: ValidationDirective, errors: Validation.Error[]): void {
    const template = this.errorTemplate;
    const targetRef = this.containerRef ? this.containerRef.targetRef : this.targetRef;
    const vcRef = targetRef ? targetRef.vcRef : this.vcRef;

    this.errorRef =
      template instanceof TemplateRef
        ? vcRef.createEmbeddedView(template, { $implicit: errors }, vcRef.length)
        : vcRef.createComponent(template, { index: vcRef.length, injector: this.injector });

    if (this.errorRef instanceof ComponentRef && this.errorRef.instance)
      this.errorRef.instance.validationErrors = errors;
  }

  private removeErrorClasses() {
    this.renderer.removeClass(this.markElement, this.invalidClasses);
  }

  private removeErrors(): void {
    if (this.errorRef) {
      this.errorRef.destroy();
      this.errorRef = null;
    }
  }

  private setMarkElement(): void {
    this.markElement =
      (this.markRef
        ? this.markRef.elRef.nativeElement
        : this.targetSelector
        ? this.elRef.nativeElement.closest(this.targetSelector)
        : null) || this.elRef.nativeElement;
  }

  private shouldValidate(errors: Validation.Error[]) {
    return errors.length && this.control.dirty && (!this.validateOnSubmit || this.isSubmitted);
  }

  private subscribeToValidation(): void {
    let cached: string;

    this.subscriptions.add(
      this.validation$
        .pipe(
          filter(() => !this.skipValidation),
          tap(form => {
            if (form && this.formGroupDirective.submitted) {
              this.control.control.markAsDirty();
              this.isSubmitted = true;
            }
          }),
          map(() =>
            this.mapErrorsFn(
              this.buildErrors(this.control.errors),
              this.buildErrors((this.parentRef.group || ({} as UntypedFormGroup)).errors),
              this.control,
            ),
          ),
        )
        .subscribe(errors => {
          if (cached === JSON.stringify(errors)) return;

          this.removeErrors();

          if (this.shouldValidate(errors)) {
            this.insertErrors(errors);
            if (!cached) this.insertErrorClasses();
            cached = JSON.stringify(errors);
          } else {
            this.removeErrorClasses();
            cached = '';
          }

          this.cdRef.markForCheck();
        }),
    );
  }

  ngAfterViewInit() {
    this.setMarkElement();
    this.subscribeToValidation();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

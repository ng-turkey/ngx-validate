import {
  AfterViewInit,
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  EmbeddedViewRef,
  Injector,
  OnDestroy,
  Optional,
  Renderer2,
  Self,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UntypedFormGroup, FormGroupDirective, NgControl, ValidationErrors } from '@angular/forms';
import { EMPTY, merge, Observable, Subscription } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';
import { AbstractValidationDirective } from '../abstracts';
import { ValidationErrorComponent } from '../components';
import { Validation } from '../models';
import { generateValidationError } from '../utils';
import { ValidationContainerDirective } from './validation-container.directive';
import { ValidationGroupDirective } from './validation-group.directive';
import { ValidationStyleDirective } from './validation-style.directive';
import { ValidationTargetDirective } from './validation-target.directive';

@Directive({
  /* tslint:disable-next-line */
  selector: '[formControl],[formControlName]',
  exportAs: 'validationDirective',
})
export class ValidationDirective
  extends AbstractValidationDirective
  implements AfterViewInit, OnDestroy
{
  private errorRef: ComponentRef<ValidationErrorComponent> | EmbeddedViewRef<any>;
  private markElement: HTMLElement;
  private isSubmitted = false;

  get validation$(): Observable<UntypedFormGroup> {
  if (!this.parentRef) return EMPTY;
  return merge(
      this.parent.getStream('status').pipe(mapTo(null)),
      this.parent.getStream('value').pipe(mapTo(null)),
      this.parent.getStream('submit'),
    );
  }

  private subscriptions = new Subscription();

  constructor(
    public injector: Injector,
    private cdRef: ChangeDetectorRef,
    @Self() private control: NgControl,
    private renderer: Renderer2,
    private vcRef: ViewContainerRef,
    @Optional() @SkipSelf() public parentRef: ValidationGroupDirective,
    @Optional() @SkipSelf() private markRef: ValidationStyleDirective,
    @Optional() @SkipSelf() public targetRef: ValidationTargetDirective,
    @Optional() private containerRef: ValidationContainerDirective,
    @Optional() private formGroupDirective: FormGroupDirective,
  ) {
    super(injector);
  }

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
      (this.errorRef as ComponentRef<any>).instance.validationErrors = errors;
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

import {
  AfterViewInit,
  ComponentFactoryResolver,
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
import { FormGroup, NgControl, ValidationErrors } from '@angular/forms';
import { merge, Observable, Subscription } from 'rxjs';
import { filter, map, mapTo } from 'rxjs/operators';
import { AbstractValidationDirective } from '../abstracts';
import { ValidationErrorComponent } from '../components';
import { Validation } from '../models';
import { generateValidationError } from '../utils';
import { ValidationGroupDirective } from './validation-group.directive';
import { ValidationStyleDirective } from './validation-style.directive';
import { ValidationTargetDirective } from './validation-target.directive';

@Directive({
  /* tslint:disable-next-line */
  selector: '[formControl],[formControlName]',
})
export class ValidationDirective extends AbstractValidationDirective
  implements AfterViewInit, OnDestroy {
  private errorRef: ComponentRef<ValidationErrorComponent> | EmbeddedViewRef<any>;
  private markElement: HTMLElement;
  private isSubmitted = false;

  get validation$(): Observable<FormGroup> {
    return merge(
      this.parent.getStream('status').pipe(mapTo(null)),
      this.parent.getStream('value').pipe(mapTo(null)),
      this.validateOnSubmit ? this.parent.getStream('submit') : NEVER,
    );
  }

  private subscriptions = new Subscription();

  constructor(
    public injector: Injector,
    private cfRes: ComponentFactoryResolver,
    @Self()
    private control: NgControl,
    private renderer: Renderer2,
    private vcRef: ViewContainerRef,
    @SkipSelf()
    public parentRef: ValidationGroupDirective,
    @Optional()
    @SkipSelf()
    private markRef: ValidationStyleDirective,
    @Optional()
    @SkipSelf()
    private targetRef: ValidationTargetDirective,
  ) {
    super(injector);
  }

  private buildErrors(errors: ValidationErrors): Validation.Error[] {
    return Object.keys(errors || {}).map(key =>
      generateValidationError(key, errors[key], this.blueprints[key]),
    );
  }

  private insertErrors(errors: Validation.Error[]): void {
    const template = this.errorTemplate;
    const vcRef = this.targetRef ? this.targetRef.vcRef : this.vcRef;

    this.errorRef =
      template instanceof TemplateRef
        ? vcRef.createEmbeddedView(template, { $implicit: errors }, vcRef.length)
        : vcRef.createComponent(
            this.cfRes.resolveComponentFactory(template),
            vcRef.length,
            this.injector,
          );

    if (this.errorRef instanceof ComponentRef && this.errorRef.instance)
      (this.errorRef as ComponentRef<any>).instance.validationErrors = errors;
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

  private subscribeToValidation(): void {
    let cached: string;

    this.subscriptions.add(
      this.validation$
        .pipe(
          filter(() => !this.skipValidation),
          map(form => ({
            errors: this.mapErrorsFn(
              this.buildErrors(this.control.errors),
              this.buildErrors(this.parentRef.group.errors),
              this.control,
            ),
            form,
          })),
        )
        .subscribe(({ errors, form }) => {
          if (cached === JSON.stringify(errors)) return;

          this.removeErrors();

          if (errors.length && (this.control.dirty || form)) {
            this.insertErrors(errors);
            this.renderer.addClass(this.markElement, this.invalidClasses);
            cached = JSON.stringify(errors);
          } else {
            this.renderer.removeClass(this.markElement, this.invalidClasses);
            cached = '';
          }
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

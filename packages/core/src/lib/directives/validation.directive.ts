import {
  AfterViewInit,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  EmbeddedViewRef,
  Injector,
  Optional,
  Renderer2,
  Self,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
  Type,
  Input,
} from '@angular/core';
import { FormGroup, NgControl, ValidationErrors } from '@angular/forms';
import { AbstractValidationDirective } from '../abstracts';
import { ValidationGroupDirective } from './validation-group.directive';
import { ValidationStyleDirective } from './validation-style.directive';
import { ValidationTargetDirective } from './validation-target.directive';
import { ValidationErrorComponent } from '../components';
import { Validation } from '../models';
import { generateValidationError, takeUntilDestroy } from '../utils';
import { Observable, never, merge } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Directive({
  selector: '[formControl],[formControlName]',
})
export class ValidationDirective extends AbstractValidationDirective implements AfterViewInit {
  private errorRef: ComponentRef<ValidationErrorComponent> | EmbeddedViewRef<any>;
  private markElement: HTMLElement;

  @Input('blueprints')
  _blueprints: Validation.Blueprints;

  @Input('errorTemplate')
  _errorTemplate: TemplateRef<any> | Type<any>;

  @Input('invalidClasses')
  _invalidClasses: string;

  @Input('mapErrorsFn')
  _mapErrorsFn: Validation.MapErrorsFn;

  @Input('skipValidation')
  _skipValidation: boolean;

  @Input('targetSelector')
  _targetSelector: string;

  @Input('validateOnSubmit')
  _validateOnSubmit: boolean;

  get validation$(): Observable<FormGroup> {
    return merge(
      this.parent.getStream('status').pipe(mapTo(null)),
      this.parent.getStream('value').pipe(mapTo(null)),
      this.validateOnSubmit ? this.parent.getStream('submit') : never(),
    );
  }

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
    return Object.keys(errors || {}).map(key => generateValidationError(key, errors[key], this.blueprints[key]));
  }

  private insertErrors(): void {
    const errors = this.mapErrorsFn(
      this.buildErrors(this.control.errors),
      this.buildErrors(this.parentRef.group.errors),
      this.control,
    );

    const template = this.errorTemplate;
    const vcRef = this.targetRef ? this.targetRef.vcRef : this.vcRef;

    this.errorRef =
      template instanceof TemplateRef
        ? vcRef.createEmbeddedView(template, { $implicit: errors }, vcRef.length)
        : vcRef.createComponent(this.cfRes.resolveComponentFactory(template), vcRef.length, this.injector);

    if (this.errorRef instanceof ComponentRef && this.errorRef.instance) {
      (this.errorRef as ComponentRef<any>).instance.validationErrors = errors;
    }
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
    this.validation$.pipe(takeUntilDestroy(this)).subscribe(form => {
      if (this.skipValidation) return;

      this.removeErrors();

      if (this.control.invalid && (this.control.dirty || form)) {
        this.insertErrors();

        this.renderer.addClass(this.markElement, this.invalidClasses);
      } else {
        this.renderer.removeClass(this.markElement, this.invalidClasses);
      }
    });
  }

  ngAfterViewInit(): void {
    this.setMarkElement();
    this.subscribeToValidation();
  }
}

import { Directive, ElementRef, Injector, Input, OnDestroy, TemplateRef, Type } from '@angular/core';
import { FormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { Validation } from '../models';
import { BLUEPRINTS } from '../constants';
import { defaultMapErrorsFn, evalPropTruthy } from '../utils';
import { ValidationErrorComponent } from '../components';
import { Observable, ReplaySubject, merge, never } from 'rxjs';
import { ValidationGroupDirective } from '../directives/validation-group.directive';

@Directive({
  selector: 'abstract-validation-directive',
})
export class AbstractValidationDirective implements OnDestroy {
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

  get group(): FormGroup {
    return (this.groupRef || ({} as FormGroupDirective)).form || (this.groupName || ({} as FormGroupName)).control;
  }

  get parent(): Partial<ValidationGroupDirective> {
    return this.parentRef || { getStream: () => null };
  }

  get blueprints(): Validation.Blueprints {
    return {
      ...BLUEPRINTS,
      ...(this._blueprints || this.parent.blueprints || this.config.blueprints || {}),
    };
  }

  get errorTemplate(): TemplateRef<any> | Type<any> {
    return this._errorTemplate || this.parent.errorTemplate || this.config.errorTemplate;
  }

  get invalidClasses(): string {
    return this._invalidClasses || this.parent.invalidClasses || this.config.invalidClasses;
  }

  get mapErrorsFn(): Validation.MapErrorsFn {
    return this._mapErrorsFn || this.parent.mapErrorsFn || this.config.mapErrorsFn;
  }

  get skipValidation(): boolean {
    return evalPropTruthy(this._skipValidation) || this.parent.skipValidation || this.config.skipValidation;
  }

  get targetSelector(): string {
    return this._targetSelector || this.parent.targetSelector || this.config.targetSelector;
  }

  get validateOnSubmit(): boolean {
    return evalPropTruthy(this._validateOnSubmit) || this.parent.validateOnSubmit || this.config.validateOnSubmit;
  }

  public config: Validation.Config;
  public elRef: ElementRef;
  public groupName: FormGroupName;
  public groupRef: FormGroupDirective;
  public parentRef: ValidationGroupDirective;
  constructor(public injector: Injector) {
    this.config = {
      errorTemplate: ValidationErrorComponent,
      invalidClasses: 'is-invalid',
      mapErrorsFn: defaultMapErrorsFn,
      ...(injector.get('VALIDATION_CONFIG') || {}),
    };
    this.elRef = injector.get(ElementRef);
  }

  getStream = (streamName: Validation.StreamName): Observable<FormGroup> =>
    merge(
      this[streamName + '$'] ? (this[streamName + '$'] as ReplaySubject<FormGroup>).asObservable() : never(),
      this.parent.getStream(streamName) || never(),
    );

  ngOnDestroy() {}
}

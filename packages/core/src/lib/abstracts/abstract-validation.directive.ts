import {
  Directive,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  TemplateRef,
  Type,
} from '@angular/core';
import { UntypedFormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { merge, NEVER, Observable, ReplaySubject } from 'rxjs';
import { BLUEPRINTS } from '../constants';
import { ValidationGroupDirective } from '../directives/validation-group.directive';
import { Validation } from '../models';
import {
  SKIP_VALIDATION,
  VALIDATION_BLUEPRINTS,
  VALIDATION_ERROR_TEMPLATE,
  VALIDATION_INVALID_CLASSES,
  VALIDATION_MAP_ERRORS_FN,
  VALIDATION_TARGET_SELECTOR,
  VALIDATION_VALIDATE_ON_SUBMIT,
} from '../tokens';
import { evalPropTruthy } from '../utils';

@Directive({
  /* tslint:disable-next-line */
  selector: 'abstractValidationDirective',
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

  get group(): UntypedFormGroup {
    return (
      (this.groupRef || ({} as FormGroupDirective)).form ||
      (this.groupName || ({} as FormGroupName)).control
    );
  }

  get parent(): Partial<ValidationGroupDirective> {
    return this.parentRef || { getStream: () => null };
  }

  get blueprints(): Validation.Blueprints {
    return {
      ...BLUEPRINTS,
      ...(this.config.blueprints || {}),
      ...(this.parent.blueprints || {}),
      ...(this._blueprints || {}),
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
    return (
      evalPropTruthy(this._skipValidation) ||
      this.parent.skipValidation ||
      this.config.skipValidation
    );
  }

  get targetSelector(): string {
    return this._targetSelector || this.parent.targetSelector || this.config.targetSelector;
  }

  get validateOnSubmit(): boolean {
    return (
      evalPropTruthy(this._validateOnSubmit) ||
      this.parent.validateOnSubmit ||
      this.config.validateOnSubmit
    );
  }

  config: Validation.Config;
  elRef: ElementRef;
  groupName: FormGroupName;
  groupRef: FormGroupDirective;
  parentRef: ValidationGroupDirective;
  constructor(public injector: Injector) {
    this.config = {
      blueprints: injector.get(VALIDATION_BLUEPRINTS),
      errorTemplate: injector.get(VALIDATION_ERROR_TEMPLATE),
      invalidClasses: injector.get(VALIDATION_INVALID_CLASSES),
      mapErrorsFn: injector.get(VALIDATION_MAP_ERRORS_FN),
      targetSelector: injector.get(VALIDATION_TARGET_SELECTOR),
      validateOnSubmit: injector.get(VALIDATION_VALIDATE_ON_SUBMIT),
      skipValidation: injector.get(SKIP_VALIDATION),
    };
    this.elRef = injector.get(ElementRef);
  }

  getStream(streamName: Validation.StreamName): Observable<UntypedFormGroup> {
    return merge(
      this[streamName + '$']
        ? (this[streamName + '$'] as ReplaySubject<UntypedFormGroup>).asObservable()
        : NEVER,
      this.parent.getStream(streamName) || NEVER,
    );
  }

  ngOnDestroy() {}
}

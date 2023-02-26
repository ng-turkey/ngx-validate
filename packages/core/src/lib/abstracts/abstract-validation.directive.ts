import { Directive, ElementRef, inject, Input, OnDestroy, TemplateRef, Type } from '@angular/core';
import { UntypedFormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { Validation } from '@ngx-validate/shared/models';
import { evalPropTruthy } from '@ngx-validate/shared/utils';
import { merge, NEVER, Observable, ReplaySubject } from 'rxjs';
import { BLUEPRINTS } from '../constants';
import { ValidationGroupDirective } from '../directives/validation-group.directive';
import { NgxValidateErrorComponent } from '../models';
import {
  VALIDATION_BLUEPRINTS,
  VALIDATION_ERROR_TEMPLATE,
  VALIDATION_INVALID_CLASSES,
  VALIDATION_MAP_ERRORS_FN,
  VALIDATION_TARGET_SELECTOR,
  VALIDATION_VALIDATE_ON_SUBMIT,
} from '../tokens';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'abstractValidationDirective',
  standalone: true,
})
export class AbstractValidationDirective implements OnDestroy {
  @Input('blueprints')
  _blueprints: Validation.Blueprints;

  @Input('errorTemplate')
  _errorTemplate: TemplateRef<unknown> | Type<NgxValidateErrorComponent>;

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

  get errorTemplate(): TemplateRef<unknown> | Type<NgxValidateErrorComponent> {
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

  config: Validation.Config = {
    blueprints: inject(VALIDATION_BLUEPRINTS),
    errorTemplate: inject(VALIDATION_ERROR_TEMPLATE),
    invalidClasses: inject(VALIDATION_INVALID_CLASSES),
    mapErrorsFn: inject(VALIDATION_MAP_ERRORS_FN),
    targetSelector: inject(VALIDATION_TARGET_SELECTOR),
    validateOnSubmit: inject(VALIDATION_VALIDATE_ON_SUBMIT),
  };
  elRef: ElementRef = inject(ElementRef);

  groupName?: FormGroupName;
  groupRef?: FormGroupDirective;
  parentRef?: ValidationGroupDirective;

  getStream(streamName: Validation.StreamName): Observable<UntypedFormGroup> {
    return merge(
      this[streamName + '$']
        ? (this[streamName + '$'] as ReplaySubject<UntypedFormGroup>).asObservable()
        : NEVER,
      this.parent.getStream(streamName) || NEVER,
    );
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnDestroy() {
    return;
  }
}

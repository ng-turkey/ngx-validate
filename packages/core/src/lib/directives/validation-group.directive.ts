import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  Injector,
  Input,
  Optional,
  Self,
  SkipSelf,
  TemplateRef,
  Type,
} from '@angular/core';
import { FormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { AbstractValidationDirective } from '../abstracts';
import { Validation } from '../models';
import { takeUntilDestroy } from '../utils';

@Directive({
  /* tslint:disable-next-line */
  selector: "[formGroup],[formGroupName]"
})
export class ValidationGroupDirective extends AbstractValidationDirective
  implements AfterViewInit {
  status$ = new ReplaySubject<FormGroup>(1);
  submit$ = new ReplaySubject<FormGroup>(1);
  value$ = new ReplaySubject<FormGroup>(1);

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

  constructor(
    public injector: Injector,
    public cdRef: ChangeDetectorRef,
    @Optional()
    @Self()
    public groupName: FormGroupName,
    @Optional()
    @Self()
    public groupRef: FormGroupDirective,
    @Optional()
    @SkipSelf()
    public parentRef: ValidationGroupDirective,
  ) {
    super(injector);
  }

  ngAfterViewInit() {
    if (!this.parentRef)
      (this.elRef.nativeElement as HTMLFormElement).onsubmit = event => {
        if (this.group.invalid) event.preventDefault();

        this.submit$.next(this.group);
        this.cdRef.markForCheck();
      };

    this.group.statusChanges.pipe(takeUntilDestroy(this)).subscribe(() => {
      this.status$.next(this.group);
      this.cdRef.markForCheck();
    });

    this.group.valueChanges.pipe(takeUntilDestroy(this)).subscribe(() => {
      this.value$.next(this.group);
      this.cdRef.markForCheck();
    });
  }
}

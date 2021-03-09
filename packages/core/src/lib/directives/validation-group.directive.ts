import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  Injector,
  Input,
  OnDestroy,
  Optional,
  Self,
  SkipSelf,
  TemplateRef,
  Type,
} from '@angular/core';
import { FormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { ReplaySubject, Subscription } from 'rxjs';
import { AbstractValidationDirective } from '../abstracts';
import { Validation } from '../models';

@Directive({
  /* tslint:disable-next-line */
  selector: '[formGroup],[formGroupName]',
  exportAs: 'validationGroup',
})
export class ValidationGroupDirective extends AbstractValidationDirective
  implements AfterViewInit, OnDestroy {
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

  private subs = new Subscription();

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

  private subscribeToFormSubmit() {
    (this.elRef.nativeElement as HTMLFormElement).onsubmit = event => {
      if (this.group.invalid) event.preventDefault();
      this.submit$.next(this.group);
      this.cdRef.markForCheck();
    };
  }

  private subscribeToStatusChanges() {
    this.subs.add(
      this.group.statusChanges.subscribe(() => {
        this.status$.next(this.group);
        this.cdRef.markForCheck();
      }),
    );
  }

  private subscribeToValueChanges() {
    this.subs.add(
      this.group.valueChanges.subscribe(() => {
        this.value$.next(this.group);
        this.cdRef.markForCheck();
      }),
    );
  }

  ngAfterViewInit() {
    if (!this.parentRef) this.subscribeToFormSubmit();
    this.subscribeToStatusChanges();
    this.subscribeToValueChanges();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

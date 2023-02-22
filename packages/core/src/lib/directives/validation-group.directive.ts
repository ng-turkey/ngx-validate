import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  Injector,
  OnDestroy,
  Optional,
  Self,
  SkipSelf,
} from '@angular/core';
import { UntypedFormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { ReplaySubject, Subscription } from 'rxjs';
import { AbstractValidationDirective } from '../abstracts';

@Directive({
  /* tslint:disable-next-line */
  selector: '[formGroup],[formGroupName]',
  exportAs: 'validationGroup',
})
export class ValidationGroupDirective extends AbstractValidationDirective
  implements AfterViewInit, OnDestroy {
  status$ = new ReplaySubject<UntypedFormGroup>(1);
  submit$ = new ReplaySubject<UntypedFormGroup>(1);
  value$ = new ReplaySubject<UntypedFormGroup>(1);

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

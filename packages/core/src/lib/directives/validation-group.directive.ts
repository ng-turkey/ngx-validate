import { AfterViewInit, ChangeDetectorRef, Directive, inject, OnDestroy } from '@angular/core';
import { UntypedFormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { ReplaySubject, Subscription } from 'rxjs';
import { AbstractValidationDirective } from '../abstracts';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[formGroup],[formGroupName]',
  exportAs: 'validationGroup',
  standalone: true,
})
export class ValidationGroupDirective
  extends AbstractValidationDirective
  implements AfterViewInit, OnDestroy
{
  status$ = new ReplaySubject<UntypedFormGroup>(1);
  submit$ = new ReplaySubject<UntypedFormGroup>(1);
  value$ = new ReplaySubject<UntypedFormGroup>(1);

  readonly cdRef = inject(ChangeDetectorRef);
  readonly groupName? = inject(FormGroupName, { optional: true, self: true });
  readonly groupRef? = inject(FormGroupDirective, { optional: true, self: true });
  readonly parentRef? = inject(ValidationGroupDirective, { optional: true, skipSelf: true });

  private subs = new Subscription();

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

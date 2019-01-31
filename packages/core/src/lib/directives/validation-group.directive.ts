import { AfterViewInit, ChangeDetectorRef, Directive, Injector, Optional, Self, SkipSelf } from '@angular/core';
import { FormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { AbstractValidationDirective } from '../abstracts';
import { takeUntilDestroy } from '../utils';
import { ReplaySubject } from 'rxjs';

@Directive({
  selector: '[formGroup],[formGroupName]',
})
export class ValidationGroupDirective extends AbstractValidationDirective implements AfterViewInit {
  status$ = new ReplaySubject<FormGroup>(1);
  submit$ = new ReplaySubject<FormGroup>(1);
  value$ = new ReplaySubject<FormGroup>(1);

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
    if (!this.parentRef) {
      (this.elRef.nativeElement as HTMLFormElement).onsubmit = event => {
        if (this.group.invalid) {
          event.preventDefault();
        }

        this.submit$.next(this.group);
        this.cdRef.markForCheck();
      };
    }

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

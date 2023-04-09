/* eslint-disable max-classes-per-file */
import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxValidateCoreModule } from '../core.module';
import { FormBuilder } from '@angular/forms';
import { ValidationGroupDirective } from './validation-group.directive';

@Component({
  template: `
    <form [formGroup]="formGroup" (ngSubmit)="formSubmit.emit($event)">
      <input formControlName="foo" />
      <input formControlName="bar" />
      <button #submitButton type="submit">-</button>
    </form>
  `,
})
class HostComponent {
  @ViewChild(ValidationGroupDirective, { static: true }) directive: ValidationGroupDirective;
  @ViewChild('submitButton', { read: ElementRef }) submitButton: ElementRef<HTMLButtonElement>;

  @Output() formSubmit = new EventEmitter<unknown>();

  readonly formGroup = inject(FormBuilder).group({
    foo: '',
    bar: '',
  });

  submit() {
    this.submitButton.nativeElement.click();
  }
}

describe('ValidationGroupDirective', () => {
  let component: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxValidateCoreModule.forRoot(), ReactiveFormsModule],
      declarations: [HostComponent],
    });

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fixture.detectChanges();
  });

  it('should prevent submit event when the form is invalid', () => {
    const { formSubmit, formGroup } = component;

    const spy = jest.spyOn(formSubmit, 'emit');
    [formGroup.get('foo'), formGroup.get('bar')].forEach(control =>
      control.setValidators([Validators.minLength(5)]),
    );
    formGroup.setValue({
      foo: '1',
      bar: '123',
    });
    fixture.detectChanges();

    expect(spy).not.toBeCalled();
  });

  it('should emit status$ when changes', () => {
    const spy = jest.spyOn(component.directive.status$, 'next');

    [component.formGroup.get('foo'), component.formGroup.get('bar')].forEach(control =>
      control.setValidators([Validators.required]),
    );
    component.formGroup.updateValueAndValidity();

    fixture.detectChanges();

    expect(spy).toBeCalledWith(component.formGroup);
    expect(spy).toBeCalledTimes(1);
  });

  it('should emit submit$ when form is submitted', () => {
    const spy = jest.spyOn(component.directive.submit$, 'next');

    component.formGroup.setValue({
      foo: 'foo1',
      bar: 'bar1',
    });
    component.submit();

    fixture.detectChanges();

    expect(spy).toBeCalledWith(component.formGroup);
    expect(spy).toBeCalledTimes(1);
  });
  it('should emit value$', () => {
    const spy = jest.spyOn(component.directive.value$, 'next');

    component.formGroup.setValue({
      foo: 'foo1',
      bar: 'bar1',
    });

    component.formGroup.updateValueAndValidity();

    fixture.detectChanges();

    expect(spy).toBeCalledWith(component.formGroup);
  });

  it('should unsubscribe', () => {
    Reflect.get(component.directive, 'subs');

    const spy = jest.spyOn(Reflect.get(component.directive, 'subs'), 'unsubscribe');

    component.directive.ngOnDestroy();

    expect(spy).toBeCalled();
  });
});

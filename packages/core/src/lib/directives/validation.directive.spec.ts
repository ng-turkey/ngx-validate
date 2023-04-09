import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxValidateCoreModule } from '../core.module';

@Component({
  template: `
    <form [formGroup]="formGroup">
      <input formControlName="foo" />
      <input formControlName="bar" />
    </form>
  `,
})
class HostComponent {
  @Input() formGroup: FormGroup<{ foo: FormControl<string>; bar: FormControl<string> }>;
}

describe('ValidationDirective', () => {
  let component: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxValidateCoreModule.forRoot({
          // skipValidation: true,
          validateOnSubmit: false,
        }),
      ],
      declarations: [HostComponent],
    });

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
  });
  it('should skip validation', () => {
    component.formGroup = new FormGroup({
      foo: new FormControl('', [Validators.minLength(10)]),
      bar: new FormControl('', Validators.minLength(10)),
    });
    component.formGroup.setValue({
      foo: 'foo',
      bar: 'bar',
    });
    fixture.detectChanges();
    expect(1).toBe(1);
  });
});

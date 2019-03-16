import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { BrowserModule, By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { AppComponent } from '../app/app.component';
import { AppRoutingModule } from '../app/app-routing.module';
import {
  NgxValidateCoreModule,
  ValidationStyleDirective,
  ValidationTargetDirective,
  ValidationErrorComponent,
  Validation,
} from '../../packages/core/src/public_api';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, NgxValidateCoreModule.forRoot()],
      declarations: [AppComponent],
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should contain validationStyle directive', fakeAsync(() => {
    // Arrange
    const directive = fixture.debugElement.query(By.directive(ValidationStyleDirective));

    // Act
    tick();

    // Assert
    expect(directive).toBeTruthy();
  }));

  it('should contain validationTarget directive', fakeAsync(() => {
    // Arrange
    const directive = fixture.debugElement.query(By.directive(ValidationTargetDirective));

    // Act
    tick();

    // Assert
    expect(directive).toBeTruthy();
  }));

  it('should show errors when form is invalid', fakeAsync(() => {
    // Arrange
    const { password } = getFormControls(component.form);
    const debug: DebugElement = fixture.debugElement;
    const button: DebugElement = debug.query(By.css('button[type="submit"]'));

    // Act
    password.setValue('123');
    button.nativeElement.click();
    tick();
    fixture.detectChanges();

    // Arrange
    const feedback: ValidationErrorComponent = debug.query(By.css('#password')).parent.query(By.css('validation-error'))
      .componentInstance;

    // Assert
    expect(feedback instanceof ValidationErrorComponent).toBeTruthy();
  }));

  it('should show errors value not in given range', fakeAsync(() => {
    // Arrange
    const { count } = getFormControls(component.form);
    const debug: DebugElement = fixture.debugElement;
    const button: DebugElement = debug.query(By.css('button[type="submit"]'));

    // Act
    count.setValue(5);
    button.nativeElement.click();
    tick();
    fixture.detectChanges();

    // Arrange
    const feedback: ValidationErrorComponent = debug.query(By.css('#count')).parent.query(By.css('validation-error'))
      .componentInstance;

    // Assert
    expect(feedback instanceof ValidationErrorComponent).toBeTruthy();
  }));

  it('should contain expected errors', fakeAsync(() => {
    // Arrange
    const { password } = getFormControls(component.form);
    const debug: DebugElement = fixture.debugElement;
    const button: DebugElement = debug.query(By.css('button[type="submit"]'));

    // Act
    password.setValue('123');
    button.nativeElement.click();
    tick();
    fixture.detectChanges();

    // Arrange
    const feedback: ValidationErrorComponent = debug.query(By.css('#password')).parent.query(By.css('validation-error'))
      .componentInstance;

    const FEEDBACKS = {
      minlength: 'Min. 6 characters are required. (has 3)',
      invalidPassword: 'Password should include a small letter and a capital.',
    };
    const errors: boolean[] = feedback.errors.map((error: Validation.Error) => FEEDBACKS[error.key] === error.message);

    // Assert
    expect(errors.filter(Boolean).length).toBe(errors.length);
  }));

  it('should contain no errors when form is valid', fakeAsync(() => {
    // Arrange
    const { consent, password, repeat, username, count } = getFormControls(component.form);
    const debug: DebugElement = fixture.debugElement;
    const button: DebugElement = debug.query(By.css('button[type="submit"]'));
    const PASSWORD = '159Aa&1q';
    const USERNAME = 'ghost';
    const COUNT = 12;

    // Act
    username.setValue(USERNAME);
    password.setValue(PASSWORD);
    repeat.setValue(PASSWORD);
    consent.setValue(true);
    count.setValue(COUNT);

    button.nativeElement.click();
    tick();
    fixture.detectChanges();

    // Arrange
    const feedback: DebugElement = debug.query(By.css('#password')).parent.query(By.css('validation-error'));

    // Assert
    expect(feedback).toBeFalsy();
  }));
});

function getFormControls(form: FormGroup): { [key: string]: AbstractControl } {
  const { consent } = form.controls;
  const { password, repeat, username, count } = (form.controls.credentials as FormGroup).controls;
  return {
    consent,
    password,
    repeat,
    username,
    count,
  };
}

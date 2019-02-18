import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
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
    const validationStyle = fixture.debugElement.query(By.directive(ValidationStyleDirective));

    // Act
    tick();

    // Assert
    expect(validationStyle).toBeTruthy();
  }));

  it('should contain validationTarget directive', fakeAsync(() => {
    // Arrange
    const validationTarget = fixture.debugElement.query(By.directive(ValidationTargetDirective));

    // Act
    tick();

    // Assert
    expect(validationTarget).toBeTruthy();
  }));

  it('should show errors when form is invalid', fakeAsync(() => {
    // Arrange
    const form = component.form as FormGroup;
    const { password } = (form.controls.credentials as FormGroup).controls;
    const debug = fixture.debugElement;
    const button = debug.query(By.css('button[type="submit"]'));

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

  it('should contain expected errors', fakeAsync(() => {
    // Arrange
    const form = component.form as FormGroup;
    const { password } = (form.controls.credentials as FormGroup).controls;
    const debug = fixture.debugElement;
    const button = debug.query(By.css('button[type="submit"]'));

    // Act
    password.setValue('123');
    button.nativeElement.click();
    tick();
    fixture.detectChanges();

    // Arrange
    const feedback: ValidationErrorComponent = debug.query(By.css('#password')).parent.query(By.css('validation-error'))
      .componentInstance;

    const FEEDBACKS = [
      'Min. 6 characters are required. (has 3)',
      'Password should include a small letter and a capital.',
    ];
    let errors: boolean[] = feedback.errors.map(
      (error: Validation.Error, index: number) => FEEDBACKS[index] === error.message,
    );

    // Assert
    expect(errors.filter(Boolean).length).toBe(errors.length);
  }));
});

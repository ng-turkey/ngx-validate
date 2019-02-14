import { TestBed, ComponentFixture } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AppComponent } from '../app/app.component';
import { AppRoutingModule } from '../app/app-routing.module';
import { NgxValidateCoreModule } from '../../packages/core/src/public_api';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, NgxValidateCoreModule.forRoot()],
      declarations: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should create form and set default values', () => {
    expect(component.form).toBeDefined();
    const { credentials, consent } = component.form.controls;
    const { username, password, repeat } = (credentials as FormGroup).controls;
    username.setValue('username');
    password.setValue('1234');
    repeat.setValue('1234');
    consent.setValue(true);

    expect(username.value).toMatch('username');
    expect(password.value).toEqual(repeat.value);

    expect(component.form.valid).toBeFalsy();
    expect(password.errors.invalidPassword).toBeTruthy();
    expect(password.errors.minlength.actualLength < password.errors.minlength.requiredLength).toBeTruthy();
  });

  it('form should be valid', () => {
    expect(component.form).toBeDefined();
    const { credentials, consent } = component.form.controls;
    const { username, password, repeat } = (credentials as FormGroup).controls;
    username.setValue('username');
    password.setValue('1234aA');
    repeat.setValue('1234aA');
    consent.setValue(true);

    expect(username.value).toMatch('username');
    expect(password.value).toEqual(repeat.value);

    expect(component.form.valid).toBeTruthy();
  });
});

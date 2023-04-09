import { ValidationErrorComponent } from './validation-error.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NgxValidateCoreModule } from '../core.module';

describe('ValidationErrorComponent', () => {
  let component: ValidationErrorComponent;
  let fixture: ComponentFixture<ValidationErrorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, NgxValidateCoreModule, ValidationErrorComponent],
    });

    fixture = TestBed.createComponent(ValidationErrorComponent);
    component = fixture.componentInstance;
  });

  it('should display error messages', () => {
    component.validationErrors = [
      {
        key: 'foo',
        message: 'fooMessage',
      },
      {
        key: 'bar',
        message: 'barMessage',
      },
    ];
    fixture.detectChanges();

    const errorMessageNodes: NodeListOf<HTMLDivElement> =
      fixture.nativeElement.querySelectorAll('div');

    expect(errorMessageNodes.length).toBe(2);
    expect(errorMessageNodes.item(0).textContent).toMatch(/fooMessage/);
    expect(errorMessageNodes.item(1).textContent).toMatch(/barMessage/);
  });

  it('should render nothing if errors property is empty', () => {
    component.validationErrors = [];
    fixture.detectChanges();

    const errorMessageNodes: NodeListOf<HTMLDivElement> =
      fixture.nativeElement.querySelectorAll('*');

    expect(errorMessageNodes.length).toBe(0);
  });
});

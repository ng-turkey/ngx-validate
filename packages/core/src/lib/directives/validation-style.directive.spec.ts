import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxValidateCoreModule } from '../core.module';
import { ValidationStyleDirective } from './validation-style.directive';

@Component({
  template: '<div validationStyle data-testid="styleElm"></div>',
})
class HostComponent {
  @ViewChild(ValidationStyleDirective, { static: true })
  validationStyleDirective: ValidationStyleDirective;
}

describe('ValidationStyleDirective', () => {
  let component: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxValidateCoreModule],
      declarations: [HostComponent],
    });

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
  });

  it('should have a validation style elementRef', () => {
    fixture.detectChanges();

    const { elRef } = component.validationStyleDirective;

    expect(component.validationStyleDirective.elRef).toBeDefined();
    expect((<HTMLElement>elRef.nativeElement).getAttribute('data-testid')).toBe('styleElm');
  });
});

import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxValidateCoreModule } from '../core.module';
import { ValidationTargetDirective } from './validation-target.directive';

@Component({
  template: '<div validationTarget data-testid="targetElm"></div>',
})
class HostComponent {
  @ViewChild(ValidationTargetDirective, { static: true })
  validationTargetDirective: ValidationTargetDirective;
}

describe('ValidationTargetDirective', () => {
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

    const { vcRef } = component.validationTargetDirective;

    expect(vcRef).toBeDefined();
  });
});

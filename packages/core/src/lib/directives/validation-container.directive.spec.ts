import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxValidateCoreModule } from '../core.module';
import { ValidationContainerDirective } from './validation-container.directive';

@Component({
  template: `
    <div validationContainer>
      <div validationTarget>I am the target</div>
    </div>
  `,
})
class HostComponent {
  @ViewChild(ValidationContainerDirective, { static: true })
  validationContainerDirective: ValidationContainerDirective;
}

describe('ValidationContainerDirective', () => {
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

  it('should have a validation target', () => {
    fixture.detectChanges();
    expect(component.validationContainerDirective.targetRef).toBeDefined();
  });
});

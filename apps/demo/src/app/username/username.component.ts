import { ChangeDetectionStrategy, Component, Optional, SkipSelf } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory(dependency?: any) {
        return dependency;
      },
      deps: [[new Optional(), new SkipSelf(), ControlContainer]],
    },
  ],
})
export class UsernameComponent {}

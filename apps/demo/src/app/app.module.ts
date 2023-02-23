import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CheckMeOutComponent } from './check-me-out/check-me-out.component';
import { PasswordRepeatComponent } from './password-repeat/password-repeat.component';
import { PasswordComponent } from './password/password.component';
import { UsernameComponent } from './username/username.component';

@NgModule({
  declarations: [
    CheckMeOutComponent,
    PasswordRepeatComponent,
    PasswordComponent,
    UsernameComponent,
    AppComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, NgxValidateCoreModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

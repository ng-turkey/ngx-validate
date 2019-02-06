# NgxValidate

<p align="center">
  <img src="https://img.shields.io/github/license/ng-turkey/ngx-validate.svg" />
  <img src="https://img.shields.io/twitter/follow/ngTurkiye.svg?label=Follow"/>
</p>

This project is still a work-in-progress and, although it works fine, it should be used with caution.

## Live demo

[Stackblitz Example](https://stackblitz.com/edit/ngx-validate)

## Installation
```bash
yarn add @ngx-validate/core
```
or
```bash
npm install @ngx-validate/core
```

## Usage
Import core module to your main module as follows:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxValidateCoreModule } from '../../packages/core/src/public_api';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, NgxValidateCoreModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

``` 
## Roadmap

- [x] Dynamic display of validation errors

- [x] Support for error blueprints with parameters

- [x] Separate directives to mark style and render targets in DOM

- [x] Meaningful defaults, instant start

- [x] Flexible configuration on module, form group, and form control level

- [x] Permissive license (MIT)

- [ ] Usage documentation

- [ ] GitHub Pages implementation

- [ ] Issue submission template

- [ ] Contribution documentation

- [ ] Tests


## Sponsors

<a href="https://www.etiya.com/" target="_blank"><img src="https://www.etiya.com/images/home/1216/large/39285.png"></a>

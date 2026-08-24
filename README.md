# NgxValidate

Dynamic, configurable, painless display of validation errors for Angular reactive forms.

NgxValidate watches your reactive forms and automatically renders validation error messages next to your inputs — no `*ngIf="control.errors?.required"` boilerplate, no manually sprinkled `<div class="error">` blocks. You keep writing plain Angular validators; NgxValidate takes care of showing the right message, in the right place, at the right time.

## Live demo

[Stackblitz Example](https://stackblitz.com/edit/ngx-validate)

The examples in this document are taken from that demo, so you can follow along with a running app.

### Tailwind CSS example

[Stackblitz Tailwind Example](https://stackblitz.com/~/github.com/mahmut-gundogdu/ngx-validate-tailwind-example)

NgxValidate is not tied to Bootstrap — it only deals in class names and CSS selectors, so it works with any styling approach. This example is the same sign-up form restyled with Tailwind CSS: `invalidClasses` is set to a single semantic class (`field-invalid`), and the inputs react to it with Tailwind's `group-[.field-invalid]:` variants — no custom CSS at all. A step-by-step walkthrough is in the [Tailwind tutorial](docs/tailwind-demo/README.md).

## Features

- 🪄 **Zero-boilerplate templates** — directives attach themselves to `[formGroup]`, `[formGroupName]`, `[formControl]`, and `[formControlName]`; your form template stays clean.
- 🧩 **Error blueprints with parameters** — message templates like `Min. {{ requiredLength }} characters are required.` interpolate the params of Angular's `ValidationErrors` automatically.
- 🎨 **Custom error templates** — render errors with your own component or `ng-template`.
- 🎯 **Precise placement and styling** — mark where errors appear (`validationTarget`) and which element gets the invalid class (`validationStyle`), or use a CSS selector.
- 🔀 **Error mapping** — reshape or reroute errors (e.g. show a group-level `passwordMismatch` error under specific inputs) with a `mapErrorsFn`.
- ⚙️ **Three-level configuration cascade** — configure once at the module level, override per form group or per control.
- 📤 **Validate on submit** — optionally suppress messages until the user submits the form.
- 🔑 **Bundled validators** — `validatePassword` and `comparePasswords` for common password rules.
- 📜 Permissive MIT license.

## Installation

```bash
npm install @ngx-validate/core
```

or

```bash
yarn add @ngx-validate/core
```

**Peer dependencies:** `@angular/common`, `@angular/core`, `@angular/forms` (>= 5.0.0) and `rxjs` (>= 6.0.0).

## Quick start

Import the core module in your root module with `forRoot()`:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxValidateCoreModule } from '@ngx-validate/core';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxValidateCoreModule.forRoot(), // sensible defaults, instant start
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Build a form as you normally would:

```ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

const { required, minLength } = Validators;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  form: FormGroup = this.fb.group({
    username: [null, [required, minLength(3)]],
  });

  constructor(private fb: FormBuilder) {}

  submit() {
    if (!this.form.valid) return;
    console.log(this.form.value);
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="submit()" novalidate>
  <div class="form-group">
    <label for="username">Username</label>
    <input formControlName="username" id="username" type="text" class="form-control" />
  </div>
  <button class="btn btn-primary">Submit</button>
</form>
```

That's it. When the user touches the username field and leaves it empty, _"This field is required."_ appears right after the input, and the input receives the `is-invalid` CSS class (Bootstrap-friendly by default). No extra markup was needed.

## How it works

Understanding the moving parts makes the rest of the API obvious:

1. **Directives attach automatically.** `ValidationGroupDirective` binds to every `[formGroup]` and `[formGroupName]`, and `ValidationDirective` binds to every `[formControl]` and `[formControlName]` in templates compiled within a module that imports `NgxValidateCoreModule`. You never add them by hand.

2. **The group directive exposes streams.** For each form group, three streams are maintained: `status`, `value`, and `submit`. Nested `formGroupName` directives forward their parent's streams, so a deeply nested control still hears about the top-level form's submission.

3. **Each control reacts to those streams.** On every status change, value change, or submit, the control's `ValidationErrors` (and its parent group's errors) are converted into `Validation.Error` objects — `{ key, params, message }` — using the [blueprints](#error-blueprints) to produce the message. Your [`mapErrorsFn`](#mapping-errors-with-maperrorsfn) then gets a chance to reshape the list.

4. **Errors are rendered, not just tracked.** When a control is invalid _and_ dirty (and, with [`validateOnSubmit`](#validate-on-submit), only after submission), the error template — a component or an `ng-template` — is instantiated next to the input, or into the element you marked with `validationTarget`, or into the closest element matching `targetSelector`. At the same time the invalid class (default `is-invalid`) is added to the input, or to the element marked with `validationStyle`. When the control becomes valid, both are removed.

5. **Submitting marks everything dirty.** When an invalid form is submitted, the default browser submission is prevented, all controls are marked dirty, and every pending error becomes visible at once.

6. **Configuration cascades.** Every option can be set in three places, and the closest one wins:

   **control-level input → parent group input → module `forRoot()` config → built-in defaults**

## Configuration

Pass a `Validation.Config` object to `forRoot()`:

```ts
NgxValidateCoreModule.forRoot({
  blueprints: {
    invalidUsername: 'The username "{{ value }}" is taken.',
  },
  errorTemplate: ErrorComponent,
  targetSelector: '.form-group',
});
```

All options, all optional:

| Option             | Type                             | Default                                  | Description                                                                                                    |
| ------------------ | -------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `blueprints`       | `{ [errorKey: string]: string }` | [built-in blueprints](#error-blueprints) | Message templates per error key. Merged over the built-in defaults, so you only add or override what you need. |
| `errorTemplate`    | `Type<any> \| TemplateRef<any>`  | `ValidationErrorComponent`               | Component class or template used to render the error messages.                                                 |
| `invalidClasses`   | `string`                         | `'is-invalid'`                           | CSS class added to the invalid element (Bootstrap-compatible out of the box).                                  |
| `mapErrorsFn`      | `Validation.MapErrorsFn`         | returns control errors as-is             | Hook to filter, transform, or merge control and group errors before display.                                   |
| `skipValidation`   | `boolean`                        | `false`                                  | Disables validation display entirely.                                                                          |
| `targetSelector`   | `string`                         | `undefined`                              | CSS selector; errors are appended to the closest ancestor of the input matching it (e.g. `'.form-group'`).     |
| `validateOnSubmit` | `boolean`                        | `false`                                  | Shows errors only after the form has been submitted, instead of as soon as a control becomes dirty.            |

### The configuration cascade

Every option above is also available as a directive input on any form group or individual control, letting you override the module-wide setting exactly where you need to:

```html
<!-- override for a whole form -->
<form [formGroup]="form" [invalidClasses]="'has-error'" validateOnSubmit>
  <!-- override for one nested group -->
  <div formGroupName="credentials" [mapErrorsFn]="mapErrorsFn">
    <!-- override for a single control -->
    <input formControlName="username" [skipValidation]="usernameCheckDisabled" />
  </div>
</form>
```

Boolean options (`validateOnSubmit`, `skipValidation`) can be used as attribute-style flags: `<form validateOnSubmit>` is equivalent to `[validateOnSubmit]="true"`.

## Error blueprints

A blueprint is a message template keyed by the error key your validator returns. Params of the error object are interpolated with `{{ param }}` syntax.

Built-in blueprints cover Angular's standard validators plus the two bundled password validators:

| Error key          | Message                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `email`            | Please enter a valid email address.                                         |
| `max`              | Max. value should be {{ max }}. ({{ actual }} entered)                      |
| `maxlength`        | Max. {{ requiredLength }} characters are allowed. (has {{ actualLength }})  |
| `min`              | Min. value should be {{ min }}. ({{ actual }} entered)                      |
| `minlength`        | Min. {{ requiredLength }} characters are required. (has {{ actualLength }}) |
| `pattern`          | Invalid pattern. Please review your input.                                  |
| `required`         | This field is required.                                                     |
| `passwordMismatch` | Passwords do not match.                                                     |
| `invalidPassword`  | Password should include {{ description }}.                                  |

### Custom blueprints

Add a blueprint for every custom error key you produce. The params you place in the error object are available for interpolation:

```ts
// a validator returning a custom error with params
return {
  invalidUsername: {
    value, // 👈 available as {{ value }} in the blueprint
  },
};
```

```ts
NgxValidateCoreModule.forRoot({
  blueprints: {
    invalidUsername: 'The username "{{ value }}" is taken.',
  },
});
```

Your custom blueprints are merged over the defaults — `required`, `minlength`, and friends keep working.

Blueprints can also be overridden per group or per control through the cascade:

```html
<div formGroupName="credentials" [blueprints]="{ required: 'Please fill this in.' }"></div>
```

## Custom error template

By default, errors render through the built-in `ValidationErrorComponent`, which outputs one `<div class="invalid-feedback">` per error. To change the markup, provide your own.

### With a component

Extend `ValidationErrorComponent` and provide your own template — `errors` and `trackByFn` come from the base class:

```ts
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ValidationErrorComponent } from '@ngx-validate/core';

@Component({
  selector: 'app-error',
  template: `
    <div class="invalid-feedback font-weight-bold" *ngFor="let error of errors; trackBy: trackByFn">
      {{ error.message }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ErrorComponent extends ValidationErrorComponent {}
```

```ts
NgxValidateCoreModule.forRoot({
  errorTemplate: ErrorComponent,
});
```

> ℹ️ On Angular versions using View Engine (≤ 8), remember to add the component to your module's `entryComponents`. With Ivy this is unnecessary.

### With an `ng-template`

An `errorTemplate` may also be a `TemplateRef`. The list of errors is passed as the implicit template context:

```html
<ng-template #errorsTpl let-errors>
  <small class="text-danger" *ngFor="let error of errors">{{ error.message }}</small>
</ng-template>

<form [formGroup]="form" [errorTemplate]="errorsTpl">...</form>
```

Each error is a `Validation.Error`:

```ts
interface Error {
  key: string; // e.g. 'minlength'
  params?: ParamMap; // e.g. { requiredLength: 6, actualLength: 3 }
  message?: string; // the interpolated blueprint
}
```

## Placing and styling errors

Three tools control **where** errors appear and **what** gets styled as invalid. Without any of them, errors are inserted right after the input and the input itself receives the invalid class.

### `targetSelector` — CSS-based placement

The easiest option when your form has a consistent wrapper structure. Errors are appended to the closest ancestor matching the selector, which also becomes the styled element:

```ts
NgxValidateCoreModule.forRoot({
  targetSelector: '.form-group',
});
```

```html
<div class="form-group">
  <label for="username">Username</label>
  <input formControlName="username" id="username" class="form-control" />
  <!-- errors appear here, at the end of .form-group -->
</div>
```

### `validationTarget` — explicit render target

Marks the exact element errors should be rendered into, overriding `targetSelector` for that spot:

```html
<div class="form-check" validationTarget>
  <input formControlName="consent" type="checkbox" class="form-check-input" />
  <label class="form-check-label">You must accept our terms 🙂</label>
  <!-- errors appear here, inside .form-check -->
</div>
```

### `validationStyle` — explicit style target

Marks the element that should receive the invalid class (instead of the input):

```html
<div class="form-group" validationStyle>
  <!-- this div gets the is-invalid class when the control inside is invalid -->
  <div class="form-check" validationTarget>
    <input formControlName="consent" type="checkbox" class="form-check-input" />
    <label class="form-check-label">You must accept our terms 🙂</label>
  </div>
</div>
```

### `validationContainer` — group placement for multiple controls

When several controls should push their errors to one shared spot, wrap them with `validationContainer` and mark the shared target inside it:

```html
<div validationContainer>
  <input formControlName="day" />
  <input formControlName="month" />
  <input formControlName="year" />
  <div validationTarget><!-- all three controls render their errors here --></div>
</div>
```

## Mapping errors with `mapErrorsFn`

`mapErrorsFn` runs before errors are displayed and receives three arguments: the control's own errors, its parent group's errors, and the control itself. Whatever it returns is what gets rendered.

The classic use case: a cross-field validator puts `passwordMismatch` on the **group**, but you want the message under the password inputs. From the demo:

```ts
import { Validation } from '@ngx-validate/core';

mapErrorsFn: Validation.MapErrorsFn = (errors, groupErrors, control) =>
  ['password', 'repeat'].indexOf(control.name as string) < 0
    ? errors
    : errors.concat(groupErrors.filter(({ key }) => key === 'passwordMismatch'));
```

```html
<div formGroupName="credentials" [mapErrorsFn]="mapErrorsFn">
  <input formControlName="password" type="password" />
  <input formControlName="repeat" type="password" />
</div>
```

Now _"Passwords do not match."_ appears under both password fields, even though the error lives on the group.

You can also use `mapErrorsFn` to filter errors (e.g. show only the first), reword messages dynamically, or merge additional context.

## Validate on submit

By default, a control shows its errors as soon as it is **dirty** (the user changed it). If you prefer to keep the form quiet until the user actually tries to submit, add `validateOnSubmit`:

```html
<form [formGroup]="form" (ngSubmit)="submit()" validateOnSubmit novalidate></form>
```

On submission of an invalid form, every control is marked dirty and all errors appear at once. Like every option, this can also be set globally in `forRoot()`.

## Built-in validators

Two password-focused validators ship with the library.

> 🚧 **Planned:** these validators will move to a separate sub-package, `@ngx-validate/validators`, in a future release. See the [Todo](#todo) section.

### `validatePassword`

Checks that the value contains required character groups: `'small'`, `'capital'`, `'number'`, `'special'` (all four by default). The error it produces (`invalidPassword`) includes a human-readable `description` of what is missing, which the default blueprint uses:

```ts
import { validatePassword } from '@ngx-validate/core';

const validPassword = validatePassword(['small', 'capital', 'number']);

this.fb.group({
  password: [null, [Validators.required, Validators.minLength(6), validPassword]],
});
```

> _"Password should include a capital, a number."_ — generated automatically from the missing rules.

### `comparePasswords`

A group-level validator that adds a `passwordMismatch` error to the group when two controls differ:

```ts
import { comparePasswords } from '@ngx-validate/core';

this.fb.group(
  {
    password: [null, [required, minLength(6), validPassword]],
    repeat: [null, [required, minLength(6), validPassword]],
  },
  {
    validators: [comparePasswords(['password', 'repeat'])],
  },
);
```

Combine it with the [`mapErrorsFn` recipe above](#mapping-errors-with-maperrorsfn) to surface the message under the inputs.

## Async validators

NgxValidate has no concept of async validators — and that is the point. The library never talks to your validators directly; it only listens to the form's status and value changes and displays whatever errors end up on the controls. So the rule is simple: **if a validator works with Angular reactive forms, its errors show up — sync or async makes no difference.**

An async validator sets its errors on the control when its observable (or promise) resolves, the control's status changes, and NgxValidate renders the message exactly as it would for `required` or `minlength`. There is nothing to register, configure, or wrap.

As an example, the demo validates username availability against a (mock) server with a completely ordinary Angular `AsyncValidator`:

```ts
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AsyncUsernameValidator implements AsyncValidator {
  private cancel$ = new Subject<void>();

  constructor(private userService: UserService) {}

  validate({ value }: AbstractControl): Observable<ValidationErrors | null> {
    this.cancel$.next();
    if (!value) return null;

    return of(value).pipe(
      debounceTime(500),
      switchMap(username =>
        this.userService.validateUsername(username).pipe(
          takeUntil(this.cancel$),
          map(resp =>
            resp.operationResultCode === 'INVALID'
              ? { invalidUsername: { value } } // 👈 params for the blueprint
              : null,
          ),
        ),
      ),
    );
  }
}
```

Register a blueprint for the custom key and wire the validator in:

```ts
NgxValidateCoreModule.forRoot({
  blueprints: {
    invalidUsername: 'The username "{{ value }}" is taken.',
  },
});
```

```ts
username: [null, [required, minLength(3)], [this.usernameValidator]],
```

## i18n / localization recipe

Blueprints are plain strings, so localization boils down to providing translated blueprint objects. The `blueprints` you pass are merged over the defaults, so provide a **complete set** of translated messages for every key you use (including the built-in ones you want translated).

```ts
// blueprints/tr.ts
export const TR_BLUEPRINTS = {
  required: 'Bu alan zorunludur.',
  email: 'Lütfen geçerli bir e-posta adresi girin.',
  minlength: 'En az {{ requiredLength }} karakter gereklidir. ({{ actualLength }} girildi)',
  maxlength: 'En fazla {{ requiredLength }} karaktere izin verilir. ({{ actualLength }} girildi)',
  min: 'En küçük değer {{ min }} olmalıdır. ({{ actual }} girildi)',
  max: 'En büyük değer {{ max }} olmalıdır. ({{ actual }} girildi)',
  pattern: 'Geçersiz format. Lütfen girişinizi kontrol edin.',
  passwordMismatch: 'Şifreler eşleşmiyor.',
  invalidPassword: 'Şifre şunları içermelidir: {{ description }}.',
  invalidUsername: '"{{ value }}" kullanıcı adı alınmış.',
};
```

Pick the set for the active locale at bootstrap:

```ts
import { LOCALE_ID } from '@angular/core';
import { EN_BLUEPRINTS } from './blueprints/en';
import { TR_BLUEPRINTS } from './blueprints/tr';

const locale = localStorage.getItem('locale') || 'en';

@NgModule({
  imports: [
    NgxValidateCoreModule.forRoot({
      blueprints: locale === 'tr' ? TR_BLUEPRINTS : EN_BLUEPRINTS,
    }),
  ],
  providers: [{ provide: LOCALE_ID, useValue: locale }],
})
export class AppModule {}
```

If your translations come from a runtime translation service (e.g. ngx-translate or Transloco), you can instead override blueprints where the form lives, with already-translated strings:

```html
<form [formGroup]="form" [blueprints]="translatedBlueprints$ | async"></form>
```

## Putting it all together

The [live demo](https://stackblitz.com/edit/ngx-validate) combines everything above — custom blueprints, a custom error component, `targetSelector`, `validateOnSubmit`, `mapErrorsFn`, bundled password validators, and an async username check:

```ts
// app.module.ts
@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxValidateCoreModule.forRoot({
      blueprints: {
        invalidUsername: 'The username "{{ value }}" is taken.',
      },
      errorTemplate: ErrorComponent,
      targetSelector: '.form-group',
    }),
  ],
  declarations: [AppComponent, ErrorComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

```ts
// app.component.ts
export class AppComponent {
  form: FormGroup;

  mapErrorsFn: Validation.MapErrorsFn = (errors, groupErrors, control) =>
    ['password', 'repeat'].indexOf(control.name as string) < 0
      ? errors
      : errors.concat(groupErrors.filter(({ key }) => key === 'passwordMismatch'));

  constructor(
    private usernameValidator: AsyncUsernameValidator,
    private fb: FormBuilder,
  ) {
    const credentials = this.fb.group(
      {
        username: [null, [required, minLength(3)], [this.usernameValidator]],
        password: [null, [required, minLength(6), validPassword]],
        repeat: [null, [required, minLength(6), validPassword]],
      },
      { validators: [comparePasswords(['password', 'repeat'])] },
    );

    const consent = this.fb.control(false, [requiredTrue]);

    this.form = this.fb.group({ credentials, consent });
  }

  submit() {
    if (!this.form.valid) return;
    console.log(this.form.value);
  }
}
```

```html
<!-- app.component.html -->
<form [formGroup]="form" (ngSubmit)="submit()" validateOnSubmit novalidate>
  <div formGroupName="credentials" [mapErrorsFn]="mapErrorsFn">
    <div class="form-group">
      <label for="username">Username</label>
      <input formControlName="username" id="username" type="text" class="form-control" />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input formControlName="password" id="password" type="password" class="form-control" />
    </div>
    <div class="form-group">
      <label for="repeat">Password Again</label>
      <input formControlName="repeat" id="repeat" type="password" class="form-control" />
    </div>
  </div>

  <div class="form-group" validationStyle>
    <div class="form-check" validationTarget>
      <input formControlName="consent" id="consent" type="checkbox" class="form-check-input" />
      <label for="consent" class="form-check-label">You must accept our terms 🙂</label>
    </div>
  </div>

  <button class="btn btn-primary">Submit</button>
</form>
```

## API summary

### Exported members

| Member                         | Kind      | Purpose                                                                                    |
| ------------------------------ | --------- | ------------------------------------------------------------------------------------------ |
| `NgxValidateCoreModule`        | NgModule  | `forRoot(config?)` at root; plain import in feature modules/SCAMs.                         |
| `ValidationErrorComponent`     | Component | Default error renderer; extend it for custom markup.                                       |
| `ValidationGroupDirective`     | Directive | Auto-attaches to `[formGroup]`, `[formGroupName]` (`exportAs: 'validationGroup'`).         |
| `ValidationDirective`          | Directive | Auto-attaches to `[formControl]`, `[formControlName]` (`exportAs: 'validationDirective'`). |
| `ValidationTargetDirective`    | Directive | `validationTarget` — marks the error render target.                                        |
| `ValidationStyleDirective`     | Directive | `validationStyle` — marks the element to receive invalid classes.                          |
| `ValidationContainerDirective` | Directive | `validationContainer` — shared target for multiple controls.                               |
| `validatePassword`             | Validator | Character-group rules for passwords.                                                       |
| `comparePasswords`             | Validator | Group-level equality check for two controls.                                               |
| `Validation` namespace         | Types     | `Config`, `Blueprints`, `Error`, `ParamMap`, `MapErrorsFn`.                                |
| `BLUEPRINTS`                   | Constant  | The default blueprint messages.                                                            |

### Injection tokens

For advanced setups (e.g. providing values via factories), the underlying tokens are exported: `VALIDATION_BLUEPRINTS`, `VALIDATION_ERROR_TEMPLATE`, `VALIDATION_INVALID_CLASSES`, `VALIDATION_MAP_ERRORS_FN`, `VALIDATION_TARGET_SELECTOR`, `VALIDATION_VALIDATE_ON_SUBMIT`.

## Todo

- [ ] Move the [built-in validators](#built-in-validators) (`validatePassword`, `comparePasswords`) out of `@ngx-validate/core` into a separate sub-package: `@ngx-validate/validators`. Until then, they remain exported from `@ngx-validate/core`.

## License

MIT — see [LICENSE](LICENSE).

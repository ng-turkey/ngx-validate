# NgxValidate + Tailwind CSS — step-by-step tutorial

NgxValidate ships with Bootstrap-friendly defaults (`is-invalid` class, `invalid-feedback` markup), but nothing about it is tied to Bootstrap. This tutorial converts the official demo to **Tailwind CSS**, step by step, using pure inline utilities — no custom CSS at all.

**Live result:** [Stackblitz Tailwind Example](https://stackblitz.com/~/github.com/mahmut-gundogdu/ngx-validate-tailwind-example) (a fork of the [official demo](https://stackblitz.com/edit/ngx-validate))

The final code for every changed file is in [`src/`](./src) next to this document — you can follow the steps below, or just copy the files over your own fork.

## The two ideas that make it work

**1. `invalidClasses` must be a single class.** NgxValidate applies it with a **single** `renderer.addClass()` call:

```ts
invalidClasses: 'border-red-500 ring-1 ring-red-500' // ❌ throws InvalidCharacterError
invalidClasses: 'field-invalid'                      // ✅ one semantic class
```

**2. Tailwind's `group` variants turn that one class into utilities.** NgxValidate adds `field-invalid` to the field's *wrapper*. Mark the wrapper as a `group`, and every element inside can react inline:

```html
<div class="form-field group">                                <!-- gets .field-invalid when invalid -->
  <input class="border-gray-300 group-[.field-invalid]:border-red-500 ..." />
</div>
```

No stylesheet, no `@apply` — the entire invalid state lives in the template. (Requires Tailwind v3.2+; the Play CDN qualifies.)

Everything else is plain configuration.

---

## Step 1 — Fork the demo

Open [stackblitz.com/edit/ngx-validate](https://stackblitz.com/edit/ngx-validate) and click **Fork**. You now have your own copy to edit.

## Step 2 — Remove Bootstrap

**`package.json`** — delete the three Bootstrap-related dependencies:

```diff
-   "bootstrap": "4.5.3",
-   "jquery": "3.5.1",
-   "popper.js": "1.16.1",
```

**`angular.json`** — remove the Bootstrap stylesheet from the `styles` array (in both the `build` and `test` targets if present):

```diff
    "styles": [
-     "../node_modules/bootstrap/dist/css/bootstrap.min.css",
      "src/styles.css"
    ],
```

Also empty out `src/styles.css` — the Bootstrap-specific rules in it (`.is-invalid .form-control`, `.invalid-feedback`) are no longer needed.

## Step 3 — Add Tailwind

The demo runs Angular 10, which predates the Angular CLI's built-in Tailwind support — and for a StackBlitz demo the simplest, most reliable option anyway is the **Tailwind Play CDN**. Replace `src/index.html` with:

```html
<html>
  <head>
    <title>NgxValidate + Tailwind</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100">
    <app-root>loading</app-root>
  </body>
</html>
```

That one script tag is the whole Tailwind setup for the demo.

> ⚠️ The Play CDN is for demos and prototyping only. For a real project, see [Production setup](#production-setup-real-projects) at the end.

## Step 4 — A Tailwind error template

The default error component renders Bootstrap's `<div class="invalid-feedback">` — which is `display: none` without Bootstrap's CSS, so errors would silently never show. Replace the demo's `src/app/components/error.component.ts` template with Tailwind utilities:

```ts
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ValidationErrorComponent } from '@ngx-validate/core';

@Component({
  selector: 'app-error',
  template: `
    <p
      class="mt-1.5 text-sm font-medium text-red-600"
      *ngFor="let error of errors; trackBy: trackByFn"
    >
      {{ error.message }}
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ErrorComponent extends ValidationErrorComponent {}
```

`errors` and `trackByFn` are inherited from `ValidationErrorComponent`; only the markup is yours.

## Step 5 — Configure NgxValidate

In `src/app/app.module.ts`, keep the config framework-agnostic — blueprints and the error template:

```ts
NgxValidateCoreModule.forRoot({
  blueprints: {
    invalidUsername: 'The username "{{ value }}" is taken.',
  },
  errorTemplate: ErrorComponent,
}),
```

The two styling-related options go on the **form itself** in the next step, via the configuration cascade (control > group > module). That keeps all Tailwind concerns in one file: the template.

## Step 6 — The Tailwind template

Rewrite `src/app/components/app.component.html`. The form element declares the styling contract:

```html
<form
  [formGroup]="form"
  (ngSubmit)="submit()"
  [invalidClasses]="'field-invalid'"
  [targetSelector]="'.form-field'"
  validateOnSubmit
  novalidate
  class="space-y-5"
>
```

- `[invalidClasses]="'field-invalid'"` — the single semantic class from the intro.
- `[targetSelector]="'.form-field'"` — Bootstrap gave us `.form-group` wrappers; with Tailwind we choose our own wrapper class. NgxValidate will both **append errors to** and **add `field-invalid` to** the closest `.form-field` ancestor of each input.

Each text field then follows one pattern — wrapper is `form-field group`, and label/input carry their own invalid-state variants:

```html
<div class="form-field group">
  <label
    for="username"
    class="mb-1.5 block text-sm font-medium text-gray-700 group-[.field-invalid]:text-red-600"
  >
    Username
  </label>
  <input
    formControlName="username"
    id="username"
    type="text"
    placeholder="Enter a username"
    autocomplete="off"
    class="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 group-[.field-invalid]:border-red-500 group-[.field-invalid]:ring-1 group-[.field-invalid]:ring-red-500 group-[.field-invalid]:focus:border-red-500 group-[.field-invalid]:focus:ring-2 group-[.field-invalid]:focus:ring-red-500/30"
  />
</div>
```

Reading the input's class list: normal state (gray border), focus state (indigo ring), invalid state (red border + ring via `group-[.field-invalid]:`), and invalid-while-focused (stacked `group-[.field-invalid]:focus:` — so an invalid field keeps a red ring while you're typing in it, instead of flipping to indigo).

The consent checkbox demonstrates the explicit directives instead of `targetSelector`: `validationStyle` marks the div that gets `field-invalid` (so it's also the `group`), and `validationTarget` marks where the error message is inserted:

```html
<div class="group" validationStyle>
  <div validationTarget>
    <label
      for="consent"
      class="flex items-center gap-2.5 text-sm text-gray-700 group-[.field-invalid]:text-red-600"
    >
      <input
        formControlName="consent"
        id="consent"
        type="checkbox"
        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 group-[.field-invalid]:border-red-500 group-[.field-invalid]:ring-1 group-[.field-invalid]:ring-red-500"
      />
      You must accept our terms 🙂
    </label>
  </div>
</div>
```

The full template — card layout, all three text fields, checkbox, and submit button — is in [`src/app/components/app.component.html`](./src/app/components/app.component.html).

`src/app/components/app.component.ts` (the form model, validators, `mapErrorsFn`) is **unchanged** — styling frameworks and validation logic are fully decoupled.

## Step 7 — Try it

- Type `a` in **Username**, then delete it → _"This field is required."_ appears in red under the field; the input gets a red border and ring; the label turns red.
- Type a taken username (e.g. one the mock service rejects) → the async error _"The username … is taken."_ shows once the check resolves.
- Enter mismatching passwords → _"Passwords do not match."_ appears under **both** password fields (that's `mapErrorsFn` routing the group error).
- Submit without accepting the terms → the checkbox row turns red with the message beneath it (`validateOnSubmit` reveals it on submit).

Or just open the finished version: [Stackblitz Tailwind Example](https://stackblitz.com/~/github.com/mahmut-gundogdu/ngx-validate-tailwind-example).

## Changed files summary

| File                                    | Change                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------- |
| `package.json`                          | Removed `bootstrap`, `jquery`, `popper.js`                                |
| `angular.json`                          | Removed Bootstrap from `styles`                                           |
| `src/index.html`                        | Added Tailwind Play CDN, `bg-gray-100` body                               |
| `src/styles.css`                        | Emptied (Bootstrap-specific rules removed)                                |
| `src/app/app.module.ts`                 | Removed styling options from `forRoot()` (moved to the form)              |
| `src/app/components/error.component.ts` | Tailwind error markup                                                     |
| `src/app/components/app.component.html` | Tailwind markup; `[invalidClasses]`, `[targetSelector]`, `group` variants |

Unchanged: `app.component.ts`, validators, services, models — everything else in the fork stays as-is.

## Production setup (real projects)

In a real app (Angular 11.2+), skip the CDN and install Tailwind properly:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: { extend: {} },
  plugins: [],
};
```

```css
/* src/styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

The template and NgxValidate configuration stay exactly the same.

### Alternative: `@apply` instead of `group` variants

If the long `group-[.field-invalid]:` class lists bother you (or you're on Tailwind < 3.2), the same result can be centralized in CSS — define the invalid look once with descendant rules:

```css
@layer components {
  .field-invalid input,
  .field-invalid select,
  .field-invalid textarea {
    @apply border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500;
  }

  .field-invalid label {
    @apply text-red-600;
  }
}
```

Then drop all `group`/`group-[.field-invalid]:` classes from the template. Both approaches are idiomatic; inline variants keep everything visible in the template, `@apply` keeps templates shorter. Either way, NgxValidate only ever toggles the single `field-invalid` class — that's the point: the library deals in class names and selectors, so it works with any CSS framework you choose.

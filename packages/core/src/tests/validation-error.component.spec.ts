import { createHostFactory, SpectatorHost } from "@ngneat/spectator";
import { ValidationErrorComponent } from "../lib/components";
import { Validation } from "../lib/models";

const ERRORS = [
  { key: "email", message: "Please enter a valid email address." },
  { key: "required", message: "This field is required." }
] as Validation.Error[];

describe("ValidationErrorComponent", () => {
  let spectator: SpectatorHost<ValidationErrorComponent>;
  const createHost = createHostFactory(ValidationErrorComponent);

  beforeEach(
    () =>
      (spectator = createHost("<validation-error></validation-error>", {
        props: {
          validationErrors: ERRORS
        }
      }))
  );

  it("should have the invalid-feedback class", () => {
    expect(spectator.query(".invalid-feedback")).toBeTruthy();
  });

  it("should display the validation errors", () => {
    expect(spectator.queryAll("div")[0]).toHaveText(ERRORS[0].message);
    expect(spectator.queryAll("div")[1]).toHaveText(ERRORS[1].message);
  });

  it("The trackByFn should return the key property", () => {
    expect(spectator.component.trackByFn(0, ERRORS[0])).toBe(ERRORS[0].key);
  });

  it("The errors getter should return validationErrors or empty array", () => {
    expect(spectator.component.errors).toEqual(
      spectator.component.validationErrors
    );

    spectator.component.validationErrors = null;
    spectator.detectComponentChanges();
    expect(spectator.component.errors).toEqual([]);
  });
});

import { TemplateRef, Type } from '@angular/core';
import { NgControl } from '@angular/forms';

export namespace Validation {
  export type Config = Partial<{
    blueprints: Blueprints;
    errorTemplate: Type<any> | TemplateRef<any>;
    invalidClasses: string;
    mapErrorsFn: MapErrorsFn;
    skipValidation: boolean;
    targetSelector: string;
    validateOnSubmit: boolean;
  }>;

  export interface Blueprints {
    [key: string]: string;
  }

  export interface ParamMap {
    [key: string]: string | number | boolean | string[];
  }

  export interface Error {
    key: string;
    params?: ParamMap;
    message?: string;
  }

  export type MapErrorsFn = (errors: Error[], formErrors: Error[], control?: NgControl) => Error[];

  export type StreamName = 'status' | 'submit' | 'value';
}

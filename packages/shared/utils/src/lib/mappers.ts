import { Validation } from '@ngx-validate/shared/models';
import { mapReplace } from './string-utils';

export function generateValidationError(
  key: string,
  params: Validation.ParamMap,
  blueprint: string,
): Validation.Error {
  return {
    key,
    params,
    message: mapReplace(blueprint, params, true),
  };
}

export const defaultMapErrorsFn: Validation.MapErrorsFn = (errors: Validation.Error[]) => {
  return errors;
};

export function evalPropTruthy(prop: any): boolean {
  return prop || typeof prop === 'string';
}

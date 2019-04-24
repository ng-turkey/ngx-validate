import { Validation } from '../models';

export function interpolate(text: string): string {
  return '{{\\s*(' + text + ')\\s*}}';
}

export function mapReplace(blueprint: string, map: Validation.ParamMap, interpolation?: boolean): string {
  if (typeof blueprint !== 'string') return '';
  if (typeof map !== 'object') return blueprint;

  const expression = Object.keys(map).join('|');
  const mapRegExp = new RegExp(interpolation ? interpolate(expression) : expression, 'g');

  return blueprint.replace(mapRegExp, match => {
    if (interpolation) {
      return String(map[match.replace(/\{\{\s*|\s*\}\}/g, '')]);
    }

    return String(map[match]);
  });
}

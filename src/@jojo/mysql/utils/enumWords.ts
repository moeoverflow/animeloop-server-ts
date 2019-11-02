import { isString, keys } from 'lodash';

export function enumWords(e: any): string[] {
  return keys(e).filter((i) => isString(e[i])).map((i) => e[i])
}

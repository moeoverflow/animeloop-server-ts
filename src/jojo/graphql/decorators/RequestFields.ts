import { createParamDecorator } from "type-graphql";

export interface IRequestFields {
  [key: string]: IRequestFields | null
}

export function RequestFields<T>() {
  return createParamDecorator<T>(({ info  }) => {
    const { selectionSet } = info.operation
    return selectionSetHelper(selectionSet) as IRequestFields
  });
}

function selectionSetHelper(selectionSet: any) {
  if (!selectionSet) return null
  return selectionSet.selections.reduce((data: any, current: any) => {
    const key = current.name.value
    data[key] = selectionSetHelper(current.selectionSet)
    return data
  }, {})
}
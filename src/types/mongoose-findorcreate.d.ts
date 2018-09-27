// declare function findOrCreatePlugin(schema: any, options: any): null


declare module "mongoose-findorcreate" {
  function findOrCreatePlugin(schema: any, options?: any): null
  export = findOrCreatePlugin
}
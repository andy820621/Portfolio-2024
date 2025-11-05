declare module '#content/server' {
  // Minimal typings to satisfy vue-tsc in Nitro handlers
  export function queryCollection(event: any, collection: string): any
}

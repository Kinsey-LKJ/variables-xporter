declare interface RequireContext {
  keys(): string[];
  (id: string): any;
  <T>(id: string): T;
  resolve(id: string): string;
  /** The module id of the context module. This may be useful for module.hot.accept. */
  id: string;
}

declare interface NodeRequire {
  context(
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp
  ): RequireContext;
} 

declare module '*.svg' {
  const content: any;
  export default content;
}

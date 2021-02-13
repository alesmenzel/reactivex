declare module 'rollup-plugin-babel' {
  import { Plugin } from 'rollup';
  import { TransformOptions } from '@babel/core';

  export type RollupPluginBabelOptions = TransformOptions & {
    externalHelpers?: boolean;
    include?: RegExp | string | string[];
    exclude?: RegExp | string | string[];
    externalHelpersWhitelist?: string[];
    extensions?: string[];
    runtimeHelpers?: boolean;
  }

  export interface RollupPluginBabel {
    (options: RollupPluginBabelOptions): Plugin;
  }

  const rollupPluginBabel: RollupPluginBabel;
  export default rollupPluginBabel
}

declare module 'rollup-plugin-progress' {
  import { Plugin } from 'rollup';

  export interface RollupPluginProgressOptions {
    clearLine?: boolean;
  }

  export interface RollupPluginProgress {
    (options?: RollupPluginProgressOptions): Plugin;
  }

  const rollupPluginProgress: RollupPluginProgress;
  export default rollupPluginProgress
}

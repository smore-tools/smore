import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'smore',
  bundles: [
    { components: ['smore-counter'] },
    { components: ['smore-countdown'] },
    { components: ['smore-async-content'] },
    { components: ['smore-typewriter'] },
    { components: ['smore-window'] },
    { components: ['smore-observer'] }
  ],
  plugins: [
    sass()
  ],
  outputTargets: [
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ],
  enableCache: true
};

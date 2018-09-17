import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'smore',
  bundles: [
    { components: ['smore-async-content'] },
    { components: ['smore-counter'] },
    { components: ['smore-typewriter'] },
    { components: ['smore-window'] }
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
  ]
};

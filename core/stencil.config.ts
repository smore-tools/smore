import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'smore',
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

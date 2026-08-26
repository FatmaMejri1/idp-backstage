import React from 'react';
import {
  createFrontendPlugin,
  ApiBlueprint,
  discoveryApiRef,
  configApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import {
  pagerDutyApiRef,
  PagerDutyClient,
  isPagerDutyAvailable,
  EntityPagerDutyCard,
} from '@backstage/plugin-pagerduty';

const pagerDutyApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: pagerDutyApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ configApi, discoveryApi, fetchApi }) =>
        PagerDutyClient.fromConfig(configApi, { discoveryApi, fetchApi }),
    }),
});

const pagerDutyCard = EntityCardBlueprint.make({
  name: 'overview',
  params: {
    filter: isPagerDutyAvailable,
    type: 'info',
    loader: async () => React.createElement(EntityPagerDutyCard),
  },
});

const pagerDutyContent = EntityContentBlueprint.make({
  name: 'pagerduty',
  params: {
    path: 'pagerduty',
    title: 'PagerDuty',
    filter: isPagerDutyAvailable,
    loader: async () => React.createElement(EntityPagerDutyCard),
  },
});

export const pagerDutyPlugin = createFrontendPlugin({
  pluginId: 'pagerduty',
  extensions: [pagerDutyApi, pagerDutyCard, pagerDutyContent],
});

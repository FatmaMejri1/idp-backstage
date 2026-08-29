import React from 'react';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { PrometheusAlertsCard } from './PrometheusAlertsCard';

function hasAlertSelector(entity: {
  metadata: { annotations?: Record<string, string> };
}): boolean {
  return Boolean(entity.metadata.annotations?.['grafana/alert-label-selector']);
}

const alertsCard = EntityCardBlueprint.make({
  name: 'prometheus',
  params: {
    filter: hasAlertSelector,
    type: 'content',
    loader: async () => React.createElement(PrometheusAlertsCard),
  },
});

const alertsContent = EntityContentBlueprint.make({
  name: 'prometheus',
  params: {
    path: 'alerts',
    title: 'Alerts',
    filter: hasAlertSelector,
    loader: async () => React.createElement(PrometheusAlertsCard),
  },
});

export const platformAlertsPlugin = createFrontendPlugin({
  pluginId: 'platform-alerts',
  extensions: [alertsCard, alertsContent],
});

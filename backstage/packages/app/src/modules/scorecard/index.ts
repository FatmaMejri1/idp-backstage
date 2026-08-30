import React from 'react';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { ServiceMaturityCard } from './ServiceMaturityCard';

function isComponentEntity(entity: { kind: string }): boolean {
  return entity.kind?.toLowerCase() === 'component';
}

const maturityCard = EntityCardBlueprint.make({
  name: 'service-maturity',
  params: {
    filter: isComponentEntity,
    type: 'content',
    loader: async () => React.createElement(ServiceMaturityCard),
  },
});

const maturityContent = EntityContentBlueprint.make({
  name: 'service-maturity',
  params: {
    filter: isComponentEntity,
    path: 'scorecard',
    title: 'Scorecard',
    loader: async () => React.createElement(ServiceMaturityCard),
  },
});

export const serviceMaturityPlugin = createFrontendPlugin({
  pluginId: 'service-maturity',
  extensions: [maturityCard, maturityContent],
});

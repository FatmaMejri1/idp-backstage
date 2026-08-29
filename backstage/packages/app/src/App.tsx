import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import grafanaPlugin from '@backstage-community/plugin-grafana/alpha';
import { navModule } from './modules/nav';
import { homeModule } from './modules/home';
import { pagerDutyPlugin } from './modules/pagerduty';
import { githubActionsWithProxy } from './modules/github-actions';
import { platformAlertsPlugin } from './modules/alerts';

export default createApp({
  features: [
    catalogPlugin,
    kubernetesPlugin,
    githubActionsWithProxy,
    grafanaPlugin,
    platformAlertsPlugin,
    navModule,
    homeModule,
    pagerDutyPlugin,
  ],
});

import { useMemo } from 'react';
import {
  InfoCard,
  Progress,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusWarning,
  Table,
  TableColumn,
  Link,
} from '@backstage/core-components';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/lib/useAsync';
import { Alert } from '@material-ui/lab';

const ALERT_SELECTOR_ANNOTATION = 'grafana/alert-label-selector';

type PrometheusRule = {
  name: string;
  state?: string;
  type?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  alerts?: Array<{ state?: string; labels?: Record<string, string> }>;
};

type GrafanaDatasource = {
  uid: string;
  name: string;
  type: string;
};

export type PlatformAlert = {
  id: string;
  name: string;
  state: string;
  severity: string;
  component: string;
  summary: string;
  url: string;
};

function parseSelector(raw?: string): { key: string; value: string } | undefined {
  if (!raw || !raw.includes('=')) {
    return undefined;
  }
  const [key, ...rest] = raw.split('=');
  return { key: key.trim(), value: rest.join('=').trim() };
}

function ruleMatches(
  rule: PrometheusRule,
  selector?: { key: string; value: string },
  groupName?: string,
): boolean {
  if (rule.type && rule.type !== 'alerting') {
    return false;
  }
  if (!selector) {
    return true;
  }
  if (rule.labels?.[selector.key] === selector.value) {
    return true;
  }
  if (
    (rule.alerts ?? []).some(
      instance => instance.labels?.[selector.key] === selector.value,
    )
  ) {
    return true;
  }
  // Prometheus/Grafana often omit extra rule labels. CRM rules still live in
  // groups named "crm.*" and alerts named "CRM…".
  const needle = selector.value.toLowerCase();
  if (rule.name?.toLowerCase().startsWith(needle)) {
    return true;
  }
  const group = (groupName ?? '').toLowerCase();
  return group === needle || group.startsWith(`${needle}.`);
}

function normalizeState(rule: PrometheusRule): string {
  const instanceState = (rule.alerts ?? [])
    .map(alert => (alert.state ?? '').toLowerCase())
    .find(state => state === 'firing' || state === 'pending');
  const state = (instanceState || rule.state || 'inactive').toLowerCase();
  if (state === 'firing' || state === 'alerting') {
    return 'firing';
  }
  if (state === 'pending') {
    return 'pending';
  }
  return 'inactive';
}

function StateBadge({ state }: { state: string }) {
  switch (state) {
    case 'firing':
      return <StatusError>Firing</StatusError>;
    case 'pending':
      return <StatusWarning>Pending</StatusWarning>;
    case 'inactive':
      return <StatusOK>OK</StatusOK>;
    default:
      return <StatusPending>{state}</StatusPending>;
  }
}

export const PrometheusAlertsCard = () => {
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const selector = useMemo(
    () =>
      parseSelector(
        entity.metadata.annotations?.[ALERT_SELECTOR_ANNOTATION],
      ),
    [entity],
  );
  const grafanaDomain = 'http://localhost:3300';
  const configuredUid = 'prometheus';

  const { value, loading, error } = useAsync(async () => {
    const proxyBase = await discoveryApi.getBaseUrl('proxy');
    const grafanaApi = `${proxyBase}/grafana/api`;

    const datasourcesResp = await fetchApi.fetch(`${grafanaApi}/api/datasources`);
    if (!datasourcesResp.ok) {
      throw new Error(
        `Grafana API ${datasourcesResp.status}. Check GRAFANA_AUTH_HEADER in backstage/.env (this cluster uses Grafana admin / admin123).`,
      );
    }
    const datasources = (await datasourcesResp.json()) as GrafanaDatasource[];
    const prometheus =
      datasources.find(ds => ds.uid === configuredUid) ||
      datasources.find(ds => ds.name.toLowerCase() === (configuredUid ?? '').toLowerCase()) ||
      datasources.find(ds => ds.type === 'prometheus');

    if (!prometheus) {
      throw new Error('No Prometheus datasource found in Grafana.');
    }

    const rulesResp = await fetchApi.fetch(
      `${grafanaApi}/api/prometheus/${prometheus.uid}/api/v1/rules`,
    );
    if (!rulesResp.ok) {
      throw new Error(
        `Could not load Prometheus rules (${rulesResp.status}) via Grafana datasource ${prometheus.uid}.`,
      );
    }

    const body = await rulesResp.json();
    const groups = body?.data?.groups ?? [];
    const matched: PlatformAlert[] = [];
    for (const group of groups as Array<{
      name?: string;
      rules?: PrometheusRule[];
    }>) {
      for (const rule of group.rules ?? []) {
        if (!ruleMatches(rule, selector, group.name)) {
          continue;
        }
        const labels = rule.labels ?? {};
        matched.push({
          id: `${group.name || 'default'}-${rule.name}`,
          name: rule.name,
          state: normalizeState(rule),
          severity: labels.severity ?? 'n/a',
          component: labels.component ?? labels.service ?? 'n/a',
          summary:
            rule.annotations?.summary ||
            rule.annotations?.description ||
            rule.name,
          url: `${grafanaDomain}/alerting/list`,
        });
      }
    }
    matched.sort((a, b) => {
      const rank = (state: string) =>
        state === 'firing' ? 0 : state === 'pending' ? 1 : 2;
      return rank(a.state) - rank(b.state) || a.name.localeCompare(b.name);
    });
    return matched;
  }, [configuredUid, discoveryApi, fetchApi, grafanaDomain, selector]);

  const columns: TableColumn<PlatformAlert>[] = [
    {
      title: 'Alert',
      field: 'name',
      render: row => <Link to={row.url}>{row.name}</Link>,
    },
    {
      title: 'Summary',
      field: 'summary',
    },
    {
      title: 'Component',
      field: 'component',
      width: '120px',
    },
    {
      title: 'Severity',
      field: 'severity',
      width: '100px',
    },
    {
      title: 'State',
      field: 'state',
      width: '110px',
      render: row => <StateBadge state={row.state} />,
    },
  ];

  let content;
  if (loading) {
    content = <Progress />;
  } else if (error) {
    content = <Alert severity="error">{error.message}</Alert>;
  } else if (!value?.length) {
    content = (
      <Alert severity="info">
        No Prometheus alerting rules matched{' '}
        <strong>
          {entity.metadata.annotations?.[ALERT_SELECTOR_ANNOTATION]}
        </strong>
        . Confirm Grafana is reachable at {grafanaDomain} (admin credentials via
        GRAFANA_AUTH_HEADER) and that CRM PrometheusRules are loaded.
      </Alert>
    );
  } else {
    content = (
      <Table
        options={{ search: false, paging: false, padding: 'dense' }}
        data={value}
        columns={columns}
      />
    );
  }

  return (
    <InfoCard
      title="Alerts"
      subheader="Prometheus alerting rules (firing, pending, and OK)"
    >
      {selector ? content : <StatusAborted>Missing grafana/alert-label-selector</StatusAborted>}
    </InfoCard>
  );
};

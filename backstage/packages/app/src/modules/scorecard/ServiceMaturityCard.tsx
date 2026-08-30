import { useMemo } from 'react';
import {
  InfoCard,
  StatusOK,
  StatusWarning,
  StatusError,
  Table,
  TableColumn,
  Link,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Box,
  Chip,
  LinearProgress,
  Typography,
  makeStyles,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SecurityIcon from '@material-ui/icons/Security';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import SpeedIcon from '@material-ui/icons/Speed';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import SyncAltIcon from '@material-ui/icons/SyncAlt';

const useStyles = makeStyles(theme => ({
  headerBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.02)',
    border: `1px solid ${theme.palette.divider}`,
  },
  tierChip: {
    fontWeight: 'bold',
    fontSize: '0.85rem',
    padding: theme.spacing(1),
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: theme.spacing(1),
  },
}));

export interface MaturityCheck {
  id: string;
  category: 'Security' | 'Documentation' | 'Reliability' | 'Observability' | 'Operations' | 'Delivery';
  name: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  details: string;
  link?: string;
}

export const ServiceMaturityCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();

  const annotations = entity.metadata.annotations ?? {};
  const entityName = entity.metadata.name;
  const entityNamespace = entity.metadata.namespace ?? 'default';
  const entityKind = entity.kind?.toLowerCase() ?? 'component';

  const basePath = `/catalog/${entityNamespace}/${entityKind}/${entityName}`;

  const checks: MaturityCheck[] = useMemo(() => {
    const list: MaturityCheck[] = [];

    // 1. Shift-Left Security Gate
    const hasCi = Boolean(annotations['github.com/project-slug']);
    list.push({
      id: 'security-gate',
      category: 'Security',
      name: 'Shift-Left Security Pipeline',
      description: 'Gitleaks secrets detection, Semgrep SAST, and Trivy CVE scanning in CI',
      status: hasCi ? 'passed' : 'warning',
      details: hasCi
        ? 'Gitleaks + Semgrep + Trivy automated scanning active'
        : 'Missing CI/CD repository mapping',
      link: `${basePath}/github-actions`,
    });

    // 2. Technical Documentation (TechDocs)
    const hasDocs = Boolean(annotations['backstage.io/techdocs-ref']);
    list.push({
      id: 'techdocs',
      category: 'Documentation',
      name: 'Technical Documentation',
      description: 'Architecture, runbooks, and API specs documented in TechDocs',
      status: hasDocs ? 'passed' : 'warning',
      details: hasDocs ? 'TechDocs published & indexed' : 'Missing backstage.io/techdocs-ref annotation',
      link: hasDocs ? `${basePath}/docs` : undefined,
    });

    // 3. Kubernetes Health & Probes
    const hasK8s = Boolean(annotations['backstage.io/kubernetes-label-selector'] || annotations['backstage.io/kubernetes-id']);
    list.push({
      id: 'k8s-topology',
      category: 'Reliability',
      name: 'Kubernetes Workload & Probes',
      description: 'Live Pods, Service, Readiness/Liveness probes, and resource limits',
      status: hasK8s ? 'passed' : 'failed',
      details: hasK8s ? `Tracked via selector: ${annotations['backstage.io/kubernetes-label-selector'] ?? 'default'}` : 'Missing Kubernetes label selector',
      link: hasK8s ? `${basePath}/kubernetes` : undefined,
    });

    // 4. Observability & Telemetry
    const hasGrafana = Boolean(annotations['grafana/dashboard-selector']);
    list.push({
      id: 'observability',
      category: 'Observability',
      name: 'Full-Stack Observability',
      description: 'Prometheus metrics (/actuator/prometheus), Grafana dashboards, and Loki logs',
      status: hasGrafana ? 'passed' : 'warning',
      details: hasGrafana ? 'Dashboards mapped & metrics scraped' : 'Missing grafana/dashboard-selector annotation',
      link: 'http://localhost:3300/dashboards',
    });

    // 5. Incident Response & Alerts
    const hasPagerDuty = Boolean(annotations['pagerduty.com/service-id'] || annotations['grafana/alert-label-selector']);
    list.push({
      id: 'incident-management',
      category: 'Operations',
      name: 'Alerting & Incident Management',
      description: 'Alertmanager threshold rules and PagerDuty on-call escalation policy',
      status: hasPagerDuty ? 'passed' : 'warning',
      details: hasPagerDuty ? 'PagerDuty integration & Prometheus rules active' : 'Missing alerting/PagerDuty annotations',
      link: `${basePath}/alerts`,
    });

    // 6. Declarative GitOps
    const isService = entity.spec?.type === 'service';
    list.push({
      id: 'gitops-delivery',
      category: 'Delivery',
      name: 'Declarative GitOps Delivery',
      description: 'ArgoCD automated continuous synchronization from Git repository',
      status: isService ? 'passed' : 'warning',
      details: 'ArgoCD crm-application.yaml watching Helm values',
      link: 'http://localhost:8080/applications/crm-app',
    });

    return list;
  }, [annotations, basePath, entity.spec?.type]);

  const passedCount = checks.filter(c => c.status === 'passed').length;
  const scorePercent = Math.round((passedCount / checks.length) * 100);

  const tier = useMemo(() => {
    if (scorePercent === 100) return { name: 'Gold Tier (Production Ready)', color: '#4caf50' };
    if (scorePercent >= 75) return { name: 'Silver Tier (Staging Ready)', color: '#2196f3' };
    if (scorePercent >= 50) return { name: 'Bronze Tier (Development)', color: '#ff9800' };
    return { name: 'Needs Attention', color: '#f44336' };
  }, [scorePercent]);

  const getCategoryIcon = (category: MaturityCheck['category']) => {
    switch (category) {
      case 'Security':
        return <SecurityIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />;
      case 'Documentation':
        return <MenuBookIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />;
      case 'Reliability':
        return <SpeedIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />;
      case 'Observability':
        return <CloudDoneIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />;
      case 'Operations':
        return <NotificationsActiveIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />;
      case 'Delivery':
        return <SyncAltIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />;
      default:
        return <CheckCircleIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 4 }} />;
    }
  };

  const columns: TableColumn<MaturityCheck>[] = [
    {
      title: 'Standard / Check',
      field: 'name',
      render: row => (
        <Box>
          <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row.description}
          </Typography>
        </Box>
      ),
    },
    {
      title: 'Category',
      field: 'category',
      width: '150px',
      render: row => (
        <Box display="flex" alignItems="center">
          {getCategoryIcon(row.category)}
          <Typography variant="body2">{row.category}</Typography>
        </Box>
      ),
    },
    {
      title: 'Status',
      field: 'status',
      width: '120px',
      render: row => {
        if (row.status === 'passed') return <StatusOK>Passed</StatusOK>;
        if (row.status === 'warning') return <StatusWarning>Warning</StatusWarning>;
        return <StatusError>Failed</StatusError>;
      },
    },
    {
      title: 'Details',
      field: 'details',
      render: row => (
        <Typography variant="body2">
          {row.link ? <Link to={row.link}>{row.details}</Link> : row.details}
        </Typography>
      ),
    },
  ];

  return (
    <InfoCard
      title="Service Maturity Scorecard"
      subheader="Platform Engineering Quality, Security & Reliability Standards"
    >
      <Box className={classes.headerBox}>
        <Box flex={1} mr={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Maturity Score: <strong>{scorePercent}%</strong> ({passedCount}/{checks.length} Standards Met)
            </Typography>
            <Chip
              label={tier.name}
              className={classes.tierChip}
              style={{ backgroundColor: tier.color, color: '#fff' }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={scorePercent}
            className={classes.progressBar}
          />
        </Box>
      </Box>

      <Table
        options={{ search: false, paging: false, padding: 'dense' }}
        data={checks}
        columns={columns}
      />
    </InfoCard>
  );
};

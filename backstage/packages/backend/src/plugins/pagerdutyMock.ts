import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import express from 'express';

interface PagerDutyService {
  id: string;
  name: string;
  description: string;
  auto_resolve_timeout: number;
  acknowledgement_timeout: number;
  status: string;
  html_url: string;
  escalation_policy: {
    id: string;
    type: string;
    summary: string;
    html_url: string;
  };
  integrations: Array<{
    id: string;
    name: string;
    service: { id: string };
    integration_key: string;
  }>;
}

interface PagerDutyIncident {
  id: string;
  incident_number: number;
  title: string;
  status: string;
  urgency: string;
  created_at: string;
  html_url: string;
  service: {
    id: string;
    summary: string;
  };
  assignments: Array<{
    at: string;
    assignee: {
      id: string;
      summary: string;
      html_url: string;
    };
  }>;
}

export const pagerdutyMockPlugin = createBackendPlugin({
  pluginId: 'pagerduty-mock',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ httpRouter, logger }) {
        const router = express.Router();
        router.use(express.json());

        const servicesMap = new Map<string, PagerDutyService>();
        const incidentsMap = new Map<string, PagerDutyIncident[]>();

        const buildService = (
          id: string,
          name: string,
          description: string = `Production ${name} Service`,
          policyId: string = 'PESCPOLICY1',
          policySummary: string = `${name} Escalation Policy`,
        ): PagerDutyService => ({
          id,
          name,
          description,
          auto_resolve_timeout: 14400,
          acknowledgement_timeout: 1800,
          status: 'active',
          html_url: `https://mock.pagerduty.com/service-directory/${id}`,
          escalation_policy: {
            id: policyId,
            type: 'escalation_policy_reference',
            summary: policySummary,
            html_url: `https://mock.pagerduty.com/escalation_policies/${policyId}`,
          },
          integrations: [
            {
              id: `PINTKEY_${id}`,
              name: 'Backstage Integration',
              service: { id },
              integration_key: `mock-integration-key-${name}`,
            },
          ],
        });

        // 1. CRM App service (dedicated)
        const crmService = buildService(
          'PCIJWYX',
          'crm-app',
          'Production CRM Application Service',
          'PESCPOLICY1',
          'CRM Platform Escalation Policy',
        );
        servicesMap.set('PCIJWYX', crmService);
        incidentsMap.set('PCIJWYX', [
          {
            id: 'PINC101',
            incident_number: 101,
            title: 'High CPU utilization on crm-app pod in production',
            status: 'triggered',
            urgency: 'high',
            created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            html_url: 'https://mock.pagerduty.com/incidents/PINC101',
            service: {
              id: 'PCIJWYX',
              summary: 'crm-app',
            },
            assignments: [
              {
                at: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
                assignee: {
                  id: 'PUSER1',
                  summary: 'Fatma (Platform Lead)',
                  html_url: 'https://mock.pagerduty.com/users/PUSER1',
                },
              },
            ],
          },
          {
            id: 'PINC102',
            incident_number: 102,
            title: 'Elevated latency on /api/v1/deals endpoint (> 450ms)',
            status: 'acknowledged',
            urgency: 'low',
            created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            html_url: 'https://mock.pagerduty.com/incidents/PINC102',
            service: {
              id: 'PCIJWYX',
              summary: 'crm-app',
            },
            assignments: [
              {
                at: new Date(Date.now() - 2.8 * 3600 * 1000).toISOString(),
                assignee: {
                  id: 'PUSER2',
                  summary: 'Alex (On-Call SRE)',
                  html_url: 'https://mock.pagerduty.com/users/PUSER2',
                },
              },
            ],
          },
        ]);

        // 2. Golden Path Application service (dedicated)
        const goldenPathService = buildService(
          'PGPA001',
          'golden-path-app',
          'Production Golden Path Application Service (Full-Stack)',
          'PESCPOLICY_GPA',
          'Golden Path Platform Escalation Policy',
        );
        servicesMap.set('PGPA001', goldenPathService);
        incidentsMap.set('PGPA001', [
          {
            id: 'PINC201',
            incident_number: 201,
            title: 'Transient latency jitter on golden-path-app backend service',
            status: 'acknowledged',
            urgency: 'low',
            created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
            html_url: 'https://mock.pagerduty.com/incidents/PINC201',
            service: {
              id: 'PGPA001',
              summary: 'golden-path-app',
            },
            assignments: [
              {
                at: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
                assignee: {
                  id: 'PUSER1',
                  summary: 'Fatma (Platform Lead)',
                  html_url: 'https://mock.pagerduty.com/users/PUSER1',
                },
              },
            ],
          },
        ]);

        const generateServiceId = (name: string): string => {
          if (name === 'crm' || name === 'crm-app') return 'PCIJWYX';
          if (name === 'golden-path-app') return 'PGPA001';
          let hash = 0;
          for (let i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i);
            hash |= 0;
          }
          const suffix = Math.abs(hash)
            .toString(36)
            .toUpperCase()
            .padStart(6, '0')
            .slice(0, 6);
          return `P${suffix}`;
        };

        // 1. Service retrieval by ID
        router.get('/services/:id', (req, res) => {
          const serviceId = req.params.id;
          logger.info(`[PagerDuty Mock] GET /services/${serviceId}`);
          let service = servicesMap.get(serviceId);
          if (!service) {
            service = buildService(serviceId, `service-${serviceId}`);
            servicesMap.set(serviceId, service);
          }
          res.json({ service });
        });

        // 2. Change events for a service
        router.get('/services/:id/change_events', (req, res) => {
          const serviceId = req.params.id;
          logger.info(`[PagerDuty Mock] GET /services/${serviceId}/change_events`);
          const service = servicesMap.get(serviceId);
          const serviceName = service ? service.name : serviceId;

          res.json({
            change_events: [
              {
                id: `PCHG_${serviceId}_1`,
                summary: `Deployed release v1.0.0 for ${serviceName} to production cluster`,
                timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                links: [
                  {
                    text: `GitHub Release v1.0.0`,
                    href: `https://github.com/FatmaMejri1/${serviceName}/releases`,
                  },
                ],
              },
              {
                id: `PCHG_${serviceId}_2`,
                summary: `ArgoCD continuous delivery synced Helm deployment for ${serviceName}`,
                timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
                links: [
                  {
                    text: 'ArgoCD Application',
                    href: `http://localhost:8080/applications/${serviceName}-app`,
                  },
                ],
              },
            ],
          });
        });

        // 3. Service list & search
        router.get('/services', (req, res) => {
          logger.info(`[PagerDuty Mock] GET /services`);
          const query = (req.query.query as string)?.toLowerCase();
          let all = Array.from(servicesMap.values());
          if (query) {
            all = all.filter(
              s =>
                s.name.toLowerCase().includes(query) ||
                s.id.toLowerCase().includes(query),
            );
          }
          res.json({ services: all });
        });

        // 4. Create service (scaffolder golden-path templates)
        router.post('/services', (req, res) => {
          const serviceData = req.body?.service || {};
          const serviceName = serviceData.name || `service-${Date.now()}`;
          const serviceId = generateServiceId(serviceName);
          const description =
            serviceData.description ||
            `On-call escalation service for ${serviceName} (Golden Path IDP)`;
          const policyId =
            serviceData.escalation_policy?.id || `PESC_${serviceId}`;
          const policySummary = `${serviceName} Escalation Policy`;

          const service = buildService(
            serviceId,
            serviceName,
            description,
            policyId,
            policySummary,
          );
          servicesMap.set(serviceId, service);
          if (!incidentsMap.has(serviceId)) {
            incidentsMap.set(serviceId, []);
          }

          logger.info(
            `[PagerDuty Mock] POST /services -> Created dedicated service "${serviceName}" with ID ${serviceId}`,
          );
          res.status(201).json({ service });
        });

        // 5. Active incidents list (filters by service_ids!)
        router.get('/incidents', (req, res) => {
          logger.info(
            `[PagerDuty Mock] GET /incidents (query: ${JSON.stringify(req.query)})`,
          );

          let targetServiceIds: string[] = [];
          const rawServiceIds =
            req.query['service_ids[]'] ?? req.query.service_ids;
          if (Array.isArray(rawServiceIds)) {
            targetServiceIds = rawServiceIds.map(String);
          } else if (typeof rawServiceIds === 'string') {
            targetServiceIds = [rawServiceIds];
          }

          const resultIncidents: PagerDutyIncident[] = [];
          if (targetServiceIds.length > 0) {
            for (const sId of targetServiceIds) {
              const list = incidentsMap.get(sId);
              if (list) {
                resultIncidents.push(...list);
              }
            }
          } else {
            for (const list of incidentsMap.values()) {
              resultIncidents.push(...list);
            }
          }

          res.json({ incidents: resultIncidents });
        });

        // 6. On-call responders
        router.get('/oncalls', (req, res) => {
          logger.info(
            `[PagerDuty Mock] GET /oncalls (query: ${JSON.stringify(req.query)})`,
          );
          res.json({
            oncalls: [
              {
                escalation_level: 1,
                user: {
                  id: 'PUSER1',
                  name: 'Fatma (Primary On-Call)',
                  email: 'fatma@internal.dev',
                  html_url: 'https://mock.pagerduty.com/users/PUSER1',
                },
              },
              {
                escalation_level: 2,
                user: {
                  id: 'PUSER2',
                  name: 'DevOps Escalation Team',
                  email: 'devops-oncall@internal.dev',
                  html_url: 'https://mock.pagerduty.com/users/PUSER2',
                },
              },
            ],
          });
        });

        // 7. Trigger incident event
        const triggerHandler = (
          req: express.Request,
          res: express.Response,
        ) => {
          logger.info(
            `[PagerDuty Mock] Event trigger received for: ${req.body?.service_key ?? req.body?.service_id ?? 'unknown'}`,
          );
          res.json({
            status: 'success',
            message: 'Event processed',
            dedup_key: 'mock-event-' + Date.now(),
          });
        };
        router.post('/events/v2/enqueue', triggerHandler);
        router.post('/incidents', triggerHandler);

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/',
          allow: 'unauthenticated',
        });

        logger.info(
          'PagerDuty Mock Plugin successfully initialized at /api/pagerduty-mock',
        );
      },
    });
  },
});

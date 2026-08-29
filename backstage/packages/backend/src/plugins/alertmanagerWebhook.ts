/*
 * Receives Prometheus Alertmanager webhooks and creates Backstage
 * notifications (bell icon), alongside Discord and email receivers.
 */

import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { notificationService } from '@backstage/plugin-notifications-node';
import express from 'express';

type AlertmanagerAlert = {
  status?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  startsAt?: string;
  endsAt?: string;
  fingerprint?: string;
  generatorURL?: string;
};

type AlertmanagerWebhook = {
  status?: string;
  receiver?: string;
  externalURL?: string;
  commonLabels?: Record<string, string>;
  commonAnnotations?: Record<string, string>;
  alerts?: AlertmanagerAlert[];
};

function mapSeverity(
  status: string,
  label?: string,
): 'low' | 'normal' | 'high' | 'critical' {
  if (status === 'resolved') {
    return 'low';
  }
  const severity = (label ?? '').toLowerCase();
  if (severity === 'critical') {
    return 'critical';
  }
  if (severity === 'warning') {
    return 'high';
  }
  return 'normal';
}

export const alertmanagerWebhookPlugin = createBackendPlugin({
  pluginId: 'alertmanager',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        notifications: notificationService,
      },
      async init({ httpRouter, logger, config, notifications }) {
        const expectedToken =
          config.getOptionalString('alertmanager.webhookToken') ||
          process.env.ALERTMANAGER_WEBHOOK_TOKEN;
        const grafanaDomain =
          config.getOptionalString('grafana.domain') || 'http://localhost:3300';
        const recipientEntityRef = config.getOptionalString(
          'alertmanager.recipientEntityRef',
        );

        const router = express.Router();
        router.use(express.json({ limit: '1mb' }));

        router.post('/webhook', async (req, res) => {
          if (expectedToken) {
            const header =
              (req.header('authorization') ?? '').replace(/^Bearer\s+/i, '') ||
              req.header('x-webhook-token') ||
              '';
            if (header !== expectedToken) {
              res.status(401).json({ error: 'unauthorized' });
              return;
            }
          }

          const payload = (req.body ?? {}) as AlertmanagerWebhook;
          const alerts = payload.alerts ?? [];
          if (alerts.length === 0) {
            res.status(202).json({ accepted: true, notifications: 0 });
            return;
          }

          let sent = 0;
          for (const alert of alerts) {
            const labels = {
              ...(payload.commonLabels ?? {}),
              ...(alert.labels ?? {}),
            };
            const annotations = {
              ...(payload.commonAnnotations ?? {}),
              ...(alert.annotations ?? {}),
            };
            const status = (alert.status || payload.status || 'firing').toLowerCase();
            const alertname = labels.alertname || 'CRM alert';
            const summary =
              annotations.summary ||
              annotations.description ||
              `${alertname} is ${status}`;
            const description = [
              annotations.description,
              labels.component ? `Component: ${labels.component}` : undefined,
              labels.severity ? `Severity: ${labels.severity}` : undefined,
              status === 'resolved' ? 'This alert has resolved.' : undefined,
            ]
              .filter(Boolean)
              .join('\n');

            try {
              await notifications.send({
                recipients: recipientEntityRef
                  ? { type: 'entity', entityRef: recipientEntityRef }
                  : { type: 'broadcast' },
                payload: {
                  title:
                    status === 'resolved'
                      ? `Resolved: ${alertname}`
                      : summary,
                  description,
                  link: `${grafanaDomain}/alerting/list`,
                  severity: mapSeverity(status, labels.severity),
                  topic: 'alertmanager',
                  scope: `alertmanager:${labels.fingerprint || alert.fingerprint || alertname}`,
                },
              });
              sent += 1;
            } catch (error) {
              logger.warn(
                `Failed to create Backstage notification for ${alertname}: ${error}`,
              );
            }
          }

          logger.info(
            `Alertmanager webhook created ${sent} Backstage notification(s)`,
          );
          res.status(202).json({ accepted: true, notifications: sent });
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/webhook',
          allow: 'unauthenticated',
        });
      },
    });
  },
});

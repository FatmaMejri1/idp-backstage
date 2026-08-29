/*
 * Backstage Backend with Custom Platform Engineering Actions
 */

import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  scaffolderActionsExtensionPoint,
  createTemplateAction,
} from '@backstage/plugin-scaffolder-node';
import { spawnSync } from 'child_process';

// ============================================================
// Platform Engineering Custom Action: github:repo:set-secret
// Injects GHCR_PAT into the newly created GitHub repository
// using gh CLI with the Backstage integration token.
// ============================================================
const githubSetRepoSecretAction = createTemplateAction({
  id: 'github:repo:set-secret',
  description:
    'Sets a GitHub Actions secret on a repository using gh CLI and Backstage GITHUB_TOKEN.',
  schema: {
    input: {
      type: 'object',
      required: ['repoOwner', 'repoName', 'secretName'],
      properties: {
        repoOwner: {
          type: 'string',
          title: 'Repository Owner',
          description: 'GitHub username or organization',
        },
        repoName: {
          type: 'string',
          title: 'Repository Name',
          description: 'Name of the GitHub repository',
        },
        secretName: {
          type: 'string',
          title: 'Secret Name',
          description: 'Name of the GitHub Actions secret to set',
        },
        secretValue: {
          type: 'string',
          title: 'Secret Value',
          description: 'Value of the secret (optional, defaults to GITHUB_TOKEN)',
        },
      },
    },
  },
  async handler(ctx) {
    const { repoOwner, repoName, secretName, secretValue } = ctx.input as {
      repoOwner: string;
      repoName: string;
      secretName: string;
      secretValue?: string;
    };

    const token =
      secretValue ||
      ctx.integrations?.github?.byHost('github.com')?.config?.token ||
      process.env.GITHUB_TOKEN;

    if (!token) {
      ctx.logger.warn('No GitHub token available to set secret.');
      return;
    }

    ctx.logger.info(
      `Injecting GitHub Actions secret ${secretName} on ${repoOwner}/${repoName}...`,
    );

    const result = spawnSync(
      'gh',
      ['secret', 'set', secretName, '--repo', `${repoOwner}/${repoName}`],
      {
        input: token,
        env: {
          ...process.env,
          GH_TOKEN: token,
        },
        encoding: 'utf-8',
      },
    );

    if (result.status === 0) {
      ctx.logger.info(
        `Successfully configured GitHub Actions secret ${secretName} on ${repoOwner}/${repoName}!`,
      );
    } else {
      ctx.logger.warn(
        `gh secret set exited with code ${result.status}: ${result.stderr}`,
      );
    }
  },
});

// Register the custom action as a backend module
const scaffolderModuleCustomActions = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'custom-actions',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(githubSetRepoSecretAction);
      },
    });
  },
});

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);
backend.add(import('@roadiehq/scaffolder-backend-module-http-request'));

// custom platform engineering actions
backend.add(scaffolderModuleCustomActions);

// techdocs plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(import('@backstage/plugin-auth-backend-module-github-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-pg'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes plugin
backend.add(import('@backstage/plugin-kubernetes-backend'));

// user settings plugin
backend.add(import('@backstage/plugin-user-settings-backend'));

// notifications and signals plugins
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

// mcp actions plugin
backend.add(import('@backstage/plugin-mcp-actions-backend'));

backend.start();

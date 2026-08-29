/*
 * Hi!
 *
 * Note that this is an EXAMPLE Backstage backend. Please check the README.
 *
 * Happy hacking!
 */

import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  scaffolderActionsExtensionPoint,
  createTemplateAction,
} from '@backstage/plugin-scaffolder-node';

// ============================================================
// Platform Engineering Custom Action: github:repo:set-secret
// Sets a GitHub Actions secret on a repository using the
// Backstage GitHub integration token (which has write:packages).
// This solves the GHCR first-push permission issue on personal
// accounts without requiring any developer interaction.
// ============================================================
const githubSetRepoSecretAction = createTemplateAction({
  id: 'github:repo:set-secret',
  description:
    'Sets a GitHub Actions secret on a repository. Used to inject GHCR_PAT for container image publishing.',
  schema: {
    input: {
      type: 'object',
      required: ['repoOwner', 'repoName', 'secretName', 'secretValue'],
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
          description: 'Value of the secret to set',
        },
        token: {
          type: 'string',
          title: 'GitHub Token',
          description: 'GitHub PAT to use for API authentication',
        },
      },
    },
  },
  async handler(ctx) {
    const { repoOwner, repoName, secretName, secretValue, token } = ctx.input as {
      repoOwner: string;
      repoName: string;
      secretName: string;
      secretValue: string;
      token?: string;
    };

    // Use provided token or fall back to integration config
    const githubToken =
      token ||
      ctx.integrations?.github?.byHost('github.com')?.config?.token ||
      process.env.GITHUB_TOKEN;

    if (!githubToken) {
      ctx.logger.warn('No GitHub token found - skipping secret injection');
      return;
    }

    ctx.logger.info(
      `Setting secret ${secretName} on ${repoOwner}/${repoName}`,
    );

    // Step 1: Get the repo's public key for secret encryption
    const pubKeyRes = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/actions/secrets/public-key`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );

    if (!pubKeyRes.ok) {
      const err = await pubKeyRes.text();
      ctx.logger.warn(`Failed to get public key: ${pubKeyRes.status} ${err}`);
      return;
    }

    const { key, key_id } = (await pubKeyRes.json()) as {
      key: string;
      key_id: string;
    };

    // Step 2: Encrypt the secret value using libsodium-wrappers (already in node_modules)
    const sodium = await import('libsodium-wrappers');
    await sodium.ready;

    const binKey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
    const binSecretValue = sodium.from_string(secretValue);
    const encryptedBytes = sodium.crypto_box_seal(binSecretValue, binKey);
    const encryptedValue = sodium.to_base64(
      encryptedBytes,
      sodium.base64_variants.ORIGINAL,
    );

    // Step 3: Set the encrypted secret on the repository
    const setRes = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/actions/secrets/${secretName}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encrypted_value: encryptedValue,
          key_id: key_id,
        }),
      },
    );

    if (setRes.ok || setRes.status === 201 || setRes.status === 204) {
      ctx.logger.info(
        `Successfully set secret ${secretName} on ${repoOwner}/${repoName}`,
      );
    } else {
      const err = await setRes.text();
      ctx.logger.warn(
        `Failed to set secret ${secretName}: ${setRes.status} ${err}`,
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

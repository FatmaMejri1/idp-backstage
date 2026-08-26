import {
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { githubActionsApiRef } from '@backstage-community/plugin-github-actions';
import githubActionsPlugin from '@backstage-community/plugin-github-actions/alpha';
import { GithubActionsProxyClient } from './GithubActionsProxyClient';

/** Guest login cannot complete GitHub OAuth; use the backend PAT proxy instead. */
export const githubActionsWithProxy = githubActionsPlugin.withOverrides({
  extensions: [
    githubActionsPlugin.getExtension('api:github-actions').override({
      params: defineParams =>
        defineParams({
          api: githubActionsApiRef,
          deps: {
            discoveryApi: discoveryApiRef,
            fetchApi: fetchApiRef,
          },
          factory: ({ discoveryApi, fetchApi }) =>
            new GithubActionsProxyClient({ discoveryApi, fetchApi }),
        }),
    }),
  ],
});

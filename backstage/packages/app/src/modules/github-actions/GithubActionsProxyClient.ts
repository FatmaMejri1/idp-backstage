import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { GithubActionsApi } from '@backstage-community/plugin-github-actions';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';

/**
 * GitHub Actions client that calls GitHub through the Backstage proxy.
 *
 * The official plugin uses GitHub OAuth (ScmAuth → /api/auth/github/start).
 * This demo signs in as guest, so that flow 404s. The PAT stays on the backend.
 */
export class GithubActionsProxyClient implements GithubActionsApi {
  constructor(
    private readonly options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
    },
  ) {}

  private async getOctokit(): Promise<Octokit> {
    const proxyBase = await this.options.discoveryApi.getBaseUrl('proxy');
    return new Octokit({
      baseUrl: `${proxyBase}/github/api`,
      request: { fetch: this.options.fetchApi.fetch },
    });
  }

  async reRunWorkflow(options: {
    hostname?: string;
    owner: string;
    repo: string;
    runId: number;
  }): Promise<any> {
    const octokit = await this.getOctokit();
    return octokit.actions.reRunWorkflow({
      owner: options.owner,
      repo: options.repo,
      run_id: options.runId,
    });
  }

  async listWorkflowRuns(options: {
    hostname?: string;
    owner: string;
    repo: string;
    pageSize?: number;
    page?: number;
    branch?: string;
  }): Promise<
    RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']
  > {
    const octokit = await this.getOctokit();
    const workflowRuns = await octokit.actions.listWorkflowRunsForRepo({
      owner: options.owner,
      repo: options.repo,
      per_page: options.pageSize ?? 100,
      page: options.page ?? 0,
      ...(options.branch ? { branch: options.branch } : {}),
    });
    return workflowRuns.data;
  }

  async getWorkflow(options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
  }): Promise<
    RestEndpointMethodTypes['actions']['getWorkflow']['response']['data']
  > {
    const octokit = await this.getOctokit();
    const workflow = await octokit.actions.getWorkflow({
      owner: options.owner,
      repo: options.repo,
      workflow_id: options.id,
    });
    return workflow.data;
  }

  async getWorkflowRun(options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
  }): Promise<
    RestEndpointMethodTypes['actions']['getWorkflowRun']['response']['data']
  > {
    const octokit = await this.getOctokit();
    const run = await octokit.actions.getWorkflowRun({
      owner: options.owner,
      repo: options.repo,
      run_id: options.id,
    });
    return run.data;
  }

  async listJobsForWorkflowRun(options: {
    hostname?: string;
    owner: string;
    repo: string;
    id: number;
    pageSize?: number;
    page?: number;
  }): Promise<
    RestEndpointMethodTypes['actions']['listJobsForWorkflowRun']['response']['data']
  > {
    const octokit = await this.getOctokit();
    const jobs = await octokit.actions.listJobsForWorkflowRun({
      owner: options.owner,
      repo: options.repo,
      run_id: options.id,
      per_page: options.pageSize ?? 100,
      page: options.page ?? 0,
    });
    return jobs.data;
  }

  async downloadJobLogsForWorkflowRun(options: {
    hostname?: string;
    owner: string;
    repo: string;
    runId: number;
  }): Promise<
    RestEndpointMethodTypes['actions']['downloadJobLogsForWorkflowRun']['response']['data']
  > {
    const octokit = await this.getOctokit();
    const workflow = await octokit.actions.downloadJobLogsForWorkflowRun({
      owner: options.owner,
      repo: options.repo,
      job_id: options.runId,
    });
    return workflow.data;
  }

  async listBranches(options: {
    hostname?: string;
    owner: string;
    repo: string;
    page: number;
  }): Promise<
    RestEndpointMethodTypes['repos']['listBranches']['response']['data']
  > {
    const octokit = await this.getOctokit();
    const response = await octokit.rest.repos.listBranches({
      owner: options.owner,
      repo: options.repo,
      per_page: 100,
      page: options.page,
    });
    return response.data;
  }

  async getDefaultBranch(options: {
    hostname?: string;
    owner: string;
    repo: string;
  }): Promise<
    RestEndpointMethodTypes['repos']['get']['response']['data']['default_branch']
  > {
    const octokit = await this.getOctokit();
    const response = await octokit.rest.repos.get({
      owner: options.owner,
      repo: options.repo,
    });
    return response.data.default_branch;
  }
}

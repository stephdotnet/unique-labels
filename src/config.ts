import * as core from '@actions/core'

/**
 * action.yaml definition.
 */
export interface ActionConfig {
  // GitHub API token for making requests.
  token: string
  repo: string
  owner: string
  labels: string[]
}

export const defaultBreakingChangeLabel = 'breaking-change'

export function getConfig({
  repo,
  owner
}: {
  repo: ActionConfig['repo']
  owner: ActionConfig['owner']
}): ActionConfig {
  return {
    repo,
    owner,
    token: core.getInput('token', { required: true }),
    labels: core.getInput('labels') ? JSON.parse(core.getInput('labels')) : []
  }
}

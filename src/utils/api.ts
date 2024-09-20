import * as Github from '@actions/github'
import { ActionConfig } from '../config'
import { Unarray } from '../types/utils'
import * as octokitTypes from '@octokit/plugin-rest-endpoint-methods'

export type Octokit = ReturnType<(typeof Github)['getOctokit']>

let config: ActionConfig
let octokit: Octokit

export function init(cfg?: ActionConfig): void {
  if (!cfg) {
    throw Error('No cfg given')
  }

  config = cfg
  octokit = Github.getOctokit(config.token)
}

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
export type GetPRsWithLabelReturnType = Unarray<
  Awaited<ReturnType<Octokit['rest']['issues']['listForRepo']>>['data']
>

export async function getPRsWithLabel(
  label: string
): Promise<GetPRsWithLabelReturnType[]> {
  const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
    owner: config.owner,
    repo: config.repo,
    state: 'open',
    label,
    per_page: 1
  })

  const pr: GetPRsWithLabelReturnType[] = []

  for await (const response of iterator) {
    pr.push(...response.data)
  }

  return pr
}

export type RemoveLabelFromPRReturnType = Promise<
  octokitTypes.RestEndpointMethodTypes['issues']['removeLabel']['response']
>
export async function removeLabelFromPR(
  label: string,
  prNumber: number
): RemoveLabelFromPRReturnType {
  return octokit.rest.issues.removeLabel({
    owner: config.owner,
    repo: config.repo,
    issue_number: prNumber,
    name: label
  })
}

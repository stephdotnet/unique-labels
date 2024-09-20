import * as core from '@actions/core'
import * as github from '@actions/github'
import { getConfig } from './config'
import * as api from './utils/api'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const context = github.context

    const eventName = context.eventName
    const repo = context.repo.repo
    const owner = context.repo.owner
    const eventAction = context.payload.action
    const eventLabel = context.payload.label
    const eventPRNumber = context.payload.number

    if (eventName !== 'pull_request' || eventAction !== 'labeled') {
      core.info(`Aborted action since it's not a labeled pull request event`)
      return
    }

    const config = getConfig({
      repo,
      owner
    })

    if (!config.labels.includes(eventLabel?.name)) {
      core.info(
        `The PR Label ${eventLabel?.name} is not configured as unique. Action will now terminate`
      )
      return
    }

    api.init(config)

    const prs = await api.getPRsWithLabel(eventLabel.name)

    for (const pr of prs) {
      if (pr.number !== eventPRNumber) {
        core.info(
          `Removing label ${eventLabel.name} from PR number ${pr.number}`
        )
        await api.removeLabelFromPR(eventLabel.name, pr.number)
      } else {
        core.info(
          `Not removing label ${eventLabel.name} from PR number ${pr.number} because it intiated event`
        )
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

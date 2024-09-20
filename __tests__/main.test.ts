/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as github from '@actions/github'
import * as main from '../src/main'
import { Context } from '@actions/github/lib/context'
import * as config from '../src/config'
import * as api from '../src/utils/api'
import pullRequests from './fixtures/pull-requests'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
const getConfigMock: jest.SpiedFunction<typeof config.getConfig> = jest.spyOn(
  config,
  'getConfig'
)
let apiInitMock: jest.SpiedFunction<typeof api.init>
let apiGetPRsWithLabelMock: jest.SpiedFunction<typeof api.getPRsWithLabel>
let apiRemoveLabelFromPRMock: jest.SpiedFunction<typeof api.removeLabelFromPR>

// Mock the GitHub Actions core library
let infoMock: jest.SpiedFunction<typeof core.info>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    process.env.GITHUB_EVENT_PATH = '__tests__/fixtures/event.json'
    process.env.GITHUB_EVENT_NAME = 'pull_request'

    Object.defineProperty(github, 'context', {
      value: { ...new Context(), repo: { repo: 'test', owner: 'test' } }
    })

    jest.spyOn(core, 'debug').mockImplementation()
    infoMock = jest.spyOn(core, 'info').mockImplementation()
    jest.spyOn(core, 'error').mockImplementation()
    jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('Aborts if event name is not PR', async () => {
    Object.defineProperty(github, 'context', {
      value: { ...github.context, eventName: null }
    })
    await main.run()

    expect(runMock).toHaveReturned()
    expect(infoMock).toHaveBeenCalledWith(
      "Aborted action since it's not a labeled pull request event"
    )
  })
  it('Aborts if event action is not labeled', async () => {
    Object.defineProperty(github, 'context', {
      value: {
        ...github.context,
        payload: {
          ...github.context.payload,
          label: null
        }
      }
    })
    await main.run()

    expect(runMock).toHaveReturned()
    expect(infoMock).toHaveBeenCalledWith(
      'The PR Label undefined is not configured as unique. Action will now terminate'
    )
  })

  it('Aborts if PR labeled with label not in configuration', async () => {
    Object.defineProperty(github, 'context', {
      value: {
        ...github.context,
        payload: {
          ...github.context.payload,
          label: {
            name: 'test'
          }
        }
      }
    })

    getConfigMock.mockReturnValue({
      ...config.getConfig({ repo: 'test', owner: 'test' }),
      labels: ['bug']
    })

    await main.run()

    expect(runMock).toHaveReturned()
    expect(infoMock).toHaveBeenCalledWith(
      'The PR Label test is not configured as unique. Action will now terminate'
    )
  })

  it('Removes label from the PR that did not run the workflow', async () => {
    Object.defineProperty(github, 'context', {
      value: {
        ...github.context,
        payload: {
          ...github.context.payload,
          label: {
            name: 'bug'
          }
        }
      }
    })

    const configResult = config.getConfig({ repo: 'test', owner: 'test' })
    const configResultMock = {
      ...configResult,
      labels: ['bug']
    }
    getConfigMock.mockReturnValue(configResultMock)

    apiInitMock = jest.spyOn(api, 'init').mockReturnValue()
    apiGetPRsWithLabelMock = jest
      .spyOn(api, 'getPRsWithLabel')
      .mockReturnValue(
        Promise.resolve(pullRequests as api.GetPRsWithLabelReturnType[])
      )
    apiRemoveLabelFromPRMock = jest
      .spyOn(api, 'removeLabelFromPR')
      .mockImplementation()

    await main.run()

    expect(getConfigMock).toHaveBeenCalledWith({ repo: 'test', owner: 'test' })
    expect(apiInitMock).toHaveBeenCalledWith(configResultMock)
    expect(apiGetPRsWithLabelMock).toHaveBeenCalledWith('bug')
    expect(apiRemoveLabelFromPRMock).toHaveBeenCalledWith('bug', 4)

    expect(infoMock).toHaveBeenCalledWith('Removing label bug from PR number 4')
    expect(infoMock).toHaveBeenCalledWith(
      'Not removing label bug from PR number 5 because it intiated event'
    )
  })

  it('calls setFailed when error Thrown', async () => {
    getConfigMock.mockImplementation(() => {
      throw new Error()
    })

    await main.run()

    expect(setFailedMock).toHaveBeenCalled()
  })
})

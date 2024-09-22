import * as core from '@actions/core'
import { getConfig } from '../src/config'

describe('config', () => {
  beforeEach(() => {
    jest.spyOn(core, 'getInput').mockImplementation((input: string) => {
      switch (input) {
        case 'repo':
          return inputs.repo
        case 'owner':
          return inputs.owner
        case 'token':
          return inputs.token
        case 'labels':
          return inputs.labels
        default:
          throw new Error('Invalid input')
      }
    })
  })
  it('should return array of labels', async () => {
    const config = getConfig({ repo: 'test', owner: 'test' })

    expect(config).toEqual({
      repo: 'test',
      owner: 'test',
      token: 'token',
      labels: ['label-one', 'label-two']
    })
  })

  it('should return empty array if no labels', async () => {
    inputs.labels = ''

    const config = getConfig({ repo: 'test', owner: 'test' })

    expect(config).toEqual({
      repo: 'test',
      owner: 'test',
      token: 'token',
      labels: []
    })
  })
})

const inputs = {
  repo: 'my-repo',
  owner: 'the-owner',
  token: 'token',
  labels: '["label-one", "label-two"]'
}

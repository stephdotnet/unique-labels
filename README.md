# Unique PR labels

![CI](https://github.com/stephdotnet/unique-labels/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/stephdotnet/unique-labels/actions/workflows/check-dist.yml/badge.svg)](https://github.com/stephdotnet/unique-labels/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/stephdotnet/unique-labels/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/stephdotnet/unique-labels/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Setting up action

Create a `.github/workflows/unique-labels.yml`

```yaml
on:
  pull_request:
    types: [opened, edited]

name: unique-pr-labels
jobs:
  label:
    permissions:
      contents: read
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - uses: stephdotnet/unique-labels@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          labels: ['label-one', 'label-two']
```

## Contributing

The following options allow you to test the action live (using local-action or
act) or using jest. In any cases you'll have to run all the tests before
submitting the PR (jest + lint)

- Run `npm install`
- Make the changes
- Run `npm run all`
- Open a pull request

### Running the action live

- Add .env containing
  - `GITHUB_EVENT_PATH`
  - `GITHUB_EVENT_PATH`
  - `INPUT_GITHUB_TOKEN`
  - `INPUT_LABELS`
- Run `npm install`
- Make the changes
- Run `local-action run ./ src/index.ts .env` (if you're using
  https://github.com/github/local-action)

### Running tests

- Run `npm install`
- Make the changes
- Run `npm run test`

| All api calls are mocked and test contexts/fixtures available in the
`__tests__/fixtures` folder

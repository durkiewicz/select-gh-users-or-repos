# Project Title: Select GitHub Users or Repositories

For a documentation of the components, as well as for a live demo, please visit 
[this link](https://select-gh-users-or-repos.up.railway.app).

## Description

This is a self-contained React component library that consists of two components:
- [AutoComplete](src/components/AutoComplete.tsx): A generic component that provides an autocomplete input field.
- [SelectGitHubUserOrRepo](src/components/SelectGitHubUserOrRepo.tsx): A component that allows users to select GitHub 
  users or repositories. It also demonstrates the usage of the AutoComplete component.

The library does not depend on any external libraries (apart from React and React-DOM declared as peer dependencies),
making it easy to integrate into any React project.

## Development

To install the dependencies, run:

```bash
npm ci
```

To build the library, run:

```bash
npm run build
```

To start the Storybook server, run:

```bash
npm run storybook
```

To run the tests, run:

```bash
npm test
```

To lint the code, run:

```bash
npm run lint
```

# Architecture

Aeon is built to reach out to various platforms, gather data, store it and then report it to the user. This page will go into detail into how these goals are worked out technically. 

## Technologies

### TypeScript

The entire Aeon codebase is written in [TypeScript](https://www.typescriptlang.org/). TypeScript is a language that compiles to Javascript, with the additional benefit of types, describing inputs outputs and datatypes. TypeScript is not only used for a better developer experience, but the data typing system actually relies heavily on TypeScript enums and data formats.

### Electron

Aeon is built on Electron, and leverages its integration with browsers heavily to use existing data download workflows to gather data. Electronc consists of a NodeJS back-end \(called `main` in Electron parlance and the Aeon codebase\) coupled with a Chromium front-end \(dito, called `app`\). You'll find that the codebase is neatly seperated along these lines, with the `src/main` folder containg all back-end code and the `src/app` folder containing all front-end code.

Following Electron best-practices, these environments run seperately and are sandboxes, to prevent external webpages from getting system-level access through NodeJS. This means that communication between the front-end and back-end happens through a set of [bridges](https://www.electronjs.org/docs/api/context-bridge) \(for example, see the [RepositoryBridge](https://github.com/leinelissen/aeon/blob/master/src/main/lib/repository/bridge.ts) and the app-side [Repository utility](https://github.com/leinelissen/aeon/blob/master/src/app/utilities/Repository.ts)\). All front-end calls to the back-end should go through these bridges to ensure security. Additionally, [the preload file](https://github.com/leinelissen/aeon/blob/master/src/app/preload.ts) specifies some unique cases where the front-end has access to back-end methods.

### React

The front-end of the application is built out using [React](https://reactjs.org/), a Javascript framework that allows the building out of reactive interfaces in browsers. The `src/app` folder contains the entire front-end and is seperated out into assets, components, pages, store, style and utilities. Each interface screen is specified in `src/app/pages` and may pull in components from other directories. Styling is done using [Styled Components](https://styled-components.com/), routing using [React Router](https://reactrouter.com/) and the store is backed by [undux](https://undux.org/).

### Git

In order to version incoming data, Aeon builds and updates a local Git repository that is bundled with the application. Aeon interfaces with this repository through [NodeGit](https://www.nodegit.org/), a set of NodeJS bindings for the widely used libgit2 library. All interfacing with the repository is done in NodeJS, though there is a bridge available for calling certain functions from the front-end.

## Concepts

### Providers

The first point of Aeon is making sure data is retrieved from a series of sources. These sources are abstracted into **Providers**. In Aeon, a _Provider_ is a binding for a particular platform \(e.g. Facebook, Instagram, LinkedIn\) that can directly pull data, initiate data requests, download data and parse data. For more detailed info on the inner workings of providers, and how to write one, find the particular page.

>

{% page-ref page="providers.md" %}






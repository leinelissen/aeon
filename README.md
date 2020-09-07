![Aeon](https://raw.githubusercontent.com/leinelissen/aeon/master/src/app/assets/aeon-logo.svg)

![Build](https://github.com/leinelissen/aeon/workflows/Build/badge.svg)
[![Depfu](https://badges.depfu.com/badges/ff7165e5aae595f0e17058ce40fdbe68/overview.svg)](https://depfu.com/github/leinelissen/aeon?project_id=13989)

## About Aeon
Your online identity is formed by the data that defines you. With ground-breaking laws such as the EU GDPR and US CCPA, data rights are within reach for citizens. Aeon aims to bridge the gap between data rights and citizen control over data.

Aeon is an online identity tool that automatically retrieves data from a variety of sources. Just like your identity is yours to change, so should your data be. Aeon makes sending a request for data deletion and modification available at the click of a button.

When maintaining your online identity, Aeon becomes a repository of how your identity has evolved over time. This repository is in your control, rather than in the hands of commercial interests.

## About the author
Aeon is being conceived and actively developed as part of a master graduation project at the department of Industrial Design, Eindhoven University of Technology. It is created by Lei Nelissen, a graduate student with a particular interest in data rights, privacy and the user experience of both. 

Get in touch with Lei via [e-mail](mailto:l.g.m.nelissen@student.tue.nl), or pick any of the regular communication channels.

## Using Aeon
You can find the latest build of Aeon over at the [releases page](https://github.com/leinelissen/aeon/releases). There's builds for Windows, macOS and Linux. 

If you're feeling more adventurous, clone the repository and compile your own nightly build. The only dependency is [NodeJS](https://nodejs.org/en/download/package-manager/).
```
npm install
npm start
```

## The Technical Stuff
Aeon is an [Electron](https://www.electronjs.org/)-based app, a mature platform for building JavaScript applications on the desktop. It is backed by a locally encrypted Git repository, made available through use of the excellent [nodegit](https://www.nodegit.org/) package.

A custom and modular back-end allows for tracking and retrieving data from multiple sources. This is done through retrieval from an API, asynchronous data requests or a combination of both. Parser logic then allows for extracting common data types from the resulting JSON. 

Docs describing how providers are to be added will be provided soon'ish.

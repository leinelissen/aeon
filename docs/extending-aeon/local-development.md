# Local Development

As Aeon is a desktop app, yout development happens locally as well. In this guide, we'll go step by step what you need to do, to get Aeon set up locally and get started on its development.

### Working with the terminal

Aeon is built using command line tools \(sometimes abbreviated as CLI\). These are tools that don't use neat graphical interfaces, but a terminal interface: the old-school style text-based screen you usually only see in movies. To access the command line, you need to open up a terminal in your operating system. Either use one of your OS-provided terminals \(Terminal for macOS and Ubuntu; Command Prompt for Windows\), or find a cross-platform terminal app such as [Hyper](https://hyper.is/).

We actually recommend working with [Visual Studio Code](https://code.visualstudio.com/) for this reason: it comes with a terminal built-in! You can open it up with Ctrl + Backtick on Windows/Linux and Cmd + Backtick on macOS. Do make sure you know how to operate your terminal before you start working on Aeon. To help you get along, find this [guide on how to operate the Ubuntu terminal](https://ubuntu.com/tutorials/command-line-for-beginners#1-overview). You'll find that the macOS and Linux terminal are actually pretty similar once you get inside.

These guides will assume you are working on a UNIX terminal \(e.g. bash, zsh, fish\), as these work across macOS, FreeBSD and Linux distributions. If you are on a Windows machine and you cannot translate these to Command Prompt or Powershell commands yourself, consider installing the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10). This allows you to run a bash terminal on Windows, on which all commands in this guide should work flawlessly.

### Prerequisites

Aeon is based on [Electron](https://www.electronjs.org/), a tool that combines the [Chromium](https://www.chromium.org/) browser \(on which [Chrome](https://www.google.com/chrome/) is built\) with a NodeJS \(best described as server-side Chromium again\) back-end in a single, executable desktop package. It is no suprise that everything is written in Javascript. In order to get started, you're going to need a couple of tools so that we can actually compile and run the application. These are as follows:

#### Git

A version control tool for code: Git helps you make small changes to a large codebase such as Aeon's. Either [install the binary directly](https://git-scm.com/downloads), or use one of your favorite package managers:

Windows \([Chocolatey](https://chocolatey.org/docs/installation)\)

```text
choco install git
```

macOS \([Homebrew](https://brew.sh/)\)

```text
brew install git
```

Ubuntu \(apt\)

```text
sudo apt-get install git
```

#### NodeJS

A server runtime for JavaScript: helps you build powerful Javascript-based applications that can run on the desktop rather than the web! Either [install the binary directly](https://nodejs.org/en/) or use one of your favorite package managers:

Windows \([Chocolatey](https://chocolatey.org/docs/installation)\)

```text
choco install nodejs
```

macOS \([Homebrew](https://brew.sh/)\)

```text
brew install node
```

For Linux installs, find the relevant package manager of your choice in the [NodeJS install guide](https://nodejs.org/en/download/package-manager/).

### Cloning the repository

Now that you have installed all prerequisites, you need the source code that compiles to the Aeon application. Fortunately, this is accessible from GitHub and you can copy it to your computer very easily. First, make sure you navigate to the folder that will hold the folder containing all the Aeon code. Make sure you navigate to a particular folder on your own system.

```text
cd Documents/Code
```

Now that we're in the directory, we're going to copy the entire codebase to a folder within this directory. This operation is called cloning in Git terminology. You do it as follows:

```text
git clone https://github.com/leinelissen/aeon
```

When the command finishes, the Aeon codebase should be found in a folder called `aeon`. Navigate into this folder to get started on installing dependencies.

```text
cd aeon
```

### Installing dependencies

Aeon builds upon lots of tools and libraries that make working with data, interfaces and other stuff a lot easier. These dependencies must be installed first, before we can start compiling the application. You do this as follows:

```text
npm install
```

### Development Mode

In order to make development really easy, Aeon has a development mode that incrementally compiles Aeon and runs it immediately. This means that when you change a file, the application is re-compiled and reloaded. To start development mode, run the following command:

```text
npm run start
```

#### Using the Visual Studio Code Debugger

The repository also includes a basic setup for integrating the VSCode debugger. This allows you to inspect objects that are logged, set breakpoints and do object inspection while you are developing. To use it, either press `F5` or run `Electron Main` from the debugger tab.

### Compiling

If you want to generate an application package for distribution, you can run a build command as follows:

```text
npm run make
```

When the command finishes \(note: this may take a while\), you can find a build for your specific platform in the `out/make` folder.

### What's next?

Now that you know how that make local development work, have a look at the architecture diagram, and how specific core concepts work. If you feel adventurous, you can get to work and start creating pull requests with new features.

{% page-ref page="architecture/" %}

{% page-ref page="reporting-issues.md" %}






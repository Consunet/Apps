# WhisperNote Encrypted Note

## Introduction
A self-contained web app which provides encrypted storage of Password information.
The data is encrypted using the [Built in browser encryption](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) and base64 encoded within the file.

## Developer information

### Project structure

```
WhisperNote
+-- imgs                (Image assets)
+-- locale              (Stores strings for internationalisation)
+-- dist                (Stores built components)
+-- public_html         (Server output)
|-- src
|    +-- tests          (Selenium / Unit tests)
|    |-- app.js         (Application Javascript source)
|    |-- app.css        (Application Styling - customized Twitter Bootstrap file)
|    |-- app.html       (HTML Template which encapsulates Javascript and CSS)
|    |-- index.js       (Webpack entry-point)
|
|-- webpack.config.js   (Webpack configuration)
|-- README.md           (This document)
|-- package.json        (NPM metadata and dependency information)
```
### Installing GeckoDriver
wget https://github.com/mozilla/geckodriver/releases/download/v0.24.0/geckodriver-v0.24.0-linux64.tar.gz
tar -xvzf geckodriver*
chmod +x geckodriver
sudo mv geckodriver /opt/
export PATH=$PATH:/opt/geckodriver

### Build

This project uses [Webpack](https://webpack.js.org/) for the automation of JavaScript tasks like CSS, JS and HTML minification, and running tests.

Selenium and Mocha are used for testing and are thus dependencies.
Istanbul is used for code coverage.

Once you have cloned the repository, the required steps to build the project are:

1. Download and Install [NodeJS](http://nodejs.org/download/). This includes the Node Package Manager (or [NPM](https://npmjs.org/)). Ensure that you are installing a version greater than 10.0. Apt-get will only install up to 4.2.4, [this link](http://nodesource.com/blog/installing-node-js-8-tutorial-linux-via-package-manager/) may help for Linux users.
2. Install [geckodriver](https://github.com/mozilla/geckodriver) and add it to your PATH
5. From within common and EveryPass folders, install project dependencies using: ```npm install ```
6. Run ```npm run start:dev``` from within EveryPass directory.
7. The built distributions are made available within the dist folder, under their respective locales
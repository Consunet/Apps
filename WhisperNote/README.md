# WhisperNote Encrypted Note

## Introduction
A self-contained web app which provides encrypted storage of text and binary data in a single HTML file.
The data is encrypted using the [Stanford Javascript Crypto Library](http://crypto.stanford.edu/sjcl/) and base64 encoded within the file.

## Developer information

### Project structure

```
WhisperNote
+-- lib                 (Minified Javascript library dependencies)
+-- locales             (Stores strings for internationalisation)
+-- nbproject           (NetBeans IDE data)
+-- dist                (Stores built components)
+-- public_html         (Final html output)
|-- src
|    |-- app.js         (Application Javascript source)
|    |-- app.css        (Application Styling)
|    |-- app.html       (HTML Template which encapsulates Javascript and CSS)
|
|-- Gruntfile.js        (Build script)
|-- README.md           (This document)
|-- package.json        (NPM metadata and dependency information)
```

### Build

This project uses [Grunt](http://gruntjs.com/) for the automation of JavaScript tasks like CSS, JS and HTML minification, and running tests.

Once you have cloned the repository, the required steps to build the project are:
This project uses [Grunt](http://gruntjs.com/) for the automation of JavaScript tasks like CSS, JS and HTML minification, and running tests.

Selenium and Mocha are used for testing and are thus dependencies.
Istanbul is used for code coverage.

Once you have cloned the repository, the required steps to build the project are:

If you are using a x32 or x64 Linux machine, you may be able to use the install.sh script located at the root Apps directory. To do this simply ```chmod +x install.sh``` and then ```./install.sh```. If this works you may skip steps 1-5 below.

1. Download and Install [NodeJS](http://nodejs.org/download/). This includes the Node Package Manager (or [NPM](https://npmjs.org/)). Ensure that you are installing a version greater than 8.0. Apt-get will only install up to 4.2.4, [this link](http://nodesource.com/blog/installing-node-js-8-tutorial-linux-via-package-manager/) may help for Linux users.
2. Install [geckodriver](https://github.com/mozilla/geckodriver) and add it to your PATH
3. Install [Istanbul](https://github.com/gotwarlost/istanbul) by typing  ```npm install -g istanbul```
4. Install the [Grunt CLI](http://gruntjs.com/getting-started) by typing: ```npm install -g grunt-cli```
5. From within common and WhisperNote folders, install project dependencies using: ```npm install ```
6. Run Grunt with ```grunt``` from within WhisperNote directory.
7. The built distributions are made available within the public_html folder, under their respective locales

### Development Tips

There are multiple ways that grunt can be called, each providing different ways for building or testing. ```grunt coverage``` will run the mocha tests and output the coverage to a html file. ```grunt manualcoverage``` will open a firefox browser for manual testing and create a coverage report after. ```grunt dualcoverage``` is a combination of the previous two, it will run the automated testing and then open a browser for manual testing. The coverage report produced is an aggregate of the both testing types.

There is also ```grunt notest``` which will skip the testing and coverage and just build the public_html files.

Finally ```grunt debug``` can be used to skip the minification of the javascript files to make debugging easier.

### Lessons learnt
#### SJCL vs CryptoJS
[CryptoJS](http://code.google.com/p/crypto-js/) is another Javascript cryptography library that was evaluated for use for this project.
The initial analysis showed that it provided similar functionality and performance to SJCL, but is not as mature as SJCL.
Thus, SJCL was the chosen library.

#### Binary data chunking
Binary data is stored in "chunks" within the HTML file.
This is because the SJCL library struggles to encrypt a large amount of data at a time - it runs very slowly.
Therefore the file is broken up into chunks, and each chunk is encrypted. The chunks are then reassembled on decryption.

## Technology review
The following technologies were considered for use in this app:

### Testing

#### CasperJS with PhantomJS
CasperJS was used with PhantomJS for testing but when the project moved to a browser based encryption in v1.4, the headless browserless setup was no longer was able to test encryption and as such the testing suite was changed.
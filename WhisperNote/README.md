# WhisperNote Encrypted Note

## Introduction
A self-contained web app which provides encrypted storage of text and binary data in a single HTML file.
The data is encrypted using the [Stanford Javascript Crypto Library](http://crypto.stanford.edu/sjcl/) and base64 encoded within the file.

## Developer information

### Project structure

```
WhisperNote
+-- lib                 (Minified Javascript library dependencies)
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

1. Download and Install [NodeJS](http://nodejs.org/download/). This includes the Node Package Manager (or [NPM](https://npmjs.org/)).
2. (Windows Only) Download and Install [Python 2.x](https://www.python.org/downloads/). Put the Python binary on the System PATH.
3. (Windows Only) Download and Install [Microsoft Visual C++ 2010 Express](http://www.visualstudio.com/en-us/downloads#d-2010-express).
4. (Windows Only) Download and Install [Microsoft Windows SDK for Windows 7 and .NET Framework 4](http://www.microsoft.com/en-au/download/details.aspx?id=8279).
5. (Windows Only) Download and Install [Microsoft Visual C++ 2010 Service Pack 1 Compiler Update for the Windows SDK 7.1](http://www.microsoft.com/en-us/download/details.aspx?id=4422).
6. Install PhantomJS (http://phantomjs.org/download.html) and add it to your PATH
7. Install CasperJS (http://casperjs.org/) and add the executable in batchbin to your PATH
8. Install the [Grunt CLI](http://gruntjs.com/getting-started) by typing: ```npm install -g grunt-cli```
9. From the project's root, install project dependencies using: ```npm install ```
10. Run Grunt with ```grunt```

### Lessons learnt
#### SJCL vs CryptoJS
[CryptoJS](http://code.google.com/p/crypto-js/) is another Javascript cryptography library that was evaluated for use for this project.
The initial analysis showed that it provided similar functionality and performance to SJCL, but is not as mature as SJCL.
Thus, SJCL was the chosen library.

#### Binary data chunking
Binary data is stored in "chunks" within the HTML file.
This is because the SJCL library struggles to encrypt a large amount of data at a time - it runs very slowly.
Therefore the file is broken up into chunks, and each chunk is encrypted. The chunks are then reassembled on decryption.
# EveryPass Password Manager

## Introduction
A self-contained web app which provides encrypted storage of Password information.
The data is encrypted using the [Stanford Javascript Crypto Library](http://crypto.stanford.edu/sjcl/) and base64 encoded within the file.

## Developer Guide
### Project structure

```
EveryPass
+-- lib                 (Minified Javascript library dependencies)
+-- locales             (Stores strings for internationalisation)
+-- nbproject           (NetBeans IDE data)
+-- dist                (Stores built components)
+-- public_html         (Final html output)
|-- src
|    |-- app.js         (Application Javascript source)
|    |-- app.css        (Application Styling - customized Twitter Bootstrap file)
|    |-- app.html       (HTML Template which encapsulates Javascript and CSS)
|
|-- Gruntfile.js        (Build script)
|-- README.md           (This document)
|-- package.json        (NPM metadata and dependency information)
```

### Build

This project uses [Grunt](http://gruntjs.com/) for the automation of JavaScript tasks like CSS, JS and HTML minification, and running tests.

Selenium and Mocha are used for testing and are thus dependencies.
Istanbul is used for code coverage.

Once you have cloned the repository, the required steps to build the project are:

If you are using a x32 or x64 Linux machine, you may be able to use the install.sh script located at the root Apps directory. To do this simply ```chmod +x install.sh``` and then ```./install.sh```. If this works you may skip steps 1-5 below.

1. Download and Install [NodeJS](http://nodejs.org/download/). This includes the Node Package Manager (or [NPM](https://npmjs.org/)). Ensure that you are installing a version greater than 8.0. Apt-get will only install up to 4.2.4, [this link](http://nodesource.com/blog/installing-node-js-8-tutorial-linux-via-package-manager/) may help for Linux users.
2. Install [geckodriver](https://github.com/mozilla/geckodriver) and add it to your PATH
3. Install [Istanbul](https://github.com/gotwarlost/istanbul) by typing  ```npm install -g istanbul```
4. Install the [Grunt CLI](http://gruntjs.com/getting-started) by typing: ```npm install -g grunt-cli```
5. From within common and EveryPass folders, install project dependencies using: ```npm install ```
6. Run Grunt with ```grunt``` from within EveryPass directory.
7. The built distributions are made available within the public_html folder, under their respective locales

### Development Tips

There are multiple ways that grunt can be called, each providing different ways for building or testing. ```grunt coverage``` will run the mocha tests and output the coverage to a html file. ```grunt manualcoverage``` will open a firefox browser for manual testing and create a coverage report after. ```grunt dualcoverage``` is a combination of the previous two, it will run the automated testing and then open a browser for manual testing. The coverage report produced is an aggregate of the both testing types.

There is also ```grunt notest``` which will skip the testing and coverage and just build the public_html files.

Finally ```grunt debug``` can be used to skip the minification of the javascript files to make debugging easier.

## Technology review
The following technologies were considered for use in this app:

### Testing

#### CasperJS with PhantomJS
CasperJS was used with PhantomJS for testing but when the project moved to a browser based encryption in v1.4, the headless browserless setup was no longer was able to test encryption and as such the testing suite was changed.

### Databinding
The following Databinding libraries were considered for use in this project, however it was decided that databinding libraries should not be used.

#### AngularJS
An initial prototype was developed using AngularJS. The interface was functional but the library was found to be too heavyweight for this purpose.
It also injects its own Javascript into the DOM which makes it unsuitable for saving out the document outer HTML element to a file.

#### KnockoutJS
KnockoutJS is a databinding library that is lighterweight than AngularJS.
It could not be incorporated into the current build process because the minified Javascript is not properly escaped.
It includes end script tags which didn't work with the current build, as all of the Javascript is included in the single HTML file in enclosing script tags.

#### Rivets
Rivets is a lightweight databinding library that works well with other Javascript Model libraries like Backbone, Spine and Stapes.
It listens to changes to objects and update the DOM accordingly.
We chose to move away from Rivets (and databinding) in general for performance reasons.
It was decided that observing many objects for databinding was not going to scale well, especially on older browsers.

### Templating

#### Hogan
Hogan is a lightweight javascript templating engine that works with Mustache style templates.
It is around 15KB, and therefore a good size for use in the project.
It was decided that the app should be simple enough to not require a templating solution and therefore it was not further pursued.

### CSS
Twitter Bootstrap is used to provide the styling and responsive layout for the app.
It provides a clean, standard design and is fully customizable and therefore is a good choice for this project.

Customized bootstrap components include:
- Print media styles
- Typography
- Grid system
- Forms
- Buttons
- Navs and Navbar (with @grid-float-breakpoint = 320px)
- Jumbotron
- Panels
- Basic utilities
- Responsive utilities

A customised version of Bootstrap theme is also included (in a separate bootstrap-theme.css)

#### CSS Optimizers
To further refine the CSS, it is possible to find and remove unused selectors.
The following tools were investigated:

##### Grunt-uncss (chosen)
This [project](https://github.com/addyosmani/grunt-uncss) incorporates removal of unused CSS selectors within a Grunt build, and is currently used in this project.

##### Dust me selectors Firefox plugin 
Simple to setup, but was not successful in obtaining optimized CSS.

##### Chrome Audit tool
Simple to use, but does not provide raw CSS.

##### Mincss Python library (https://github.com/peterbe/mincss)
Difficult to setup, could not get successful output after about an hour of trying.

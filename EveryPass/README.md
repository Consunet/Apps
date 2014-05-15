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

PhantomJS and CasperJS are used for functional testing and are thus dependencies.

Once you have cloned the repository, the required steps to build the project are:

1. Download and Install [NodeJS](http://nodejs.org/download/). This includes the Node Package Manager (or [NPM](https://npmjs.org/)).
2. Install PhantomJS (http://phantomjs.org/download.html) and add it to your PATH
3. Install CasperJS 1.1-beta3 (http://casperjs.org/) and add the executable in batchbin to your PATH
4. Install the [Grunt CLI](http://gruntjs.com/getting-started) by typing: ```npm install -g grunt-cli```
5. From the project's root, install project dependencies using: ```npm install ```
6. Run Grunt with ```grunt```

### Development Tips

During development run ```grunt watch``` from the project root.
This will watch for changes to source files, and upon save it will build a debuggable (non-minified) version of the app under ```public_html/index.html```.
It will also run the tests after it is built.

JSDoc documentation may be generated using: ```grunt jsdoc```

## Technology review
The following technologies were considered for use in this app:

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
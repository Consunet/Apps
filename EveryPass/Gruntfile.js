/*global module:false*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                '*/\n',
        // Task configuration.
        clean: ["dist/*", "public_html/*"],
        concat: {
            options: {
                stripBanners: true
            },
            js: {
                src: [
                    'lib/sjcl.js',
                    'lib/Blob.js',
                    'lib/FileSaver.js',
                    'lib/es6-promise.js',
                    'lib/encoding-indexes.js',
                    'lib/encoding.js',
                    'lib/webcrypto-shim.js',
                    '../common/src/constants.js',
                    '../common/src/common.js',
                    'src/constants.js',
                    'src/app.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            },
            css: {
                src: [
                    '../common/src/css/bootstrap.css',
                    '../common/src/css/bootstrap-theme.css',
                    '../common/src/css/app.css',
                    'css/new-question.css'
                ],
                dest: 'dist/<%= pkg.name %>.css'
            }
        },
        uglify: {
            dist: {
                src: '<%= concat.js.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    removeCDATASectionsFromCDATA: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: false,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeEmptyElements: false,
                    keepClosingSlash: false
                },
                files: {
                    'public_html/index.html': 'dist/<%= pkg.name %>_built.html'
                }
            }
        },
        i18n: {
            default: {
                src: ['public_html/index.html'],
                options: {
                    locales: 'locales/*.json',
                    base: 'public_html/',
                    output: 'public_html/',
                    format: 'default'
                }
            }
        },
        imageEmbed: {
            dist: {
                src: [ "dist/<%= pkg.name %>.un.css" ],
                dest: "dist/<%= pkg.name %>.base64.css",
                options: {
                    deleteAfterEncoding : false
                }
            }
        },
        casper: {
            options: {
                test: true,
                'log-level': 'warning',
                'fail-fast': true,
                includes: ['test/tests_support.js', '../common/test/common_support.js']
            },
            functionalTests: {
                src: ['../common/test/common_tests.js', 'test/tests.js'],
            }
        },
        connect: {
            use_defaults: {
                keepalive: false
            }
        },
        uncss: {
            dist: {
                files: {
                    'dist/<%= pkg.name %>.un.css': ['src/app.html']
                }
            },
            options: {
                compress: true,
                ignore: [
                    '.has-error .help-block',
                    '.has-error .form-control',
                    '.has-error .form-control:focus',
                    '.has-error .control-label',
                    '.has-error .input-group-addon',
                    '.has-warning .help-block',
                    '.has-warning .form-control',
                    '.has-warning .form-control:focus',
                    '.has-warning .control-label',
                    '.has-warning .input-group-addon',
                    '.has-success .help-block',
                    '.has-success .form-control',
                    '.has-success .form-control:focus',
                    '.has-success .control-label',
                    '.has-success .input-group-addon',
                    '.dragged',
                    '.drag-target',
                    '.red'
                ]
            }
        },
        cssmin: {
            minify: {
                expand: true,
                src: ['dist/<%= pkg.name %>.base64.css'],
                dest: '',
                ext: '.min.css'
            }
        },
        replace: {
            dist: {
                src: ['src/app.html'], // source files array (supports minimatch)
                dest: 'dist/everypass.html', // destination directory or file
                options: {processTemplates: false},
                replacements: [{
                        from: '<link rel="stylesheet" href="../dist/everypass.css"/>', // string replacement
                        to: '<style type="text/css">{{= css }}</style>'
                    }]
            }
        },
        watch: {
            scripts: {
                files: ['src/*', 'test/*', 'Gruntfile.js', 'locales/*', '../common/**'],
                tasks: ['debug'],
                options: {
                    spawn: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-casper');
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-i18n');
    grunt.loadNpmTasks('grunt-image-embed');

    grunt.template.addDelimiters("curly", "{{", "}}");

    grunt.registerTask('buildhtml', 'Builds the app html.', function() {
        var css = grunt.file.read('dist/everypass.min.css');
        var js = grunt.file.read('dist/everypass.min.js');
        var html = grunt.file.read('dist/everypass.html');
        var obj = {css: css, js: js};

        var processedTemplate = grunt.template.process(html, {data: obj, delimiters: "curly"});
        grunt.file.write('dist/everypass_built.html', processedTemplate);
    });

    grunt.registerTask('builddebug', 'Builds the debuggable app html.', function() {
        var css = grunt.file.read('dist/everypass.min.css');
        var js = grunt.file.read('dist/everypass.js');
        var html = grunt.file.read('dist/everypass.html');
        var obj = {css: css, js: js};

        var processedTemplate = grunt.template.process(html, {data: obj, delimiters: "curly"});
        grunt.file.write('public_html/index.html', processedTemplate);
    });

    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect', 'casper']);
    grunt.registerTask('debug', ['clean', 'concat', 'uncss', 'imageEmbed', 'replace', 'cssmin', 'builddebug', 'i18n', 'connect', 'casper']);
};

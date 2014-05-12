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
        jsdoc: {
            dist: {
                src: ['../common/src/common.js', '../common/src/constants.js', 'src/app.js', 'src/constants.js', 'test/tests_support.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        concat: {
            options: {
                stripBanners: true
            },
            js: {
                src: [
                    'lib/sjcl.js',
                    'lib/Blob.js',
                    'lib/FileSaver.js',
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
                    '../common/src/css/app.css'
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
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeEmptyElements: false
                },
                files: {
                    'public_html/index.html': 'dist/<%= pkg.name %>_built.html'
                }
            }
        },
        casper: {
            options: {
                test: true,
                'log-level': 'warning',
                'fail-fast': true,
                includes: ['test/tests_support.js', '../common/test/common_test.js']
            },
            functionalTests: {
                src: ['test/tests.js'],
                dest: function(input) {
                    return input.replace(/\.js$/, '.xml');
                }
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
                    'dist/everypass.min.css': ['src/app.html']
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
                files: ['src/*', 'test/*', 'Gruntfile.js', '../common/**'],
                tasks: ['debug'],
                options: {
                    spawn: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-casper');
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-jsdoc');

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
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'uncss', 'replace', 'buildhtml', 'htmlmin', 'connect', 'casper']);
    grunt.registerTask('debug', ['clean', 'concat', 'uncss', 'replace', 'builddebug', 'connect', 'casper']);
};

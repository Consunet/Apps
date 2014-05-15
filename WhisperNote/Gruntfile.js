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
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
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
        template_runner: {
            basic: {
                options: {
                  locales: ['en', 'es', 'fr', 'de', 'el', 'it', 'ru', 'pt', 'cn', 'nl', 'fi', 'id', 'pl'],
                  directory: 'locales'
                },
                files: {
                  'public_html/index.html': ['public_html/index.html'],
                },
            },
        },
        casper: {
            options: {
                test: true,
                'log-level': 'warning',
                'fail-fast': true,
                includes: ['test/tests_support.js', '../common/test/common_support.js']
            },
            functionalTests: {
                src: ['../common/test/common_tests.js', 'test/tests.js']
            }
        },
        connect: {
            server: {
                options: {
                    keepalive: false,
                    port: 8001
                }
            }
        },
        uncss: {
            dist: {
                files: {
                    'dist/<%= pkg.name %>.un.css': ['src/app.html']
                }
            },
            options: {
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
                    '.red'

                ]
            }
        },
        cssmin: {
            minify: {
                expand: true,
                src: ['dist/<%= pkg.name %>.un.css'],
                dest: '',
                ext: '.min.css'
            }
        },
        replace: {
            dist: {
                src: ['src/app.html'], // source files array (supports minimatch)
                dest: 'dist/<%= pkg.name %>.html', // destination directory or file
                options: {processTemplates: false},
                replacements: [{
                        from: '<link rel="stylesheet" href="../dist/<%= pkg.name %>.css"/>', // string replacement
                        to: '<style>{{= css }}</style>'
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
    grunt.loadNpmTasks('grunt-template-runner');

    grunt.template.addDelimiters("curly", "{{", "}}");

    grunt.registerTask('buildhtml', 'Builds the app html.', function() {
        var css = grunt.file.read('dist/whispernote.min.css');
        var js = grunt.file.read('dist/whispernote.min.js');
        var html = grunt.file.read('dist/whispernote.html');
        var obj = {css: css, js: js};

        var processedTemplate = grunt.template.process(html, {data: obj, delimiters: "curly"});
        grunt.file.write('dist/whispernote_built.html', processedTemplate);
    });

    grunt.registerTask('builddebug', 'Builds the debuggable app html.', function() {
        var css = grunt.file.read('dist/whispernote.min.css');
        var js = grunt.file.read('dist/whispernote.js');
        var html = grunt.file.read('dist/whispernote.html');
        var obj = {css: css, js: js};

        var processedTemplate = grunt.template.process(html, {data: obj, delimiters: "curly"});
        grunt.file.write('public_html/index.html', processedTemplate);
    });

    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'uncss', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'template_runner', 'connect', 'casper']);
    grunt.registerTask('debug', ['clean', 'concat', 'uncss', 'replace', 'cssmin', 'builddebug', 'template_runner', 'connect', 'casper']);
};

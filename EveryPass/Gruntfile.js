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
        clean: ["dist/*", "public_html/*", "coverage/*", "test/test_downloads/*"],
        concat: {                        
            options: {
                stripBanners: true
            },
            no_coverage_js: {
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
            coverage_js: {
                src: [
                   'lib/sjcl.js',
                   'lib/Blob.js',
                   'lib/FileSaver.js',
                   'lib/es6-promise.js',
                   'lib/encoding-indexes.js',
                   'lib/encoding.js',
                   'lib/webcrypto-shim.js',
                   '../common/coverage/_constants.js',
                   '../common/coverage/_common.js',
                   'coverage/_constants.js',
                   'coverage/_app.js'
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
                src: '<%= concat.no_coverage_js.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            },
            coverage: {
                src: '<%= concat.coverage_js.dest %>',
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
        },
        mochaTest: {
            test: {
              options: {
                reporter: 'spec',   
                require: [
                   function(){ 
                        testVars = require('./test/mocha_test_vars.js');
                        getCoverage = false;
                   },                                                        
                ]
              },
              src: ['test/mocha_tests.js','../common/test/mocha_common_tests.js']
            }, 
            testWithCoverage: {
              options: {
                reporter: 'spec',   
                require: [
                   function(){ 
                        testVars = require('./test/mocha_test_vars.js');
                        getCoverage = true;
                   },                                                        
                ]
              },
              src: ['test/mocha_tests.js','../common/test/mocha_common_tests.js']
            },
            manualCoverage: {
              options: {
                reporter: 'spec',   
                require: [
                   function(){ 
                        testVars = require('./test/mocha_test_vars.js');
                   },                                                        
                ]
              },
              src: ['../common/test/manual_coverage.js']
            }
        }, 
        express: {
            options: {
              // Override defaults here
              port: 8888,
            },
            dev: {
              options: {
                script: '../common/coverage_server.js'
              }
            },           
        },  
        curl: {
            'coverage-download': {
              src: 'http://localhost:8888/coverage/download',
              dest: 'coverage/coverage_data.zip'
            },
        },
  	shell: {      
            instrumentScripts: {
                command: [
                    'cd src/',
                    'istanbul instrument app.js --output ../coverage/_app.js --embed-source true',
                    'istanbul instrument constants.js --output ../coverage/_constants.js --embed-source true',
                    'cd ../../common/src',
                    'istanbul instrument common.js --output ../coverage/_common.js --embed-source true',
                    'istanbul instrument constants.js --output ../coverage/_constants.js --embed-source true'                      
                ].join('&&')
	    },
            extractFirefoxProfile: {
                command: [
                    'cd ../common/test/',                    
                    'unzip -o Firefox_profile.zip', 
                ].join('&&')
	    },
            cleanupFirefoxProfile: {
                command: [
                    'cd ../common/test/',                    
                    'rm Firefox_profile -r', 
                ].join('&&')
	    },
            extractReport: {
                command: [
                    'cd coverage/',    
                    'unzip -o coverage_data.zip -d report/',                                                      
                    'sensible-browser  report/lcov-report/index.html'
                ].join('&&')
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
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-i18n');
    grunt.loadNpmTasks('grunt-image-embed');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-shell');     
    
    
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
    grunt.registerTask('default', ['clean', 'concat:no_coverage_js', 'concat:css', 'uglify:dist', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect', 'shell:extractFirefoxProfile', 'mochaTest:test', 'shell:cleanupFirefoxProfile']);
    grunt.registerTask('coverage', ['clean', 'shell:instrumentScripts', 'concat:coverage_js', 'concat:css', 'uglify:coverage', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect','express:dev', 'shell:extractFirefoxProfile','mochaTest:testWithCoverage', 'curl:coverage-download', 'shell:extractReport', 'shell:cleanupFirefoxProfile']);
    grunt.registerTask('manualcoverage', ['clean', 'shell:instrumentScripts', 'concat:coverage_js', 'concat:css', 'uglify:coverage', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect','express:dev', 'shell:extractFirefoxProfile', 'mochaTest:manualCoverage', 'curl:coverage-download', 'shell:extractReport', 'shell:cleanupFirefoxProfile']);
    grunt.registerTask('dualcoverage', ['clean', 'shell:instrumentScripts', 'concat:coverage_js', 'concat:css', 'uglify:coverage', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect','express:dev', 'shell:extractFirefoxProfile', 'mochaTest:testWithCoverage','mochaTest:manualCoverage', 'curl:coverage-download', 'shell:extractReport', 'shell:cleanupFirefoxProfile']);
    grunt.registerTask('debug', ['clean', 'concat:no_coverage_js', 'concat:css', 'uncss', 'imageEmbed', 'replace', 'cssmin', 'builddebug', 'i18n', 'connect', 'shell:extractFirefoxProfile','mochaTest:test', 'shell:cleanupFirefoxProfile']);
    grunt.registerTask('notest', ['clean', 'concat:no_coverage_js', 'concat:css', 'uglify:dist', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect']);
};

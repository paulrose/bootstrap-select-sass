/*jshint node:true*/
module.exports = function (grunt) {

  // From TWBS
  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
    ' * Bootstrap-select-sass v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
    ' *\n' +
    ' * Copyright 2013-<%= grunt.template.today(\'yyyy\') %> bootstrap-select\n' +
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
    ' */\n',

    // Task configuration.

    clean: {
      css: 'dist/css',
      js: 'dist/js'
    },

    jshint: {
      options: {
        jshintrc: 'js/.jshintrc'
      },
      gruntfile: {
        options: {
          'node': true
        },
        src: 'Gruntfile.js'
      },
      main: {
        src: 'js/*.js'
      },
      i18n: {
        src: 'js/i18n/*.js'
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      main: {
        src: '<%= jshint.main.src %>',
        dest: 'dist/js/<%= pkg.name %>.js'
      },
      i18n: {
        files: [
          {
            expand: true,
            src: '<%= jshint.i18n.src %>',
            dest: 'dist/'
          }
        ]
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      main: {
        src: '<%= concat.main.dest %>',
        dest: 'dist/js/<%= pkg.name %>.min.js',
        options: {
          sourceMap: true,
          sourceMapName: 'dist/js/<%= pkg.name %>.js.map'
        }
      },
      i18n: {
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: '<%= jshint.i18n.src %>',
            dest: 'dist/',
            ext: '.min.js'
          }
        ]
      }
    },

    //qunit: {
    //    files: ['test/**/*.html']
    //},

    sass: {
      dist: {
        options: {
            sourcemap: 'auto',
            compass: false
        },
        files: {
          'dist/css/<%= pkg.name %>.css': 'sass/bootstrap-select.scss'
        }
      }
    },

    usebanner: {
      css: {
        options: {
          position: 'top',
          banner: '<%= banner %>'
        },
        src: '<%= Object.keys(sass.dist.files)[0] %>'
      }
    },

    cssmin: {
      options: {
        compatibility: 'ie8',
        keepSpecialComments: '*',
        noAdvanced: true
      },
      css: {
        src: '<%= Object.keys(sass.dist.files)[0] %>',
        dest: 'dist/css/<%= pkg.name %>.min.css'
      }
    },

    csslint: {
      options: {
        'adjoining-classes': false,
        'box-sizing': false,
        'box-model': false,
        'compatible-vendor-prefixes': false,
        'floats': false,
        'font-sizes': false,
        'gradients': false,
        'important': false,
        'known-properties': false,
        'outline-none': false,
        'qualified-headings': false,
        'regex-selectors': false,
        'shorthand': false,
        'text-indent': false,
        'unique-headings': false,
        'universal-selector': false,
        'unqualified-attributes': false,
        'overqualified-elements': false
      },
      css: {
        src: '<%= Object.keys(sass.dist.files)[0] %>'
      }
    },

    sed: {
      versionNumber: {
        path: [
          'sass',
          'js',
          'bootstrap-select.jquery.json',
          'bower.json',
          'composer.json',
          'package.json'
        ],
        pattern: (function () {
          var old = grunt.option('old');
          return old ? RegExp.quote(old) : old;
        })(),
        replacement: grunt.option('new'),
        recursive: true
      }
    },

    autoprefixer: {
      options: {
        browsers: [
          'Android 2.3',
          'Android >= 4',
          'Chrome >= 20',
          'Firefox >= 24', // Firefox 24 is the latest ESR
          'Explorer >= 8',
          'iOS >= 6',
          'Opera >= 12',
          'Safari >= 6'
        ]
      },
      css: {
        options: {
          map: true
        },
        src: '<%= Object.keys(sass.dist.files)[0] %>'
      }
    },

    compress: {
      zip: {
        options: {
          archive: 'bootstrap-select-<%= pkg.version %>.zip',
          mode: 'zip'
        },
        files: [
          {expand: true, cwd: 'dist/', src: ['**'], dest: 'bootstrap-select-<%= pkg.version %>/'},
          {
            src: ['bootstrap-select.jquery.json', 'bower.json', 'composer.json', 'package.json'],
            dest: 'bootstrap-select-<%= pkg.version %>/'
          }
        ]
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: 'jshint:gruntfile'
      },
      js: {
        files: ['<%= jshint.main.src %>', '<%= jshint.i18n.src %>'],
        tasks: 'build-js'
      },
      sass: {
        files: 'sass/*.sass',
        tasks: 'build-css'
      }
    }
  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt);

  // Version numbering task.
  // grunt change-version-number --old=A.B.C --new=X.Y.Z
  // This can be overzealous, so its changes should always be manually reviewed!
  grunt.registerTask('change-version-number', 'sed');

  // CSS distribution
  grunt.registerTask('build-css', ['sass', 'autoprefixer', 'usebanner', 'cssmin']);

  // JS distribution
  grunt.registerTask('build-js', ['clean:js', 'concat', 'uglify']);

  // Development watch
  grunt.registerTask('dev-watch', ['build-css', 'build-js', 'watch']);

  // Full distribution
  grunt.registerTask('dist', ['build-css', 'build-js', 'compress']);

  // Default task.
  grunt.registerTask('default', ['clean', 'build-css', 'build-js']);

};

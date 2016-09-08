module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    paths: {
      src: {
        js: 'src/js/**/*.js',
        jsIgnore: 'src/js/lib/*.min.js',
        css: 'src/css/**/*.css',
        cssLint: 'src/css/style.css',
        html: 'src/index.html'
      },
      temp: {
        js: 'temp/js/main.js',
        css: 'temp/css/style.css',
        html: 'temp/index.html'
      },
      dest: {
        js: 'dist/js/main.js',
        jsMin: 'dist/js/main.min.js',
        css: 'dist/css/style.css',
        cssMin: 'dist/css/style.min.css',
        html: 'dist/index.html'
      }
    },
    jshint: {
      options: {
        'eqeqeq': true,
        'globals': {
          'jQuery': true,
          'ko': true
        }
      },
      all: [
        'Gruntfile.js',
        '<%= paths.src.js %>',
        '!<%= paths.src.jsIgnore %>'
      ]
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */',
        compress: true,
        mangle: true
        // ,
        // sourceMap: true,
        // sourceMapIncludeSources: true,
        // sourceMapIn: '<%= paths.dest.js %>.map'
      },
      target: {
        src: ['<%= paths.src.js %>','!<%= paths.src.jsIgnore %>'],
        dest: '<%= paths.dest.jsMin %>'
      }
    },
    uncss: {
      dist: {
        options: {
          ignore: [
            /\.modal/,
            /\.alert/,
            '.fade.in',
            '.sidebar-hamburger.expand'
          ]
        },
        files: {'<%= paths.temp.css %>' : ['<%= paths.src.html %>']
        }
      }
    },
    cssmin: {
      target: {
        files: {
          '<%= paths.dest.cssMin %>': ['<%= paths.temp.css %>']
        }
      }
    },
    'string-replace': {
      dist: {
        files: {
          '<%= paths.temp.html %>': '<%= paths.src.html %>'
        },
        options: {
          replacements: [
            {
              pattern: /<!-- PROD START/ig,
              replacement: '<!-- PROD START -->'
            },
            {
              pattern: / PROD END -->/ig,
              replacement: '<!-- PROD END -->'
            },
            {
              pattern: /<!-- DEV START -->/ig,
              replacement: '<!-- DEV START '
            },
            {
              pattern: /<!-- DEV END -->/ig,
              replacement: ' DEV END -->'
            }
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          '<%= paths.dest.html %>': '<%= paths.temp.html %>'
        }
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['jshint',
    'uglify',
    'uncss',
    'cssmin',
    'string-replace',
    'htmlmin']);

};
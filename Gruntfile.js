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
        html: 'src/index.html',
        htmlDest: 'src/dist.html'
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
        files: {'<%= paths.dest.css %>' : ['<%= paths.src.html %>']
        }
      }
    },
    cssmin: {
      target: {
        files: {
          '<%= paths.dest.cssMin %>': ['<%= paths.dest.css %>']
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
          '<%= paths.dest.html %>': '<%= paths.src.htmlDest %>'
        }
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['jshint',
    'uglify',
    'uncss',
    'cssmin',
    'htmlmin']);

};
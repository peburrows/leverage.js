/*global module:false require:false*/

var packageInfo = require('package.json');

module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-coffee');

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: packageInfo.version,
      license: packageInfo.license,
      banner: '/*! Leverage.js - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Phil Burrows; Licensed <%= meta.license %> */',
      wrapper: {
        start: ';(function(){\n',
        end:   '\n}.call(this));'
      }
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js']
    },

    coffee: {
      app: {
        src: ['src/**/*.coffee'],
        dest: 'lib'
      },

      tests: {
        src: ['test/src/**/*.coffee'],
        dest: 'test/lib'
      }
    },

    concat: {
      dist: {
        src: ['<banner:meta.banner>', 'lib/leverage.js', 'lib/utils.js', 'lib/validations.js', 'lib/callbacks.js', 'lib/events.js', 'lib/class.js', 'lib/**/*.js'],
        dest: 'leverage.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'leverage.min.js'
      }
    },
    watch: {
      tests: {
        files: 'test/src/**/*.coffee',
        tasks: 'coffee:tests'
      },
      app: {
        files: '<config:lint.files>',
        tasks: 'concat'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        laxcomma: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        jquery: true,
        loopfunc: true,
        evil: true
      },
      globals: {
        '_': false,
        'Leverage': false,
        'console': false
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'concat min');

};

/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.0.1',
      banner: '/*! Leverage.js - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'Phil Burrows; Licensed MIT */'
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js']
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
      files: '<config:lint.files>',
      tasks: 'lint'
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

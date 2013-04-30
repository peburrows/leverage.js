/*global module:false require:false*/

var packageInfo = require('package.json');

module.exports = function(grunt) {
  var filesOnly = ['config/templates/wrapper-start.js', 'lib/leverage.js', 'lib/utils.js', 'lib/validations.js', 'lib/callbacks.js', 'lib/events.js', 'lib/class.js', 'lib/**/*.js', '<banner:meta.wrapper.end>', 'config/templates/wrapper-end.js']
    , files         = filesOnly.slice(0);

  files.unshift('underscore.1.3.3.min.js');
  files.unshift('jquery.1.8.3.min.js');

  // Project configuration.
  grunt.initConfig({
    meta: {
      pkg: grunt.file.readJSON('package.json'),
      banner: '/*! Leverage.js - v<%= meta.pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        '<%= meta.pkg.author %>; Licensed <%= meta.pkg.license %> */\n'
    },
    lint: {
      files: ['Gruntfile.js', 'lib/**/*.js']
    },

    coffee: {
      tests: {
        expand: true,
        cwd: 'test/src/',
        src: '**/*.coffee',
        dest: 'test/lib/',
        ext: '.js'
      }
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      dist: {
        src: files,
        dest: 'leverage.js'
      },
      only: {
        src: filesOnly,
        dest: 'leverage.only.js'
      }
    },

    watch: {
      tests: {
        files: ['<%= concat.dist.src %>', 'test/src/**/*.coffee'],
        tasks: ['concat:dist', 'coffee:tests', 'testOnly']
      },
      app: {
        files: '<%= concat.dist.src %>',
        tasks: ['default']
      }
    },

    jasmine: {
      options: {
        specs: 'test/lib/**/*.js',
        helpers: ['test/helpers/jasmine-jquery.js'],
        template: 'test/template.tmpl'
      },
      src: ['leverage.js']
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

    uglify: {
      options: {
        preserveComments: 'some'
      },
      dist: {
        files: {
          'leverage.min.js': '<%= concat.dist.dest %>'
        }
      },
      only: {
        files: {
          'leverage.only.min.js': '<%= concat.only.dest %>'
        }
      }
    }


    // jasmine: {
    //   src: ['underscore.1.3.3.min.js', 'jquery.1.8.3.min.js', 'leverage.js'],
    //   specs : 'test/lib/*.js',
    //   template: 'test/template.tmpl',
    //   helpers: ['test/lib/jasmine/jasmine-jquery.js']
    // },

    // concat: {
    //   dist: {
    //     src: ['<banner:meta.banner>', 'lib/leverage.js', 'lib/utils.js', 'lib/validations.js', 'lib/callbacks.js', 'lib/events.js', 'lib/class.js', 'lib/**/*.js'],
    //     dest: 'leverage.js'
    //   }
    // },
    // min: {
    //   dist: {
    //     src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
    //     dest: 'leverage.min.js'
    //   }
    // },
    // watch: {
    //   tests: {
    //     files: 'test/src/**/*.coffee',
    //     tasks: ['coffee:tests', 'test']
    //   },
    //   app: {
    //     files: '<config:lint.files>',
    //     tasks: 'concat'
    //   }
    // },
    // jshint: {
    //   options: {
    //     curly: true,
    //     eqeqeq: true,
    //     immed: true,
    //     laxcomma: true,
    //     latedef: true,
    //     newcap: true,
    //     noarg: true,
    //     sub: true,
    //     undef: true,
    //     boss: true,
    //     eqnull: true,
    //     browser: true,
    //     jquery: true,
    //     loopfunc: true,
    //     evil: true
    //   },
    //   globals: {
    //     '_': false,
    //     'Leverage': false,
    //     'console': false
    //   }
    // },
    // uglify: {}
  });


  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['concat', 'coffee:tests', 'jasmine']);
  grunt.registerTask('testOnly', ['concat', 'jasmine']);

  // Default task.
  grunt.registerTask('default', ['concat', 'uglify']);

};

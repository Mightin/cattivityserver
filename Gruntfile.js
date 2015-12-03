'use strict';

module.exports = function(grunt){

    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        // Project settings
        config: config,
        pkg: grunt.file.readJSON("package.json"),

        watch: {
            files: ['**/*'],
            tasks: ['jshint']
        },
        gruntfile: {
            files: ['Gruntfile.js']
        }
    });

};



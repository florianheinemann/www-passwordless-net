module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-md2html');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.initConfig({
		env : {
			dev : {
				src : '.dev.env',
			}
		},
		nodemon: {
			dev: {
				script: './bin/www'
			}
		},
		md2html: {
			multiple_files: {
				options: {
					markedOptions: {
						gfm: true,
						highlight: function (code) {
							return require('highlight.js').highlightAuto(code).value;
						}
					}
				},
				files: [{
					expand: true,
					cwd: 'resources/content',
					src: ['**/*.md'],
					dest: 'views/content',
					ext: '.html'
				}]
			}
		},
		uglify: {
			prepare: {
				files: {
					'public/min.js': ['resources/js/jquery.js', 'resources/js/fastclick.js', 
					'resources/js/foundation.min.js']
				}	
			}
		},
		cssmin: {
			combine: {
				files: {
					'public/min.css': ['resources/css/normalize.css', 'resources/css/github.css', 
					'resources/css/foundation.css', 'resources/css/style.css']
				}
			}
		}
	});

	grunt.registerTask('dev', ['env', 'md2html', 'uglify:prepare', 'cssmin', 'nodemon']);
	grunt.registerTask('prepare', ['md2html', 'cssmin', 'uglify']);

};
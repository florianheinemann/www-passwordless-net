module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-md2html');

	grunt.initConfig({
		env : {
			options : {
			 //Shared Options Hash
			},
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
							var val = require('highlight.js').highlightAuto(code).value;
							console.log(val);
							return val;
						}
					}
				},
				files: [{
					expand: true,
					cwd: 'views/md',
					src: ['**/*.md'],
					dest: 'views/content',
					ext: '.html'
				}]
			}
		}
	});

	grunt.registerTask('dev', ['env:dev', 'md2html', 'nodemon:dev']);
	grunt.registerTask('content', ['md2html']);

};
module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-md2html');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-curl');

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
		},
		clean: {
			docs: ['public/docs']
		},
		'curl-dir': {
			'docs-root': {
				src: ['https://raw.githubusercontent.com/florianheinemann/passwordless/master/docs/{Passwordless,index,passwordless.js}.html'],
				dest: 'public/docs'
			},
			'styles': {
				src: ['https://raw.githubusercontent.com/florianheinemann/passwordless/master/docs/styles/{jsdoc-default,prettify-jsdoc,prettify-tomorrow}.css'],
				dest: 'public/docs/styles'
			},
			'scripts': {
				src: ['https://raw.githubusercontent.com/florianheinemann/passwordless/master/docs/scripts/linenumber.js'],
				dest: 'public/docs/scripts'
			},
			'prettify': {
				src: ['https://raw.githubusercontent.com/florianheinemann/passwordless/master/docs/scripts/prettify/{Apache-License-2.0.txt,lang-css.js,prettify.js}'],
				dest: 'public/docs/scripts/prettify'
			}
		}
	});

	grunt.registerTask('prepare', ['clean:docs', 'curl-dir:docs-root', 'curl-dir:styles', 
									'curl-dir:scripts', 'curl-dir:prettify', 'md2html', 
									'cssmin', 'uglify:prepare']);
	grunt.registerTask('dev', ['env', 'prepare', 'nodemon']);

};
fs            = require 'fs'
{print}       = require 'util'
{spawn, exec} = require 'child_process'

build = (watch, callback) ->
  if typeof watch is 'function'
    callback = watch
    watch = false
  options = ['-c', '-o', 'lib', 'src']
  options.unshift '-w' if watch

  coffee = spawn 'coffee', options
  coffee.stdout.on 'data', (data) -> print data.toString()
  coffee.stderr.on 'data', (data) -> print data.toString()
  coffee.on 'exit', (status) -> callback?() if status is 0

task 'docs', 'Generate annotated source code with Docco', ->
  fs.readdir 'src', (err, contents) ->
    files = ("src/#{file}" for file in contents when /\.coffee$/.test file)
    docco = spawn 'docco', files
    docco.stdout.on 'data', (data) -> print data.toString()
    docco.stderr.on 'data', (data) -> print data.toString()
    docco.on 'exit', (status) -> callback?() if status is 0

task 'build', 'Compile CoffeeScript source files', ->
  build()

task 'watch', 'Recompile CoffeeScript source files when modified', ->
  build true

task 'test', 'Run the test suite', ->
  build ->
    require.paths.unshift __dirname + "/lib"
    {reporters} = require 'nodeunit'
    process.chdir __dirname
    reporters.default.run ['test']

task 'watch-tests', 'Compile all the tests', ->
  options = ['-w', '-c', '-o', 'test/lib', 'test/src']
  coffee = spawn 'coffee', options
  coffee.stdout.on 'data', (data) -> print data.toString()
  coffee.stderr.on 'data', (data) -> print data.toString()

# task 'release', 'Compile all the javascript files into one', ->
#   out = 'leverage.js'
#   fs.unlinkSync(out) if fs.existsSync(out)
#   sprockets = spawn 'sprockets', ['lib/leverage.js', '--include=lib']
#   sprockets.stdout.on 'data', (data) -> fs.appendFile out, data.toString().replace(/^\n+/, '\n')
#   sprockets.stderr.on 'data', (data) -> print data.toString()
#   sprockets.on 'exit', (status) -> print 'successfully built\n' if status is 0
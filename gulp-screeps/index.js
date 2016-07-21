'use strict';
var _ = require('lodash');
var commonPathPrefix = require('common-path-prefix');
var https = require('https');
var gutil = require('gulp-util');
var path = require('path');
var recast = require('recast');
var through = require('through2');
var util = require('util');

var PLUGIN_NAME = 'gulp-screeps';

function error(msg) {
    return new util.PluginError(PLUGIN_NAME, msg);
}

function genModuleName(filePath) {
    return filePath.replace(/\.js$/, '')
               .replace(new RegExp('\\' + path.sep, 'g'), '.');
}

function replaceRequires(prefix, filePath, code) {
    var ast = recast.visit(recast.parse(code.toString()), {
        visitCallExpression: function(nodePath) {
            var expr = nodePath.node;
            this.traverse(nodePath);

            if (expr.callee.name != 'require' ||
                expr.arguments.length == 0) {
                return;
            }

            var modulePathArg = expr.arguments[0];
            if (modulePathArg.value.charAt(0) != '.') {
                return;
            }

            var quote = modulePathArg.raw.charAt(0);

            var modulePath = path.relative(prefix,
                                path.resolve(path.dirname(filePath),
                                    modulePathArg.value));
            var moduleName = genModuleName(modulePath);
            expr.arguments[0] = quote + './' + moduleName + quote;
        },
    });

    return recast.print(ast).code;
}

module.exports = function (options) {
    options = options || {};

    if (typeof options.email !== 'string') {
        throw error('No valid email provided');
    }
    if (typeof options.password !== 'string') {
        throw error('No valid password provided');
    }

    if (typeof options.branch !== 'string') {
        options.branch = 'default';
    }

    var files = [];

    var transform = function(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(error('Streaming is not supported'));
        }

        files.push(file);
        cb(null, file);
    };

    var flush = function(cb) {
        var prefix = commonPathPrefix(_.map(files, function(file) {
            return file.path.toString();
        }));

        var modules = {};
        _.forEach(files, function(file) {
            var moduleName = genModuleName(path.relative(prefix, file.path));
            try {
                var code = replaceRequires(prefix, file.path, file.contents);
                modules[moduleName] = code;
            } catch (e) {
                cb(e);
            }
        });

        var req = https.request({
            hostname: 'screeps.com',
            port: 443,
            path: '/api/user/code',
            method: 'POST',
            auth: options.email + ':' + options.password,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
        }, function(res) {
            res.setEncoding('utf8');

            var data = '';
            res.on('data', function(chunk) {
                data += chunk;
            });

            res.on('end', function() {
                data = JSON.parse(data);

                if (data.ok) {
                    gutil.log('Commited to Screeps account on branch `' + options.branch + '`');
                } else {
                    gutil.log('Error while commiting to Screeps: ' + util.inspect(data));
                }
            });
        });

        var data = {
            branch: options.branch,
            modules: modules,
        };
        req.write(JSON.stringify(data));

        req.end();

        return cb();
    };

    return through.obj(transform, flush);
};

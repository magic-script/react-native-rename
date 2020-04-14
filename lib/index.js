#!/usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// nS - No Space
// lC - Lowercase

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _nodeReplace = require('node-replace');

var _nodeReplace2 = _interopRequireDefault(_nodeReplace);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _foldersAndFiles = require('./config/foldersAndFiles');

var _filesToModifyContent = require('./config/filesToModifyContent');

var _bundleIdentifiers = require('./config/bundleIdentifiers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var devTestRNProject = ''; // For Development eg '/Users/junedomingo/Desktop/RN49'
var __dirname = devTestRNProject || process.cwd();
var projectName = _package2.default.name;
var replaceOptions = {
  recursive: true,
  silent: true
};

function readFile(filePath) {
  return new Promise(function (resolve, reject) {
    _fs2.default.readFile(filePath, function (err, data) {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function replaceContent(regex, replacement, paths) {
  (0, _nodeReplace2.default)(_extends({
    regex: regex,
    replacement: replacement,
    paths: paths
  }, replaceOptions));

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = paths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var filePath = _step.value;

      console.log(filePath.replace(__dirname, '') + ' ' + _colors2.default.green('MODIFIED'));
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function deleteFiles(path) {
  var files = [];
  if (_fs2.default.existsSync(path)) {
    if (_fs2.default.lstatSync(path).isFile()) {
      _fs2.default.unlinkSync(path);
    } else {
      files = _fs2.default.readdirSync(path);
      files.forEach(function (file, index) {
        var curPath = path + "/" + file;
        if (_fs2.default.lstatSync(curPath).isDirectory()) {
          console.log('Delete files, is directory, ' + curPath);
          deleteFiles(curPath);
        } else {
          console.log('Delete files, is file, ' + curPath);
          _fs2.default.unlinkSync(curPath);
        }
      });
      _fs2.default.rmdirSync(path);
    }
  }
};

var deletePreviousBundleDirectory = function deletePreviousBundleDirectory(_ref) {
  var oldBundleNameDir = _ref.oldBundleNameDir,
      shouldDelete = _ref.shouldDelete;

  if (shouldDelete) {
    var dir = oldBundleNameDir.replace(/\./g, '/');
    var deleteDirectory = _shelljs2.default.rm('-rf', dir);
    Promise.resolve(deleteDirectory);
    console.log('Done removing previous bundle directory.'.green);
  } else {
    Promise.resolve();
    console.log('Bundle directory was not changed. Keeping...'.yellow);
  }
};

var cleanBuilds = function cleanBuilds() {
  var deleteDirectories = _shelljs2.default.rm('-rf', [_path2.default.join(__dirname, 'ios/build/*'), _path2.default.join(__dirname, 'android/.gradle/*'), _path2.default.join(__dirname, 'android/app/build/*'), _path2.default.join(__dirname, 'android/build/*')]);
  Promise.resolve(deleteDirectories);
  console.log('Done removing builds.'.green);
};

function copyFiles(srcPath, destPath) {
  if (!_fs2.default.existsSync(destPath)) {
    _fs2.default.mkdirSync(destPath);
  }
  var filesToCreate = _fs2.default.readdirSync(srcPath);
  filesToCreate.forEach(function (file) {
    var origFilePath = srcPath + '/' + file;
    var stats = _fs2.default.statSync(origFilePath);
    if (stats.isFile()) {
      var contents = _fs2.default.readFileSync(origFilePath, 'utf8');
      var writePath = destPath + '/' + file;
      _fs2.default.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      var newDestPath = destPath + '/' + file;
      copyFiles(origFilePath, newDestPath);
    }
  });
}

function copyFileOrDir(element, destPath) {
  var stats = _fs2.default.statSync(element);
  if (stats.isFile()) {
    var contents = _fs2.default.readFileSync(element, 'utf8');
    _fs2.default.writeFileSync(destPath, contents, 'utf8');
  } else if (stats.isDirectory()) {
    copyFiles(element, destPath);
  }
}

readFile(_path2.default.join(__dirname, 'android/app/src/main/res/values/strings.xml')).then(function (data) {
  var $ = _cheerio2.default.load(data);
  var currentAppName = $('string[name=app_name]').text();
  var nS_CurrentAppName = currentAppName.replace(/\s/g, '');
  var lC_Ns_CurrentAppName = nS_CurrentAppName.toLowerCase();

  _commander2.default.version('2.4.1').arguments('<newName>').option('-b, --bundleID [value]', 'Set custom bundle identifier eg. "com.junedomingo.travelapp"').action(function (newName) {
    var nS_NewName = newName.replace(/\s/g, '');
    var namePattern = /^(?=.{3,30}$)[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/;
    var bundlePattern = /^(?=.{3,30}$)(?=.*[.])[a-zA-Z0-9]+(?:[.][a-zA-Z0-9]+)*$/;
    var lC_Ns_NewAppName = nS_NewName.toLowerCase();
    var bundleID = _commander2.default.bundleID ? _commander2.default.bundleID.toLowerCase() : null;
    var newBundlePath = void 0;
    var listOfFoldersAndFiles = (0, _foldersAndFiles.foldersAndFiles)(currentAppName, newName);
    var listOfFilesToModifyContent = (0, _filesToModifyContent.filesToModifyContent)(currentAppName, newName, projectName);

    if (bundleID) {
      if (!bundlePattern.test(bundleID)) {
        return console.log('Invalid Bundle Identifier. Add something like "com.travelapp" or "com.junedomingo.travelapp"');
      }
    }

    if (!namePattern.test(newName)) {
      return console.log('"' + newName + '" is not a valid name for a project. Please use a valid identifier name (alphanumeric and space).');
    }

    if (newName === currentAppName || newName === nS_CurrentAppName || newName === lC_Ns_CurrentAppName) {
      return console.log('Please try a different name.');
    }

    // Move files and folders from ./config/foldersAndFiles.js
    var resolveFoldersAndFiles = new Promise(function (resolve) {
      listOfFoldersAndFiles.forEach(function (element, index) {
        var dest = element.replace(new RegExp(nS_CurrentAppName, 'i'), nS_NewName);
        var itemsProcessed = 1;
        var successMsg = '/' + dest + ' ' + _colors2.default.green('RENAMED');

        setTimeout(function () {
          itemsProcessed += index;

          if (_fs2.default.existsSync(_path2.default.join(__dirname, element)) || !_fs2.default.existsSync(_path2.default.join(__dirname, element))) {
            console.log('Resolve folders and files directory exists: ' + _path2.default.join(__dirname, element));
            copyFileOrDir(_path2.default.join(__dirname, element), _path2.default.join(__dirname, dest));
            deleteFiles(_path2.default.join(__dirname, element));
            console.log(successMsg);
          }

          if (itemsProcessed === listOfFoldersAndFiles.length) {
            resolve();
          }
        }, 200 * index);
      });
    });

    // Modify file content from ./config/filesToModifyContent.js
    var resolveFilesToModifyContent = function resolveFilesToModifyContent() {
      return new Promise(function (resolve) {
        var filePathsCount = 0;
        var itemsProcessed = 0;
        console.log('Files to modify content: ' + listOfFilesToModifyContent);
        listOfFilesToModifyContent.map(function (file) {
          filePathsCount += file.paths.length;

          file.paths.map(function (filePath, index) {
            var newPaths = [];

            setTimeout(function () {
              itemsProcessed++;
              if (_fs2.default.existsSync(_path2.default.join(__dirname, filePath))) {
                newPaths.push(_path2.default.join(__dirname, filePath));
                replaceContent(file.regex, file.replacement, newPaths);
              }
              if (itemsProcessed === filePathsCount) {
                resolve();
              }
            }, 200 * index);
          });
        });
      });
    };

    var resolveJavaFiles = function resolveJavaFiles() {
      return new Promise(function (resolve) {
        readFile(_path2.default.join(__dirname, 'android/app/src/main/AndroidManifest.xml')).then(function (data) {
          var $ = _cheerio2.default.load(data);
          var currentBundleID = $('manifest').attr('package');
          var newBundleID = _commander2.default.bundleID ? bundleID : 'com.' + lC_Ns_NewAppName;
          var javaFileBase = '/android/app/src/main/java';
          var newJavaPath = javaFileBase + '/' + newBundleID.replace(/\./g, '/');
          var currentJavaPath = javaFileBase + '/' + currentBundleID.replace(/\./g, '/');

          if (bundleID) {
            newBundlePath = newJavaPath;
          } else {
            newBundlePath = newBundleID.replace(/\./g, '/').toLowerCase();
            newBundlePath = javaFileBase + '/' + newBundlePath;
          }

          var fullCurrentBundlePath = _path2.default.join(__dirname, currentJavaPath);
          var fullNewBundlePath = _path2.default.join(__dirname, newBundlePath);

          // Create new bundle folder if doesn't exist yet
          if (!_fs2.default.existsSync(fullNewBundlePath)) {
            _shelljs2.default.mkdir('-p', fullNewBundlePath);
            copyFiles(fullCurrentBundlePath, fullNewBundlePath);
            deleteFiles(fullCurrentBundlePath);
            console.log(newBundlePath + ' ' + _colors2.default.green('BUNDLE INDENTIFIER CHANGED'));
          }

          var vars = {
            currentBundleID: currentBundleID,
            newBundleID: newBundleID,
            newBundlePath: newBundlePath,
            javaFileBase: javaFileBase,
            currentJavaPath: currentJavaPath,
            newJavaPath: newJavaPath
          };
          resolve(vars);
        });
      });
    };

    var resolveBundleIdentifiers = function resolveBundleIdentifiers(params) {
      return new Promise(function (resolve) {
        var filePathsCount = 0;
        var currentBundleID = params.currentBundleID,
            newBundleID = params.newBundleID,
            newBundlePath = params.newBundlePath,
            javaFileBase = params.javaFileBase,
            currentJavaPath = params.currentJavaPath,
            newJavaPath = params.newJavaPath;

        (0, _bundleIdentifiers.bundleIdentifiers)(currentAppName, newName, projectName, currentBundleID, newBundleID, newBundlePath).map(function (file) {
          filePathsCount += file.paths.length - 1;
          var itemsProcessed = 0;

          file.paths.map(function (filePath, index) {
            var newPaths = [];
            if (_fs2.default.existsSync(_path2.default.join(__dirname, filePath))) {
              newPaths.push(_path2.default.join(__dirname, filePath));

              setTimeout(function () {
                itemsProcessed += index;
                replaceContent(file.regex, file.replacement, newPaths);
                if (itemsProcessed === filePathsCount) {
                  var oldBundleNameDir = _path2.default.join(__dirname, javaFileBase, currentBundleID);
                  resolve({ oldBundleNameDir: oldBundleNameDir, shouldDelete: currentJavaPath !== newJavaPath });
                }
              }, 200 * index);
            }
          });
        });
      });
    };

    var rename = function rename() {
      resolveFoldersAndFiles.then(resolveFilesToModifyContent).then(resolveJavaFiles).then(resolveBundleIdentifiers).then(deletePreviousBundleDirectory).then(cleanBuilds).then(function () {
        return console.log(('APP SUCCESSFULLY RENAMED TO "' + newName + '"! \uD83C\uDF89 \uD83C\uDF89 \uD83C\uDF89').green);
      }).then(function () {
        if (_fs2.default.existsSync(_path2.default.join(__dirname, 'ios', 'Podfile'))) {
          console.log('' + _colors2.default.yellow('Podfile has been modified, please run "pod install" inside ios directory.'));
        }
      }).then(function () {
        return console.log('' + _colors2.default.yellow('Please make sure to run "watchman watch-del-all" and "npm start --reset-cache" before running the app. '));
      });
    };

    rename();
  }).parse(process.argv);
  if (!process.argv.slice(2).length) _commander2.default.outputHelp();
}).catch(function (err) {
  if (err.code === 'ENOENT') return console.log('Directory should be created using "react-native init"');

  return console.log('Something went wrong: ', err);
});
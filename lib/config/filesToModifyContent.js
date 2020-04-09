'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filesToModifyContent = filesToModifyContent;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function filesToModifyContent(currentAppName, newName) {
  var nS_CurrentAppName = currentAppName.replace(/\s/g, '');
  var nS_NewName = newName.replace(/\s/g, '');

  return [{
    regex: '<string name="app_name">' + currentAppName + '</string>',
    replacement: '<string name="app_name">' + newName + '</string>',
    paths: ['android/app/src/main/res/values/strings.xml']
  }, {
    regex: nS_CurrentAppName,
    replacement: nS_NewName,
    paths: ['index.js', 'index.android.js', 'index.ios.js', _path2.default.join('ios', nS_NewName + '.xcodeproj', 'project.pbxproj'), _path2.default.join('ios', nS_NewName + '.xcworkspace', 'contents.xcworkspacedata'), _path2.default.join('ios', nS_NewName + '.xcodeproj', 'xcshareddata', 'xcschemes', nS_NewName + '.xcscheme'), _path2.default.join('ios', '' + nS_NewName, 'AppDelegate.m'), _path2.default.join('android', 'settings.gradle'), _path2.default.join('ios', nS_NewName + 'Tests', nS_NewName + 'Tests.m'), _path2.default.join('ios', 'build', 'info.plist'), _path2.default.join('ios', 'Podfile'), 'app.json']
  }, {
    regex: 'text="' + currentAppName + '"',
    replacement: 'text="' + newName + '"',
    paths: [_path2.default.join('ios', '' + nS_NewName, 'Base.lproj', 'LaunchScreen.xib')]
  }, {
    regex: currentAppName,
    replacement: newName,
    paths: [_path2.default.join('ios', '' + nS_NewName, 'Info.plist')]
  }, {
    regex: '"name": "' + nS_CurrentAppName + '"',
    replacement: '"name": "' + nS_NewName + '"',
    paths: ['package.json']
  }, {
    regex: '"displayName": "' + currentAppName + '"',
    replacement: '"displayName": "' + newName + '"',
    paths: ['app.json']
  }];
} // nS - No Space
// lC - Lowercase
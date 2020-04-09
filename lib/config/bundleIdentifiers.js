'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bundleIdentifiers = bundleIdentifiers;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bundleIdentifiers(currentAppName, newName, projectName, currentBundleID, newBundleID, newBundlePath) {
  var nS_CurrentAppName = currentAppName.replace(/\s/g, '');
  var nS_NewName = newName.replace(/\s/g, '');
  var lC_Ns_CurrentBundleID = currentBundleID.toLowerCase();
  var lC_Ns_NewBundleID = newBundleID.toLowerCase();

  return [{
    regex: currentBundleID,
    replacement: newBundleID,
    paths: ['android/app/BUCK', 'android/app/build.gradle', 'android/app/src/main/AndroidManifest.xml']
  }, {
    regex: currentBundleID,
    replacement: newBundleID,
    paths: [_path2.default.join('' + newBundlePath, 'MainActivity.java'), _path2.default.join('' + newBundlePath, 'MainApplication.java')]
  }, {
    regex: lC_Ns_CurrentBundleID,
    replacement: lC_Ns_NewBundleID,
    paths: [_path2.default.join('' + newBundlePath, 'MainApplication.java')]
  }, {
    // App name (probably) doesn't start with `.`, but the bundle ID will
    // include the `.`. This fixes a possible issue where the bundle ID
    // also contains the app name and prevents it from being inappropriately
    // replaced by an update to the app name with the same bundle ID
    regex: new RegExp('(?!\\.)(.|^)' + nS_CurrentAppName, 'g'),
    replacement: '$1' + nS_NewName,
    paths: [_path2.default.join('' + newBundlePath, 'MainActivity.java')]
  }, {
    regex: currentBundleID,
    replacement: newBundleID,
    paths: [_path2.default.join('ios', nS_NewName + '.xcodeproj', 'project.pbxproj')]
  }];
} // nS - No Space
// lC - Lowercase
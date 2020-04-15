// nS - No Space
// lC - Lowercase
import path from 'path';

export function bundleIdentifiers(currentAppName, newName, projectName, currentBundleID, newBundleID, newBundlePath) {
  const nS_CurrentAppName = currentAppName.replace(/\s/g, '');
  const nS_NewName = newName.replace(/\s/g, '');
  const lC_Ns_CurrentBundleID = currentBundleID.toLowerCase();
  const lC_Ns_NewBundleID = newBundleID.toLowerCase();

  return [
    {
      regex: currentBundleID,
      replacement: newBundleID,
      paths: ['android/app/BUCK', 'android/app/build.gradle', 'android/app/src/main/AndroidManifest.xml'],
    },
    {
      regex: currentBundleID,
      replacement: newBundleID,
      paths: [
        path.join(`${newBundlePath}`, 'MainActivity.java'),
        path.join(`${newBundlePath}`, 'MainApplication.java'),
      ],
    },
    {
      regex: lC_Ns_CurrentBundleID,
      replacement: lC_Ns_NewBundleID,
      paths: [path.join(`${newBundlePath}`, 'MainApplication.java')],
    },
    {
      // App name (probably) doesn't start with `.`, but the bundle ID will
      // include the `.`. This fixes a possible issue where the bundle ID
      // also contains the app name and prevents it from being inappropriately
      // replaced by an update to the app name with the same bundle ID
      regex: new RegExp(`(?!\\.)(.|^)${nS_CurrentAppName}`, 'g'),
      replacement: `$1${nS_NewName}`,
      paths: [path.join(`${newBundlePath}`, 'MainActivity.java')],
    },
    {
      regex: currentBundleID,
      replacement: newBundleID,
      paths: [path.join('ios', `${nS_NewName}.xcodeproj`, 'project.pbxproj')],
    },
  ];
}

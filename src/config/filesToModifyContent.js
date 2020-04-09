// nS - No Space
// lC - Lowercase
import path from 'path';

export function filesToModifyContent(currentAppName, newName) {
  const nS_CurrentAppName = currentAppName.replace(/\s/g, '');
  const nS_NewName = newName.replace(/\s/g, '');

  return [
    {
      regex: `<string name="app_name">${currentAppName}</string>`,
      replacement: `<string name="app_name">${newName}</string>`,
      paths: ['android/app/src/main/res/values/strings.xml'],
    },
    {
      regex: nS_CurrentAppName,
      replacement: nS_NewName,
      paths: [
        'index.js',
        'index.android.js',
        'index.ios.js',
        path.join('ios', `${nS_NewName}.xcodeproj`, 'project.pbxproj'),
        path.join('ios', `${nS_NewName}.xcworkspace`, 'contents.xcworkspacedata'),
        path.join('ios', `${nS_NewName}.xcodeproj`, 'xcshareddata', 'xcschemes', `${nS_NewName}.xcscheme`),
        path.join('ios', `${nS_NewName}`, 'AppDelegate.m'),
        path.join('android', 'settings.gradle'),
        path.join('ios', `${nS_NewName}Tests`, `${nS_NewName}Tests.m`),
        path.join('ios', 'build', 'info.plist'),
        path.join('ios', 'Podfile'),
        'app.json',
      ],
    },
    {
      regex: `text="${currentAppName}"`,
      replacement: `text="${newName}"`,
      paths: [path.join('ios', `${nS_NewName}`, 'Base.lproj', 'LaunchScreen.xib')],
    },
    {
      regex: currentAppName,
      replacement: newName,
      paths: [path.join('ios', `${nS_NewName}`, 'Info.plist')],
    },
    {
      regex: `"name": "${nS_CurrentAppName}"`,
      replacement: `"name": "${nS_NewName}"`,
      paths: ['package.json'],
    },
    {
      regex: `"displayName": "${currentAppName}"`,
      replacement: `"displayName": "${newName}"`,
      paths: ['app.json'],
    },
  ];
}

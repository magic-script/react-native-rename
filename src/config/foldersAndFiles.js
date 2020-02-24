// nS - No Space
// lC - Lowercase

export function foldersAndFiles(currentAppName, newName) {
  const nS_CurrentAppName = currentAppName.replace(/\s/g, '');
  const nS_NewName = newName.replace(/\s/g, '');

  return [
    `ios/${nS_CurrentAppName}`,
    `ios/${nS_CurrentAppName}.xcodeproj`,
    `ios/${nS_NewName}.xcodeproj/xcshareddata/xcschemes/${nS_CurrentAppName}.xcscheme`,
    `ios/${nS_CurrentAppName}Tests`,
    `ios/${nS_NewName}Tests/${nS_CurrentAppName}Tests.m`,
    `ios/${nS_CurrentAppName}.xcworkspace`,
    `ios/${nS_CurrentAppName}-Bridging-Header.h`,
  ];
}

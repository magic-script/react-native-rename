#!/usr/bin/env node

// nS - No Space
// lC - Lowercase

import cheerio from 'cheerio';
import colors from 'colors';
import fs from 'fs';
import program from 'commander';
import replace from 'node-replace';
import shell from 'shelljs';
import pjson from '../package.json';
import path from 'path';
import { foldersAndFiles } from './config/foldersAndFiles';
import { filesToModifyContent } from './config/filesToModifyContent';
import { bundleIdentifiers } from './config/bundleIdentifiers';

const devTestRNProject = ''; // For Development eg '/Users/junedomingo/Desktop/RN49'
const __dirname = devTestRNProject || process.cwd();
const projectName = pjson.name;
const replaceOptions = {
  recursive: true,
  silent: true,
};

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function replaceContent(regex, replacement, paths) {
  replace({
    regex,
    replacement,
    paths,
    ...replaceOptions,
  });

  for (const filePath of paths) {
    console.log(`${filePath.replace(__dirname, '')} ${colors.green('MODIFIED')}`);
  }
}

function deleteFiles(path) {
  var files = [];
  if (fs.existsSync(path)) {
    if (fs.lstatSync(path).isFile()) {
      fs.unlinkSync(path);
    } else {
      files = fs.readdirSync(path);
      files.forEach(function(file, index) {
        var curPath = path + '/' + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          console.log(`Delete files, is directory, ${curPath}`);
          deleteFiles(curPath);
        } else {
          console.log(`Delete files, is file, ${curPath}`);
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
}

const deletePreviousBundleDirectory = ({ oldBundleNameDir, shouldDelete }) => {
  if (shouldDelete) {
    const dir = oldBundleNameDir.replace(/\./g, '/');
    const deleteDirectory = shell.rm('-rf', dir);
    Promise.resolve(deleteDirectory);
    console.log('Done removing previous bundle directory.'.green);
  } else {
    Promise.resolve();
    console.log('Bundle directory was not changed. Keeping...'.yellow);
  }
};

const cleanBuilds = () => {
  const deleteDirectories = shell.rm('-rf', [
    path.join(__dirname, 'ios/build/*'),
    path.join(__dirname, 'android/.gradle/*'),
    path.join(__dirname, 'android/app/build/*'),
    path.join(__dirname, 'android/build/*'),
  ]);
  Promise.resolve(deleteDirectories);
  console.log('Done removing builds.'.green);
};

function copyFiles(srcPath, destPath) {
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath);
  }
  const filesToCreate = fs.readdirSync(srcPath);
  filesToCreate.forEach(file => {
    const origFilePath = `${srcPath}/${file}`;
    const stats = fs.statSync(origFilePath);
    if (stats.isFile()) {
      var contents = fs.readFileSync(origFilePath, 'utf8');
      const writePath = `${destPath}/${file}`;
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      let newDestPath = `${destPath}/${file}`;
      copyFiles(origFilePath, newDestPath);
    }
  });
}

function copyFileOrDir(element, destPath) {
  const stats = fs.statSync(element);
  if (stats.isFile()) {
    var contents = fs.readFileSync(element, 'utf8');
    fs.writeFileSync(destPath, contents, 'utf8');
  } else if (stats.isDirectory()) {
    copyFiles(element, destPath);
  }
}

readFile(path.join(__dirname, 'android/app/src/main/res/values/strings.xml'))
  .then(data => {
    const $ = cheerio.load(data);
    const currentAppName = $('string[name=app_name]').text();
    const nS_CurrentAppName = currentAppName.replace(/\s/g, '');
    const lC_Ns_CurrentAppName = nS_CurrentAppName.toLowerCase();

    program
      .version('2.4.1')
      .arguments('<newName>')
      .option('-b, --bundleID [value]', 'Set custom bundle identifier eg. "com.junedomingo.travelapp"')
      .action(newName => {
        const nS_NewName = newName.replace(/\s/g, '');
        const namePattern = /^(?=.{3,30}$)[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/;
        const bundlePattern = /^(?=.{3,30}$)(?=.*[.])[a-zA-Z0-9]+(?:[.][a-zA-Z0-9]+)*$/;
        const lC_Ns_NewAppName = nS_NewName.toLowerCase();
        const bundleID = program.bundleID ? program.bundleID.toLowerCase() : null;
        let newBundlePath;
        const listOfFoldersAndFiles = foldersAndFiles(currentAppName, newName);
        const listOfFilesToModifyContent = filesToModifyContent(currentAppName, newName, projectName);

        if (bundleID) {
          if (!bundlePattern.test(bundleID)) {
            return console.log(
              'Invalid Bundle Identifier. Add something like "com.travelapp" or "com.junedomingo.travelapp"'
            );
          }
        }

        if (!namePattern.test(newName)) {
          return console.log(
            `"${newName}" is not a valid name for a project. Please use a valid identifier name (alphanumeric and space).`
          );
        }

        if (newName === currentAppName || newName === nS_CurrentAppName || newName === lC_Ns_CurrentAppName) {
          return console.log('Please try a different name.');
        }

        // Move files and folders from ./config/foldersAndFiles.js
        const resolveFoldersAndFiles = new Promise(resolve => {
          listOfFoldersAndFiles.forEach((element, index) => {
            const dest = element.replace(new RegExp(nS_CurrentAppName, 'i'), nS_NewName);
            let itemsProcessed = 1;
            const successMsg = `/${dest} ${colors.green('RENAMED')}`;

            setTimeout(() => {
              itemsProcessed += index;

              if (fs.existsSync(path.join(__dirname, element)) || !fs.existsSync(path.join(__dirname, element))) {
                console.log(`Resolve folders and files directory exists: ${path.join(__dirname, element)}`);
                copyFileOrDir(path.join(__dirname, element), path.join(__dirname, dest));
                deleteFiles(path.join(__dirname, element));
                console.log(successMsg);
              }

              if (itemsProcessed === listOfFoldersAndFiles.length) {
                resolve();
              }
            }, 200 * index);
          });
        });

        // Modify file content from ./config/filesToModifyContent.js
        const resolveFilesToModifyContent = () =>
          new Promise(resolve => {
            let filePathsCount = 0;
            let itemsProcessed = 0;
            console.log(`Files to modify content: ${listOfFilesToModifyContent}`);
            listOfFilesToModifyContent.map(file => {
              filePathsCount += file.paths.length;

              file.paths.map((filePath, index) => {
                const newPaths = [];

                setTimeout(() => {
                  itemsProcessed++;
                  if (fs.existsSync(path.join(__dirname, filePath))) {
                    newPaths.push(path.join(__dirname, filePath));
                    replaceContent(file.regex, file.replacement, newPaths);
                  }
                  if (itemsProcessed === filePathsCount) {
                    resolve();
                  }
                }, 200 * index);
              });
            });
          });

        const resolveJavaFiles = () =>
          new Promise(resolve => {
            readFile(path.join(__dirname, 'android/app/src/main/AndroidManifest.xml')).then(data => {
              const $ = cheerio.load(data);
              const currentBundleID = $('manifest').attr('package');
              const newBundleID = program.bundleID ? bundleID : `com.${lC_Ns_NewAppName}`;
              const javaFileBase = '/android/app/src/main/java';
              const newJavaPath = `${javaFileBase}/${newBundleID.replace(/\./g, '/')}`;
              const currentJavaPath = `${javaFileBase}/${currentBundleID.replace(/\./g, '/')}`;

              if (bundleID) {
                newBundlePath = newJavaPath;
              } else {
                newBundlePath = newBundleID.replace(/\./g, '/').toLowerCase();
                newBundlePath = `${javaFileBase}/${newBundlePath}`;
              }

              const fullCurrentBundlePath = path.join(__dirname, currentJavaPath);
              const fullNewBundlePath = path.join(__dirname, newBundlePath);

              // Create new bundle folder if doesn't exist yet
              if (!fs.existsSync(fullNewBundlePath)) {
                shell.mkdir('-p', fullNewBundlePath);
                copyFiles(fullCurrentBundlePath, fullNewBundlePath);
                deleteFiles(fullCurrentBundlePath);
                console.log(`${newBundlePath} ${colors.green('BUNDLE INDENTIFIER CHANGED')}`);
              }

              const vars = {
                currentBundleID,
                newBundleID,
                newBundlePath,
                javaFileBase,
                currentJavaPath,
                newJavaPath,
              };
              resolve(vars);
            });
          });

        const resolveBundleIdentifiers = params =>
          new Promise(resolve => {
            let filePathsCount = 0;
            const { currentBundleID, newBundleID, newBundlePath, javaFileBase, currentJavaPath, newJavaPath } = params;
            bundleIdentifiers(currentAppName, newName, projectName, currentBundleID, newBundleID, newBundlePath).map(
              file => {
                filePathsCount += file.paths.length - 1;
                let itemsProcessed = 0;

                file.paths.map((filePath, index) => {
                  const newPaths = [];
                  if (fs.existsSync(path.join(__dirname, filePath))) {
                    newPaths.push(path.join(__dirname, filePath));

                    setTimeout(() => {
                      itemsProcessed += index;
                      replaceContent(file.regex, file.replacement, newPaths);
                      if (itemsProcessed === filePathsCount) {
                        const oldBundleNameDir = path.join(__dirname, javaFileBase, currentBundleID);
                        resolve({ oldBundleNameDir, shouldDelete: currentJavaPath !== newJavaPath });
                      }
                    }, 200 * index);
                  }
                });
              }
            );
          });

        const rename = () => {
          resolveFoldersAndFiles
            .then(resolveFilesToModifyContent)
            .then(resolveJavaFiles)
            .then(resolveBundleIdentifiers)
            .then(deletePreviousBundleDirectory)
            .then(cleanBuilds)
            .then(() => console.log(`APP SUCCESSFULLY RENAMED TO "${newName}"! 🎉 🎉 🎉`.green))
            .then(() => {
              if (fs.existsSync(path.join(__dirname, 'ios', 'Podfile'))) {
                console.log(
                  `${colors.yellow('Podfile has been modified, please run "pod install" inside ios directory.')}`
                );
              }
            })
            .then(() =>
              console.log(
                `${colors.yellow(
                  'Please make sure to run "watchman watch-del-all" and "npm start --reset-cache" before running the app. '
                )}`
              )
            );
        };

        rename();
      })
      .parse(process.argv);
    if (!process.argv.slice(2).length) program.outputHelp();
  })
  .catch(err => {
    if (err.code === 'ENOENT') return console.log('Directory should be created using "react-native init"');

    return console.log('Something went wrong: ', err);
  });

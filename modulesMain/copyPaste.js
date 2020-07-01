const electron = require('electron');
const { ipcMain } = electron;
const { exec } = require('child_process');
const path = require('path');
const { ncp } = require('ncp');
ncp.limit = 16;

const ProgressBar = require('electron-progressbar');

const { clearArrayOfStrings } = require('../helpersMain/helpers');

const formDirArrayWin = require('../helpersMain/formDirArrayWin');
const formDirArrayLinux = require('../helpersMain/formDirArrayLinux');
const pasteUnderNewName = require('../helpersMain/pasteUnderNewName');
const deleteFile = require('../helpersMain/deleteFile');
const getSourceDirFromArr = require('../helpersMain/getSourceDirFromArr');
const dirToLs = require('../helpersMain/dirToLs');

let copiedFiles = [];
let filesWereCut = false;

// Allows to copy/cut/paste files/folders
module.exports = (mainWindow) => {
  ipcMain.on('copy-files', (event, isCut = false) => {
    mainWindow.webContents.send('copy-to-clipboard', { isCut });
  });

  ipcMain.on('paste-files', (event) => {
    mainWindow.webContents.send('paste-from-clipboard');
  });

  ipcMain.on('copied-file', (event, dirPath, namesArray, isCut) => {
    console.log("'copied-file'", dirPath, namesArray, isCut);

    copiedFiles = [];
    filesWereCut = isCut;

    namesArray.map((name) => copiedFiles.push(dirPath + name));
    if (isCut) {
      console.log('Cut Files ', copiedFiles);
    } else {
      console.log('Copied Files ', copiedFiles);
    }
  });

  ipcMain.on('pasted-file', (event, dirPath, deleteSourceFiles = false) => {
    // TODO: send response to renderer with array of pasted filenames and select these files

    if (copiedFiles.length > 0) {
      const progressBar = new ProgressBar({
        indeterminate: false,
        text: 'Preparing data...',
        detail: 'Copying data please wait...',
        maxValue: copiedFiles.length,
        browserWindow: {
          text: 'Preparing data...',
          detail: 'Wait...',
          webPreferences: {
            nodeIntegration: true,
          },
        },
        webPreferences: {
          nodeIntegration: true,
        },
      });

      progressBar
        .on('completed', function () {
          console.info(`completed...`);

          progressBar.detail = 'Files were copied';
        })
        .on('aborted', function (value) {
          console.info(`aborted... ${value}`);
        })
        .on('progress', function (value) {
          progressBar.detail = `Value ${value} out of ${
            progressBar.getOptions().maxValue
          }...`;
        });

      console.log(`Files ${copiedFiles} pasted to ${dirPath}`);
      let command;
      const command_unix = `ls "${dirPath}" -p --hide=*.sys --hide="System Volume Information" --group-directories-first`;
      const command_win = `chcp 65001 | dir "${path.win32.normalize(
        dirPath
      )}" /o`;

      process.platform === 'win32'
        ? (command = command_win)
        : (command = command_unix);

      const copiedFilesNames = copiedFiles.map((item) => {
        const itemArr = item.split('/');
        return itemArr[itemArr.length - 1] === ''
          ? itemArr[itemArr.length - 2] + '/'
          : itemArr[itemArr.length - 1];
      });
      console.log('copiedFilesNames', copiedFilesNames);
      exec(command, (err, stdout, stderr) => {
        console.log('stdout', stdout);
        if (err) {
          console.error('copyPaste module error: ', err);
        } else {
          let outputArray = [];
          let namesArray = clearArrayOfStrings(stdout.toString().split('\n'));
          let convNamesArr;

          if (process.platform === 'win32') {
            convNamesArr = dirToLs(namesArray);
            outputArray = formDirArrayWin(convNamesArr, dirPath);
            console.log('outputArray', outputArray);
          } else {
            outputArray = formDirArrayLinux(namesArray, dirPath);
          }

          copiedFilesNames.map((item, idx) => {
            if (
              (process.platform === 'win32' && convNamesArr.includes(item)) ||
              (process.platform !== 'win32' && namesArray.includes(item))
            ) {
              console.log(`File ${item} already exists in ${dirPath}`);
              pasteUnderNewName(copiedFiles[idx], dirPath, () => {
                progressBar.value += 1;
                mainWindow.webContents.send('edit-action-complete', {
                  dirPath,
                });

                if (filesWereCut || deleteSourceFiles) {
                  // Delete source file here
                  const sourceDirPath = getSourceDirFromArr(copiedFiles);
                  deleteFile(sourceDirPath + item);
                  mainWindow.webContents.send('edit-action-complete', {
                    sourceDirPath,
                  });
                }
              });
            } else {
              console.log(`File ${item} will be first in ${dirPath}`);

              if (process.platform === 'win32') {
                ncp(
                  path.win32.normalize(copiedFiles[idx]),
                  path.win32.normalize(`${dirPath}${item}`),
                  function (err) {
                    if (err) {
                      return console.error(err);
                    }
                    progressBar.value += 1;
                    if (filesWereCut || deleteSourceFiles) {
                      // Delete source file here
                      const sourceDirPath = getSourceDirFromArr(copiedFiles);

                      deleteFile(sourceDirPath + item);
                      mainWindow.webContents.send('edit-action-complete', {
                        sourceDirPath,
                      });
                    }
                  }
                );
              } else {
                ncp(copiedFiles[idx], `${dirPath}${item}`, function (err) {
                  if (err) {
                    return console.error(err);
                  }
                  progressBar.value += 1;
                  if (filesWereCut || deleteSourceFiles) {
                    // Delete source file here
                    const sourceDirPath = getSourceDirFromArr(copiedFiles);

                    deleteFile(sourceDirPath + item);
                    mainWindow.webContents.send('edit-action-complete', {
                      sourceDirPath,
                    });
                  }
                });
              }
            }
          });
        }
      });
    }
  });
};

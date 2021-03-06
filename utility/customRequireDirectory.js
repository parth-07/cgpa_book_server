const fs = require('fs');
const path = require('path');

/**
 *
 * @param {String} dir -
 * @param {Bool} pascalCase -
 * @return {Object}
 */
function customRequireDirectory(dir, pascalCase = false) {
  const mp = {};
  const fileNames = fs.readdirSync(dir);
  const indexFile = path.join(dir, 'index.js');
  for (fileName of fileNames) {
    const file = path.join(dir, fileName);
    const isDir = fs.lstatSync(file).isDirectory();
    if (isDir) {
      let tempName = '';
      for (let i = 0; i < fileName.length; i++) {
        if (fileName[i] === '-') {
          if (i !== fileName.length - 1) {
            ++i;
            tempName += fileName[i].toUpperCase();
          }
        } else {
          tempName += fileName[i];
        }
      }
      fileName = tempName;
    } else {
      fileName = path.parse(fileName).name; // get fileName without extension
    }
    if (pascalCase) {
      fileName = fileName[0].toUpperCase() + fileName.slice(1);
    }
    if (file !== indexFile) {
      mp[fileName] = require(file);
    }
  }
  return mp;
}

module.exports = customRequireDirectory;

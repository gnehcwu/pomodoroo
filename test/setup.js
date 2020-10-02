const path = require('path');
const fs = require('fs');
const chaiAsPromised = require('chai-as-promised');

const getUserDataPath = function () {
  const productName = require('../package').productName;
  switch (process.platform) {
    case 'darwin':
      return path.join(process.env.HOME, 'Library', 'Application Support', productName);
    case 'win32':
      return path.join(process.env.APPDATA, productName);
    case 'freebsd':
    case 'linux':
    case 'sunos':
      return path.join(process.env.HOME, '.config', productName);
    default:
      throw new Error(`Unknown userDataPath path for platform ${process.platform}`);
  }
};


const removeStoredPreferences = () => {
  const userDataPath = getUserDataPath();
  try {
    fs.unlinkSync(path.join(userDataPath, 'Settings'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const setupApp = function (app) {
  chaiAsPromised.transferPromiseness = app.transferPromiseness;
  return app.client.waitUntilWindowLoaded();
};

module.exports = {
  removeStoredPreferences,
  getUserDataPath,
  setupApp,
};

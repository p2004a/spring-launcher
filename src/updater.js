'use strict';

const { autoUpdater } = require('electron-updater');

autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.autoDownload = false;
// Installer is small enough, and differential dowload isn't very reliable.
autoUpdater.disableDifferentialDownload = true;

module.exports = autoUpdater;

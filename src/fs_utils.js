'use strict';

const fs = require('fs');
const path = require('path');

const springPlatform = require('./spring_platform');

const log = require('electron-log');

const TMP_DIR = path.join(springPlatform.writePath, 'tmp');

function makeParentDir(filepath) {
	const destinationParentDir = path.dirname(filepath);
	makeDir(destinationParentDir);
}

function makeDir(dirpath) {
	if (!fs.existsSync(dirpath)) {
		fs.mkdirSync(dirpath, { recursive: true });
	}
}

let tempCounter = 0;
function getTemporaryFileName(baseName) {
	while (true) {
		tempCounter++;
		const temp = path.join(TMP_DIR, `${baseName}.${tempCounter}`);
		if (!fs.existsSync(temp)) {
			return temp;
		}
	}
	// unreachable
}

function removeTemporaryFiles() {
	fs.rmSync(TMP_DIR, { recursive: true, force: true });
}

// This is pretty awful, but I don't want to rewrite all the code to be
// properly async :tired-face:. This is hacky workaround for stupid
// Windows Antivirus software that locks files for a few seconds after
// they are created. This is a problem when we try to rename a file
// immediately after it is created.
function renameSyncWithRetry(source, destination) {
	const start = Date.now();
	let err = null;
	while (start + 20000 > Date.now()) {
		try {
			fs.renameSync(source, destination);
			return;
		} catch (error) {
			if (err === null) {
				log.error(`Failed to rename ${source} to ${destination}: ${error}, will retry operation for 20s in hopes that it succeeds...`);
			}
			err = error;
		}
	}
	throw err;
}

module.exports = {
	getTemporaryFileName: getTemporaryFileName,
	removeTemporaryFiles: removeTemporaryFiles,
	makeParentDir: makeParentDir,
	makeDir: makeDir,
	TMP_DIR: TMP_DIR,
	renameSyncWithRetry: renameSyncWithRetry,
};

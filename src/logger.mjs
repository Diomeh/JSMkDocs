/* eslint-disable no-console */

import clic from 'cli-color';

const timeLength = "HH:MM:SS".length;

const build = (message, color) => {
	const time = new Date().toTimeString().substring(0, timeLength);

	console.log(clic[color](`[${time}] ${message}`));
};

const logInfo = (message) => build(message, 'blue');
const logWarn = (message) => build(message, 'yellow');
const logError = (message) => build(message, 'red');
const logSuccess = (message) => build(message, 'green');
const logVerbose = (message) => build(message, 'magenta');
const logClean = (message) => console.log(message);

export {
	logInfo,
	logWarn,
	logError,
	logSuccess,
	logVerbose,
	logClean
};

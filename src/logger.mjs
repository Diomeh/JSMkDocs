// noinspection JSValidateJSDoc,JSUnusedGlobalSymbols

/**
 * @module Logger
 * @description Provides a set of logging functions that output color-coded messages to the console with timestamps.
 * If the `NO_COLOR` environment variable is set, it disables color output.
 *
 * @requires cli-color
 */

import clic from 'cli-color';

const timeLength = 'HH:MM:SS'.length;

/**
 * Builds a console log message with a timestamp and optional color formatting.
 *
 * @param {string} message - The message to log.
 * @param {string} color - The color name to use for formatting the message. Must be a valid `cli-color` color.
 */
const build = (message, color) => {
	const time = new Date().toTimeString().substring(0, timeLength);

	// Check for NO-COLOR env variable to disable color output
	if (process.env.NO_COLOR) {
		console.log(`[${time}] ${message}`);
	} else {
		console.log(clic[color](`[${time}] ${message}`));
	}
};

/**
 * Logs an informational message in blue or without color if `NO_COLOR` is set.
 *
 * @param {string} message - The message to log.
 */
const logInfo = (message) => build(message, 'blue');

/**
 * Logs a warning message in yellow or without color if `NO_COLOR` is set.
 *
 * @param {string} message - The message to log.
 */
const logWarn = (message) => build(message, 'yellow');

/**
 * Logs an error message in red or without color if `NO_COLOR` is set.
 *
 * @param {string} message - The message to log.
 */
const logError = (message) => build(message, 'red');

/**
 * Logs a success message in green or without color if `NO_COLOR` is set.
 *
 * @param {string} message - The message to log.
 */
const logSuccess = (message) => build(message, 'green');

/**
 * Logs a verbose message in magenta or without color if `NO_COLOR` is set.
 *
 * @param {string} message - The message to log.
 */
const logVerbose = (message) => build(message, 'magenta');

/**
 * Logs a clean message without a timestamp or color.
 *
 * @param {string} message - The message to log.
 */
const logClean = (message) => console.log(message);

export {
	logInfo,
	logWarn,
	logError,
	logSuccess,
	logVerbose,
	logClean
};

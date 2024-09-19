import minimist from 'minimist';
import { logClean, logError, logInfo } from './logger.mjs';

/**
 * @module CLI
 *
 * @description
 * This module provides a CLI tool for generating markdown documentation for JavaScript files.
 * It parses command-line arguments using `minimist` and applies default options such as source directories,
 * output directories, ignore lists, regex patterns, and more. The tool supports displaying help messages
 * and version information.
 *
 * @requires minimist
 * @requires ./logger.mjs
 *
 * The main functionalities of this module include:
 * - Parsing command-line arguments (`parseArgs` function)
 * - Displaying version information (`displayVersion` function)
 * - Displaying help information (`displayHelp` function)
 * - Running the CLI tool (`run` function)
 */

/**
 * @typedef {Object} CLIArg
 * @property {string} alias - Shortened version of the option
 * @property {string} desc - Description of the option
 * @property {string|array|RegExp|boolean} value - Default value of the option
 * @property {?function} [parse] - Function to parse the value of the option
 * @property {?string} [example] - Example usage of the option
 */

/**
 * Default configuration options for the CLI tool.
 * Each option follows the structure defined in the {@link CLIArg} typedef.
 *
 * @constant
 * @type {Object.<string, CLIArg>}
 * @property {CLIArg} version - Option to display the version number.
 * @property {CLIArg} help - Option to display the help message.
 * @property {CLIArg} source - Option to specify source files/directories to parse.
 * @property {CLIArg} ignore - Option to specify files/directories to ignore.
 * @property {CLIArg} output - Option to specify the output directory for markdown files.
 * @property {CLIArg} regex - Option to specify a regex pattern to match files for parsing.
 * @property {CLIArg} pattern - Option to specify a glob pattern to match files for parsing.
 */
const defaults = Object.freeze({
	version: Object.freeze({
		alias: 'v',
		desc: 'Display the version number',
		value: false,
	}),
	help: Object.freeze({
		alias: 'h',
		desc: 'Display this help message',
		value: false,
	}),
	source: Object.freeze({
		alias: 's',
		desc: 'Comma-separated list of source files/directories to parse',
		value: Object.freeze(['./']),
		parse: (value) => value.split(','),
		example: '--source src,lib',
	}),
	ignore: Object.freeze({
		alias: 'i',
		desc: 'Comma-separated list of files/directories to ignore',
		value: Object.freeze(['.gitignore', '.git', 'node_modules']),
		parse: (value) => value.split(','),
		example: '--ignore .git,node_modules',
	}),
	output: Object.freeze({
		alias: 'o',
		desc: 'Directory to output the generated markdown files',
		value: './docs_src',
		example: '--output ./docs',
	}),
	regex: Object.freeze({
		alias: 'r',
		desc: 'Regex that files must match to be parsed',
		value: /\.js$/u,
		parse: (value) => new RegExp(value, 'u'),
		example: '--regex "\\.ts$"',
	}),
	pattern: Object.freeze({
		alias: 'g',
		desc: 'Glob pattern to match files for parsing',
		value: '**/*.js',
		example: '--pattern "**/*.ts"',
	}),
});

/**
 * Parses the command-line arguments using minimist and applies the appropriate default values and parsing logic.
 * Logs errors for invalid options and processes the arguments accordingly.
 *
 * @returns {Object} Parsed command-line arguments with applied defaults and parsing logic.
 */
const parseArgs = () => {
	// Discard the execution path and script name (argv[0] and argv[1])
	const args = minimist(process.argv.slice(2));

	// Discard unnamed arguments
	delete args._;

	// Set default values
	const parsedArgs = {};
	for (const [k, v] of Object.entries(defaults)) {
		parsedArgs[k] = v.value;
	}

	// Iterate over the arguments and expand them
	Object.keys(args).forEach((k) => {
		// Get expanded key if alias is used
		const arg = k.length > 1 ? k : Object.keys(defaults).find((key) => defaults[key].alias === k);

		if (!defaults[arg]) {
			logError(`'${k}' is not a valid option!`);
			logInfo('Use the --help option to see the available options.');
			return;
		}

		// Get the default value and parse function
		const { defVal, parse } = defaults[arg];
		let value = args[k] || defVal;

		// Parse the value if a function is provided
		if (parse) value = parse(value);

		// Persist the argument
		parsedArgs[arg] = value;
	});

	return parsedArgs;
};

/**
 * Displays the version number of the CLI tool by reading it from the package.json file and exits the process.
 */
const displayVersion = () => {
	const { version } = require('../package.json');
	logClean(`jsmkdocs version v${version}`);
	process.exit();
};

/**
 * Displays the help message for the CLI tool, listing all available options and their descriptions.
 * Also displays the default values and example usage for each option, then exits the process.
 */
const displayHelp = () => {
	logClean('Usage: jsmkdocs [options]');
	Object.keys(defaults).forEach((k) => {
		const { alias, desc } = defaults[k];
		logClean(`\t-${alias} --${k}\t${desc}`);
	});

	logClean('\nDefault values:');
	Object.keys(defaults).forEach((k) => {
		const { value } = defaults[k];
		if (!['help', 'version'].includes(k)) logClean(`\t${k}: ${value}`);
	});

	logClean('\nExamples:\n');

	logClean('\tPrint the help message');
	logClean('\t\tjsmkdocs --help\n');

	logClean('\tDisplay the version number');
	logClean('\t\tjsmkdocs --version\n');

	logClean('\tBuild documentation for all .ts files in src and lib directories\n' +
		'\twhile ignoring .git and node_modules directories\n' +
		'\tand outputting the generated markdown files to the docs directory');

	let message = 'jsmkdocs';
	Object.keys(defaults).forEach((k) => {
		const { example } = defaults[k];
		if (example) message += ` ${example} \\\n\t\t\t`;
	});
	logClean('\t\t' + message.trim().substring(0, message.length - 3));

	process.exit();
};

/**
 * Main execution function for the CLI tool.
 * Parses the arguments and calls the appropriate action (version or help) based on the user's input.
 */
const run = () => {
	const args = parseArgs();

	if (args.version) {
		displayVersion();
	}

	if (args.help) {
		displayHelp();
	}
};

export default run;

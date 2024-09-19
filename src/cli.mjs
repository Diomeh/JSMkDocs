import minimist from 'minimist';
import { logClean, logError, logInfo } from './logger.mjs';

const defaults = Object.freeze({
	version: Object.freeze({
		alias: 'v',
		desc: 'Display the version number',
		value: false,
		parse: null,
	}),
	help: Object.freeze({
		alias: 'h',
		desc: 'Display this help message',
		value: false,
		parse: null,
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
		parse: null,
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
		value: '**/*.js', // Default glob pattern to match all .js files
		parse: null,
		example: '--pattern "**/*.ts"',
	}),
});

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

const displayVersion = () => {
	const { version } = require('../package.json');
	logClean(`jsmkdocs version v${version}`);
	process.exit();
};

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

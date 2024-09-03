import { logError, logInfo } from './logger.mjs';

const options = {
	ignore: {
		alias: 'i',
		help: 'comma-separated list of files/directories to ignore',
		parser: (value) => value.split(','),
		value: ['.git', 'node_modules'],
	},
	out: {
		alias: 'o',
		help: 'relative path to the output directory',
		parser: (value) => value,
		value: './docs_src',
	},
	regex: {
		alias: 'r',
		help: 'regex string for matching files in the source directory',
		parser: (value) => new RegExp(value, 'u'),
		value: new RegExp(/\.js$/u, 'u'),
	},
	src: {
		alias: 's',
		help: 'relative path to the source directory',
		parser: (value) => value,
		value: './',
	},
};

const getOptionByAlias = (alias) => {
	const [option] = Object.keys(options).filter((k) => options[k].alias === alias);

	return options[option];
};

const displayHelp = () => {
	Object.keys(options).forEach((k) => logInfo(`   --${k}   \t-${options[k].alias}\t${options[k].help}`));

	process.exit();
};

const displayError = (optionName) => {
	logError(`'${optionName}' is not a supported option!\n`);
	displayHelp();
};

export const get = (optionName) => options[optionName].value;

export const set = (optionName, value) => {
	if (optionName === 'help' || optionName === 'h') {
		displayHelp();
	}

	const option = optionName.length === 1 ? getOptionByAlias(optionName) : options[optionName];

	if (!option) {
		displayError(optionName);
	}

	option.value = option.parser(value);
};

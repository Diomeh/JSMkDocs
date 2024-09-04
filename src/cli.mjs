import {logClean, logError, logInfo, logWarn} from './logger.mjs';
import dox from 'dox';
import fs from 'fs';
import minimist from 'minimist';
import path from 'path';

/**
 * @typedef {Object} CLIArg
 * @property {string} alias - Shortened version of the option
 * @property {string} desc - Description of the option
 * @property {string|array|RegExp|boolean} defVal - Default value of the option
 * @property {function} parse - Function to parse the value of the option
 */

/**
 * @typedef {Object} CLIDefaultArgs
 * @property {CLIArg} version - Display the version number
 * @property {CLIArg} help - Display the help message
 * @property {CLIArg} ignore - List of files/directories to ignore'
 * @property {CLIArg} output - Directory to output the generated markdown files
 * @property {CLIArg} regex - Regex that files must match to be parsed
 * @property {CLIArg} source - List of files/directories to parse
 */

/**
 * @typedef {Object} CLIArgs
 * @property {boolean} version - Display the version number
 * @property {boolean} help - Display the help message
 * @property {string[]} ignore - List of files/directories to ignore'
 * @property {string} output - Directory to output the generated markdown files
 * @property {RegExp} regex - Regex that files must match to be parsed
 * @property {string[]} source - List of files/directories to parse
 */

/**
 * @typedef {Object} DocCommentDescription
 * @property {string} full - Description of the comment
 * @property {string} summary - Summary of the comment
 * @property {string} body - Body of the comment
 */

/**
 * @typedef {Object} DocCommentTag
 * @property {string} type - Type of the tag
 * @property {string} string - String of the tag
 * @property {string} name - Name of the tag
 * @property {string} description - Description of the tag
 * @property {Array} types - Array of types
 * @property {string} typesDescription - HTML representation of the types
 * @property {boolean} optional - Whether the tag is optional
 * @property {boolean} nullable - Whether the tag is nullable
 * @property {boolean} nonNullable - Whether the tag is non-nullable
 * @property {boolean} variable - Whether the tag is a variable
 * @property {string} html - HTML of the tag
 * @property {string} commentPath - The contents of the `docs` tag, representing the path where the comment will be placed
 */

/**
 * @typedef {Object} DocCtx
 * @property {string} type - Type of the context
 * @property {string} receiver - Receiver of the context
 * @property {string} name - Name of the context
 * @property {string} string - String of the context
 */

/**
 * @typedef {Object} DocComment
 * @property {DocCommentDescription} description - Description of the comment
 * @property {Array<DocCommentTag>} tags - Tags of the comment
 * @property {string} code - Code of the comment
 * @property {DocCtx} ctx - Context of the comment
 * @property {boolean} ignore - Whether the comment is ignored
 * @property {boolean} isPrivate - Whether the comment is private
 * @property {boolean} isEvent - Whether the comment is an event
 * @property {boolean} isConstructor - Whether the comment is a constructor
 * @property {number} line - Line number of the comment
 * @property {number} codeStart - Start of the code
 */

/**
 * @classdesc Command line interface for `jsmkdocs`
 * @author David Urbina (davidurbina.dev@gmail.com)
 * @license MIT
 * @version 0.0.1
 * @since 2024-09-02
 */
class CLI {
	/**
	 * @desc Default arguments for the command line interface
	 * @type {Readonly<CLIDefaultArgs>}
	 * @private
	 */
	#defaults = Object.freeze({
		version: {
			alias: 'v',
			desc: 'Display the version number',
			defVal: false,
			parse: null,
		},
		help: {
			alias: 'h',
			desc: 'Display this help message',
			defVal: false,
			parse: null,
		},
		ignore: {
			alias: 'i',
			desc: 'comma-separated list of files/directories to ignore',
			defVal: ['.gitignore', '.git', 'node_modules'],
			parse: (value) => value.split(','),
		},
		output: {
			alias: 'o',
			desc: 'directory to output the generated markdown files',
			defVal: './docs_src',
			parse: null,
		},
		regex: {
			alias: 'r',
			desc: 'regex that files must match to be parsed',
			defVal: /\.js$/u,
			parse: (value) => new RegExp(value, 'u'),
		},
		source: {
			alias: 's',
			desc: 'comma-separated list of files/directories to parse',
			defVal: ['./'],
			parse: (value) => value.split(','),
		},
	});

	/**
	 * @desc Arguments set by the user
	 * @type {CLIArgs}
	 * @private
	 */
	#args;

	/**
	 * @desc Files to be parsed
	 * @type {Array<string>}
	 * @private
	 */
	#files;

	/**
	 * @desc jsDoc comments parsed from the files
	 * @type {Array<DocComment>}
	 * @private
	 */
	#comments;

	/**
	 * @desc Tree document structure for markdown generation
	 * @type {Object}
	 * @private
	 */
	#tree;

	/**
	 * @desc Version number of the CLI
	 * @type {string}
	 * @private
	 */
	#version = '0.0.1';

	/**
	 * @desc Name of the `docs` tag
	 * @type {string}
	 * @static
	 */
	static DOC_TAG_NAME = 'docs';

	/**
	 * @desc List of tags that are usually grouped in a comment bloc
	 * @type {Array<string>}
	 * @static
	 */
	static GROUPED_TAGS = ['param', 'property', 'returns', 'return', 'throws', 'example'];

	/**
	 * @desc List of tags that are usually used to infer the title of a comment bloc
	 * @type {Array<string>}
	 * @static
	 */
	static TITLE_TAGS = ['name', 'alias', 'typedef'];

	/**
	 * @desc List of tags that are usually used to infer the description of a comment bloc
	 * @type {Array<string>}
	 * @static
	 */
	static DESC_TAGS = ['desc', 'description', 'classdesc'];

	/**
	 * @desc Create a new instance of CLI immediately parsing the arguments
	 * @constructor CLI
	 * @public
	 */
	constructor() {
		// Discard the execution path and script name (argv[0] and argv[1])
		// eslint-disable-next-line no-magic-numbers
		const args = minimist(process.argv.slice(2));

		// Discard unnamed arguments
		delete args._;

		// noinspection JSCheckFunctionSignatures
		this.#persistArgs(args);
	}

	/**
	 * @desc Expands and persists the arguments passed by the user setting the default values if necessary
	 * @param {CLIArgs} args - Arguments passed by the user
	 * @returns {void}
	 * @private
	 */
	#persistArgs(args) {
		// Set default values
		this.#args = {};
		for (const [k, v] of Object.entries(this.#defaults)) {
			this.#args[k] = v.defVal;
		}

		// Iterate over the arguments and expand them
		Object.keys(args).forEach((k) => {
			// Get expanded key if alias is used
			const arg = k.length > 1 ? k : Object.keys(this.#defaults).find((key) => this.#defaults[key].alias === k);

			if (!this.#defaults[arg]) {
				logError(`'${k}' is not a valid option!`);
				logInfo('Use the --help option to see the available options.');
				return;
			}

			// Get the default value and parse function
			const {defVal, parse} = this.#defaults[arg];
			let value = args[k] || defVal;

			// Parse the value if a function is provided
			if (parse) value = parse(value);

			// Persist the argument
			this.#args[arg] = value;
		});
	}

	/**
	 * @desc Display the help message
	 * @returns {void}
	 * @private
	 */
	#helpMessage() {
		logClean('Usage: jsmkdocs [options]');
		Object.keys(this.#defaults).forEach((k) => {
			const {alias, desc} = this.#defaults[k];
			logClean(`\t -${alias} --${k}\t ${desc}`);
		});
	}

	/**
	 * @desc Run the CLI
	 * @returns {void}
	 * @public
	 */
	run() {
		if (this.#args.version) {
			logClean(this.#version);
			return;
		}

		if (this.#args.help) {
			this.#helpMessage();
			return;
		}

		// For correct execution we need to
		// 1. Load the files to be parsed
		//   - This means getting all source file paths while ignoring specified files / directories
		//   - The .gitignore file gets special treatment, as it is read and every line is treated as an ignore path
		// 2. Load all `docs` comments from the files
		//   - This means parsing the files with Dox and extracting comments with the `docs` tag
		//   - The `docs` tag is expected to contain a mandatory document name followed by optional sub-page name and section names separated by `//`
		//   - It is an special tag defined by us to create a tree structure of comments
		//   - Providing a `docs` tag with no values produces a document with no sub-pages and a single section, with the page name being the file name
		// 3. Build a tree of comments for each specified document
		//   - Every doc comment containing a `docs` tag is parsed and assigned to a document tree
		//   - There can be multiple documents with multiple sub-pages and multiple sections
		//   - Each section contains an array of comments
		//   - A tree structure is built with the document names as keys
		// 4. Generate markdown files for each document
		//   - Each document is traversed and markdown files are generated for each level with comments
		//   - These md files should be placed in the output directory
		//   - These md files should match what MkDocs expects for a documentation site
		//   - Titles and filenames should be written to a mkdocs.yml file
		// 5. Generate the mkdocs.yml file
		//   - The mkdocs.yml file should contain the titles and filenames of the generated markdown files
		//   - This file should be placed in the output directory
		//   - This file should be written in a way that MkDocs expects
		//   - Everything within the output directory should be deleted before writing the new files
		//   - The output directory is volatile and should be created if it doesn't exist
		// 5.1 Additional configuration should be provided in a mkdocs.yml file at the root of the project
		//   - If this file is present, contents should be merged with the generated file
		//   - This will allow the user to define additional configurations which we don't care about as they see fit
		// 6. Run MkDocs if possible
		//   - Either by a CLI argument or a configuration file, let the user decide if we need to also run MkDocs after generating the files
		//   - This means checking if MkDocs is installed
		//   - If it is, run the `mkdocs build` command
		//   - If it isn't, log an error message and exit

		// TODO: implement a configuration file for CLI options
		// With a config file defined, we also need to define priority for options
		// 1. CLI arguments have the highest priority
		//  - This means that if an option is defined in the CLI arguments, it should override the config file
		// 2. Config file has the second highest priority
		//  - This means that if an option is defined in the config file, it should override the default values
		// 3. Default values have the lowest priority

		// Comment parsing
		this.#loadFiles();
		if (this.#files.length === 0) {
			logError('No files to parse!');
			return;
		}

		this.#loadDocComments();
		if (this.#comments.length === 0) {
			logError('No comments with `docs` tags found!');
			return;
		}

		this.#loadDocTrees();
		if (Object.keys(this.#tree).length === 0) {
			logError('No comments with `docs` tags found!');
			return;
		}

		// Markdown generation
		this.#generate_markdown();
	}

	/**
	 * @desc Load the files to be parsed, matching the regex and ignoring the specified files / directories
	 * @returns {void}
	 * @private
	 */
	#loadFiles() {
		const {ignore, source, regex} = this.#args;

		// Get full list of ignore paths, normalizing them
		const ignores = ignore.map((i) => {
			const normalizedIgnore = path.normalize(path.resolve(process.cwd(), i));

			// .gitignore file?
			if (path.basename(normalizedIgnore) === '.gitignore') {
				return fs.readFileSync(normalizedIgnore, 'utf8')
					.split('\n')
					.filter((l) => l.trim() !== '' && !l.startsWith('#'))
					.map((l) => path.resolve(path.dirname(normalizedIgnore), l));
			}

			return normalizedIgnore;
		}).flat();

		// Get full list of source paths, normalizing them
		const sources = source.filter((s) => {
			// Normalize the source path for cross-platform consistency
			const normalizedSource = path.normalize(path.resolve(process.cwd(), s));

			return !ignore.some((i) => {
				const normalizedIgnore = path.normalize(path.resolve(process.cwd(), i));
				return normalizedSource.startsWith(normalizedIgnore);
			});
		});

		// Get all the source files, discarding any specified to be ignored
		this.#files = sources.map((s) => {
			const sourcePath = path.resolve(process.cwd(), s);

			// Check if the source path is a directory
			if (fs.statSync(sourcePath).isFile()) {
				return sourcePath;
			}

			// Get all the files in the source directory
			return fs.readdirSync(sourcePath, {withFileTypes: true, recursive: true}).map((fd) => {
				const filepath = path.resolve(fd.parentPath, fd.name);
				return path.normalize(filepath);
			});
		}).flat().filter((f) =>
			regex.test(f) &&
			fs.statSync(f).isFile() &&
			!ignores.some((i) => f.startsWith(i)));
	}

	/**
	 * @desc Loads all `docs` comments from the files
	 * @returns {void}
	 * @private
	 */
	#loadDocComments() {
		this.#comments = [];

		// Read each file and parse it with Dox
		this.#files.forEach((fp) => {
			const text = fs.readFileSync(fp, 'utf8');
			dox.parseComments(text).forEach((c) => {
				const [docsTag] = c.tags.filter((t) => t.type === CLI.DOC_TAG_NAME);
				if (!docsTag) return;

				// Assign the path to the comment
				c.commentPath = docsTag;
				this.#comments.push(c);
			});
		});
	}

	/**
	 * @desc Builds a tree of comments for each specified document
	 *
	 * Every doc comment containing a `docs` tag is parsed and assigned to a document tree.
	 * The `docs` tag is expected to contain a mandatory document name followed by optional
	 * sub-page name and section names separated by `//`.
	 *
	 * @example
	 * ```js
	 * @docs Document Name // Sub-Page Name // Section Name
	 * @docs Document Name // Section Name
	 * ```
	 *
	 * Would produce the following tree:
	 * @example
	 * ```json
	 * {
	 *  "Document Name": {
	 *    "Sub-Page Name": {
	 *      "Section Name": [comment1, comment2]
	 *     }
	 *     "Section Name": [comment3, comment4]
	 *   }
	 * }
	 * ```
	 *
	 * @returns {void}
	 * @private
	 */
	#loadDocTrees() {
		// Initialize the document tree
		// Use names as keys for quick access
		const tree = {};

		// Iterate over the comments
		this.#comments.forEach((c) => {
			const {commentPath} = c;
			const pathSegments = commentPath.string.split(/\s*\/\/\s*/u);
			const length = pathSegments.length - 1;

			pathSegments.reduce((acc, current, index) => {
				// Create node if necessary
				if (!acc[current]) acc[current] = index === length ? [] : {};

				// Is this a leaf node?
				if (index === length) {
					// Push the comment to the leaf node
					acc[current].push(c);
				}

				// Return the current node
				return acc[current];
			}, tree);
		});

		this.#tree = tree;
	}

	#generate_markdown() {

	}
}

export default ClI;

export default CLI;

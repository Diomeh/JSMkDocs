import fs from 'fs';
import path from 'path';

/**
 * @module FileLoader
 * @description A utility module for loading and processing file paths, including support for expanding
 * directories, handling `.gitignore` files, and filtering paths based on regular expressions and glob patterns.
 *
 * @requires fs
 * @requires path
 */

/**
 * Expands the `.gitignore` file contents by reading it, filtering out empty lines and comments,
 * and merging it with an existing list of ignored paths. The resulting list is sorted and duplicates are removed.
 *
 * @function
 * @param {Array<String>} ignores - The array of file paths or patterns to ignore, excluding `.gitignore`.
 * @returns {Array<String>} - The expanded and sorted list of ignored paths, including those from `.gitignore`.
 * @description This function reads the `.gitignore` file from the current working directory,
 * processes its contents, and merges it with the provided list of ignored paths.
 */
const expandGitIgnore = (ignores) => {
	// Remove .gitignore from the list
	ignores = ignores.filter((i) => i !== '.gitignore');

	// Read the .gitignore file
	const cwd = process.cwd();
	const gitignorePath = cwd + path.sep + '.gitignore';
	const gitignore = fs
		.readFileSync(gitignorePath, 'utf8')
		.split('\n')
		.filter((l) => l.trim() !== '' && !l.startsWith('#'))
		.map((l) => path.resolve(cwd, l));

	// Add the .gitignore files to the list
	// Order the list and remove duplicates
	return [...ignores, ...gitignore].sort().filter((i, idx) => self.indexOf(i) === idx);
};

/**
 * Normalizes an array of file or directory paths, resolving them to their absolute paths
 * based on the current working directory.
 *
 * @function
 * @param {Array<String>} arr - Array of relative or absolute paths to normalize.
 * @returns {Array<String>} - The array of normalized absolute paths.
 * @description This function takes an array of file or directory paths and returns them as absolute paths,
 * ensuring they are normalized and relative to the current working directory.
 */
const normalizePaths = (arr) => {
	const cwd = process.cwd();
	return arr.map((i) => path.normalize(path.resolve(cwd, i)));
};

/**
 * Recursively expands directories by traversing them and collecting all file paths.
 *
 * @function
 * @param {Array<String>} arr - Array of file or directory paths to expand.
 * @returns {Array<String>} - The array of all expanded file paths, including files in subdirectories.
 * @description This function processes a list of file and directory paths, and recursively collects all file paths
 * from directories by traversing into subdirectories.
 */
const expandDirectories = (arr) => {
	const expanded = [];

	arr.forEach((i) => {
		if (fs.statSync(i).isDirectory()) {
			const files = fs.readdirSync(i).map((f) => path.join(i, f));
			expanded.push(...expandDirectories(files));
		} else {
			expanded.push(i);
		}
	});

	return expanded;
};

/**
 * Loads and filters file paths from given sources, excluding paths that match the ignored patterns,
 * or do not match a given regex or glob pattern.
 *
 * @function
 * @param {Array<String>} sources - Array of source file or directory paths to load.
 * @param {Array<String>} ignores - Array of file paths or patterns to ignore.
 * @param {RegExp} regexp - Regular expression to filter out matching files.
 * @param {Object} glob - Glob object used to match file patterns.
 * @returns {Array<String>} - Array of file paths that are not ignored and match the provided patterns.
 * @description This function loads file paths from specified sources, removes ignored paths (including those from
 * `.gitignore` if specified), and applies filters using regular expressions and glob patterns.
 */
const loadPaths = (sources, ignores, regexp, glob) => {
	if (ignores.includes('.gitignore')) ignores = expandGitIgnore(ignores);

	ignores = normalizePaths(ignores);
	sources = normalizePaths(sources);
	sources = expandDirectories(sources);

	// Filter out ignored files and not matching files from regex and glob
	return sources.filter((f) => !(ignores.includes(f) || regexp.test(f) || !glob.match(f)));
};

export default loadPaths;

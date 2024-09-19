import fs from 'fs';
import path from 'path';

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

const normalizePaths = (arr) => {
	const cwd = process.cwd();
	return arr.map((i) => path.normalize(path.resolve(cwd, i)));
};

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

const loadPaths = (sources, ignores, regexp, glob) => {
	if (ignores.includes('.gitignore')) ignores = expandGitIgnore(ignores);

	ignores = normalizePaths(ignores);
	sources = normalizePaths(sources);
	sources = expandDirectories(sources);

	// Filter out ignored files and not matching files from regex and glob
	return sources.filter((f) => !(ignores.includes(f) || regexp.test(f) || !glob.match(f)));
};

export default loadPaths;

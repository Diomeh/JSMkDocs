// noinspection JSUnresolvedReference

/**
 * Traverses each 'docsTree' object and writing markdown pages for
 * each level with comments as well as writing titles and filenames
 * to a mkdocs.yml file.
 */

import * as options from './options';
import { logError, logInfo, logSuccess } from './logger.mjs';

import clic from 'cli-color';
import fs from 'fs';
import { getMarkdownString } from './markdown';
import path from 'path';

const newLine = (string, indent = 0) => {
	let newString = string;

	for (let i = 0; i < indent; i++) {
		newString = `    ${newString}`;
	}

	return `\n${newString}`;
};

const formatFilename = (pageName) => pageName.toLowerCase().replace(/\s+/gu, '-');

const writeMdFile = (text, filePath, resolve, reject) => {
	fs.writeFile(filePath, text, 'utf8', (error) => {
		if (error) {
			logError(error);
			reject(error);
		} else {
			logInfo(filePath);
			resolve(filePath);
		}
	});
};

const writePages = (docsTree, writePath, promises, stream, indent = 0) => {
	stream.write(newLine(`- '${docsTree.pageName}':`, indent));

	if (docsTree.subPages) {
		const dirName = formatFilename(docsTree.pageName);
		const subDirPath = path.join(writePath, dirName);

		docsTree.subPages.forEach((sp) => writePages(sp, subDirPath, promises, stream, indent + 1));
	} else {
		const fileName = `${formatFilename(docsTree.pageName)}.md`;
		const filePath = path.join(writePath, fileName);

		const writePromise = new Promise((resolve, reject) => {
			const text = getMarkdownString(docsTree);

			fs.mkdir(writePath, { recursive: true }, (err, _) => {
				if (err) {
					logError(err);
					return;
				}

				writeMdFile(text, filePath, resolve, reject);
			});
		});

		promises.push(writePromise);

		let relWritePath = writePath.replace(/^.*docs[/\\]?(.*)$/u, '$1');
		relWritePath = path.join(relWritePath, fileName).replace(/\\/gu, '/');
		stream.write(` '${relWritePath}'`);
	}
};

const writeMkdocs = (docsTree, markdownPath, stream) => {
	const indexPath = path.join(markdownPath, 'index.md');
	const indexPromise = new Promise((resolve, reject) => {
		writeMdFile(`# ${docsTree.docsName}`, indexPath, resolve, reject);
	});
	stream.write(newLine("- Home: 'index.md'"));

	const promises = [indexPromise];

	docsTree.subPages.forEach((sp) => writePages(sp, markdownPath, promises, stream));

	return Promise.all(promises);
};

export const generateDocs = (docsTrees) => {
	const outputDir = options.get('out');
	const outputPath = path.resolve(process.cwd(), outputDir);

	docsTrees.forEach((dt) => {
		const { docsName } = dt;
		const docsPath = path.join(outputPath, docsName);
		const markdownPath = path.join(docsPath, './docs');
		const mkdocsYmlPath = path.join(docsPath, './mkdocs.yml');
		const success = clic.green(`"${docsName}" docs write complete`);
		const fail = clic.red(`"${docsName}" docs write failed`);

		fs.rm(path.join(outputDir, docsName), { force: true, recursive: true }, () => {
			fs.mkdir(markdownPath, { recursive: true }, (err, _) => {
				if (err) {
					logError(err);
					return;
				}

				const stream = fs.createWriteStream(mkdocsYmlPath, 'utf8');
				stream.write(`site_name: ${docsName}`);
				stream.write(newLine('pages:'));

				writeMkdocs(dt, markdownPath, stream).then(
					(_filePaths) => {
						stream.end();
						logSuccess(success);
					},
					(error) => {
						stream.end();
						logError(fail);
						logError(error);
					}
				);
			});
		});
	});
};

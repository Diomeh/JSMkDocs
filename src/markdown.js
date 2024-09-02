/**
 * Iterates over all comment objects for a level of a 'docsTree'
 * object and pieces together a markdown string. Returns all strings
 * concatenated representing a full markdown page.
 */

const typeRgx = /\{([a-zA-Z[\]]+)\}/u.source;
const nameRgx = /([a-zA-Z0-9-.[\]]+)(?:\s+-)?/u.source;
const descRgx = /([^-].+)/u.source;

// Match valid param and returns strings as output by dox
const descTagRgx = new RegExp(`^${nameRgx}\\s+${descRgx}$`, "u");
const paramTagRgx = new RegExp(`^${typeRgx}\\s+${nameRgx}\\s+${descRgx}$`, "u");
const returnsTagRgx = new RegExp(`^${typeRgx}\\s+${descRgx}$`, "u");

const getTagByType = (tags, type) => tags.filter((t) => t.type === type)[0]

const getCommentNameAndDesc = (comment) => {
	const descTag = getTagByType(comment.tags, 'desc');
	const match = descTag.string.match(descTagRgx);
	return `### ${match[1]}\n${match[2]}\n<br><br>\n`;
}

const getCommentTableHead = (heading) => `#### ${heading}\nName | Type | Description\n--- | --- | ---\n`

const getCommentTableRows = (comment, tagType) => {
	const tags = comment.tags.filter((t) => t.type === tagType);

	if (tags.length === 0) {
		return null;
	}

	const rows = tags.map((t) => {
		const match = t.string.match(paramTagRgx);

		// Skip if tag is badly formatted
		if (match === null) {
			return '';
		}

		return `${match[2]} | \`${match[1]}\` | ${match[3]}\n`;
	});

	return `${rows.join('')}\n`;
}

const getCommentReturns = (comment) => {
	const returnsTag = getTagByType(comment.tags, 'returns');

	// Skip if no returns tag
	if (!returnsTag) {
		return '';
	}

	const match = returnsTag.string.match(returnsTagRgx);

	// Skip if tag is badly formatted
	if (match === null) {
		return '';
	}

	return `#### Returns\n\`${match[1]}\` ${match[2]}\n<br><br>\n`;
}

// const getCommentCode  = (comment) => {
// 	return `#### Code\n\`\`\`javascript\n${comment.code}\n\`\`\`\n<br><br>\n`;
// }

const getCommentString = (comment) => {
	let markdownString = getCommentNameAndDesc(comment);

	const paramsRows = getCommentTableRows(comment, 'param');

	if (paramsRows) {
		markdownString += getCommentTableHead('Params');
		markdownString += paramsRows;
	}

	const dataRows = getCommentTableRows(comment, 'data');

	if (dataRows) {
		markdownString += getCommentTableHead('Data');
		markdownString += dataRows;
	}

	return (markdownString += getCommentReturns(comment));
}

export const getMarkdownString = (docsTree) => {
	let markdownString = '';

	Object.keys(docsTree.sections).forEach((s) => {
		markdownString += `## ${s}\n\n`;

		docsTree.sections[s].forEach((c) => (markdownString += getCommentString(c)));
	});

	return markdownString;
}

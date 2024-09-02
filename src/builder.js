/**
 * Iterates through a comments array and returns an array with a
 * 'docsTree' objects for each specified document. Each 'docsTree'
 * object represents the structure of the document in a convenient
 * form for traversing.
 */

const parsePathNames = (comment) => {
	const doxdownTag = comment.tags.filter((t) => t.type === 'docs')[0];
	return doxdownTag.string.split(/\s*\/{2}\s*/u);
}

const getPage = (docsTree, pageName) => {
	if (!docsTree.subPages) {
		docsTree.subPages = [];
	}

	let page = docsTree.subPages.filter((p) => p.pageName === pageName)[0];

	if (!page) {
		page = { pageName };
		docsTree.subPages.push(page);
	}

	return page;
}

const buildPages = (docsTree, pathNames, comment) => {
	if (pathNames.length > 1) {
		const page = getPage(docsTree, pathNames[0]);
		buildPages(page, pathNames.slice(1), comment);
	} else {
		const section = pathNames[0];

		if (!docsTree.sections) {
			docsTree.sections = {};
		}

		if (!docsTree.sections[section]) {
			docsTree.sections[section] = [];
		}

		docsTree.sections[section].push(comment);
	}
}

const assignCommentsToDocsTrees = (comments) => {
	const docsTrees = [];

	comments.forEach((c) => {
		const docsName = parsePathNames(c)[0];

		let docsTree = docsTrees.filter((dt) => dt.docsName === docsName)[0];

		if (!docsTree) {
			docsTree = { docsName, comments: [] };
			docsTrees.push(docsTree);
		}

		docsTree.comments.push(c);
	});

	return docsTrees;
}

export const getDocsTrees = (comments) => {
	const docsTrees = assignCommentsToDocsTrees(comments);

	docsTrees.forEach((dt) => {
		dt.comments.forEach((c) => {
			buildPages(dt, parsePathNames(c).slice(1), c);
		});
	});

	return docsTrees;
}

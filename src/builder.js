/**
 * Iterates through a comments array and returns an array with a
 * 'docsTree' objects for each specified document. Each 'docsTree'
 * object represents the structure of the document in a convenient
 * form for traversing.
 */

const parsePathNames = (comment) => {
	const [docTag] = comment.tags.filter((t) => t.type === 'docs');
	return docTag.string.split(/\s*\/{2}\s*/u);
};

const getPage = (docsTree, pageName) => {
	if (!docsTree.subPages) {
		docsTree.subPages = [];
	}

	let [page] = docsTree.subPages.filter((p) => p.pageName === pageName);

	if (!page) {
		page = { pageName };
		docsTree.subPages.push(page);
	}

	return page;
};

const buildPages = (docsTree, pathNames, comment) => {
	if (pathNames.length > 1) {
		const page = getPage(docsTree, pathNames[0]);
		buildPages(page, pathNames.slice(1), comment);
	} else {
		const [section] = pathNames;

		if (!docsTree.sections) {
			docsTree.sections = {};
		}

		if (!docsTree.sections[section]) {
			docsTree.sections[section] = [];
		}

		docsTree.sections[section].push(comment);
	}
};

const assignCommentsToDocsTrees = (comments) => {
	const docsTrees = [];

	comments.forEach((c) => {
		const [docsName] = parsePathNames(c);

		let [docsTree] = docsTrees.filter((dt) => dt.docsName === docsName);

		if (!docsTree) {
			docsTree = { docsName, comments: [] };
			docsTrees.push(docsTree);
		}

		docsTree.comments.push(c);
	});

	return docsTrees;
};

export const getDocsTrees = (comments) => {
	const docsTrees = assignCommentsToDocsTrees(comments);

	docsTrees.forEach((dt) => {
		dt.comments.forEach((c) => {
			buildPages(dt, parsePathNames(c).slice(1), c);
		});
	});

	return docsTrees;
};

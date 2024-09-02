#! /usr/bin/env node

import * as options from './options';
import { generateDocs } from './writer';
import { getDocsTrees } from './builder';
import { getDoxdownComments } from './parser';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

// Set options but skip the unnamed arguments property
Object.keys(argv)
	.slice(1)
	.forEach((k) => options.set(k, argv[k]));

const comments = getDoxdownComments();
const docsTrees = getDocsTrees(comments);

generateDocs(docsTrees);

#! /usr/bin/env node

import * as options from './options';
import { generateDocs } from './writer';
import { getDocsTrees } from './builder';
import { getJsMkDocsComments } from './parser';
import minimist from 'minimist';

const totalArgs = 2;

const argv = minimist(process.argv.slice(totalArgs));

// Set options but skip the unnamed arguments property
Object.keys(argv)
	.slice(1)
	.forEach((k) => options.set(k, argv[k]));

const comments = getJsMkDocsComments();
const docsTrees = getDocsTrees(comments);

generateDocs(docsTrees);

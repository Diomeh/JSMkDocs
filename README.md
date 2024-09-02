# JsMkDocs

This is a fork of [doxdown](https://github.com/Degree53/doxdown)

# Beware!

As of now, this is a work in progress and no stable release has been made

***

***JsMkDocs*** is a [jsDoc](https://jsdoc.app/) to [MkDocs](http://www.mkdocs.org/) markdown generator. 
It allows you to control your documentation on a comment by comment basis, choosing the page and document the comment belongs to. 
This is especially useful when you need to document an API separate to the rest of your codebase.

Running it on a directory with the default options will parse all nested JavaScript files and output a `./docs_src` folder. 
Inside will be a folder for each document with Markdown files and a `mkdocs.yml` file in the format expected by [MkDocs](http://www.mkdocs.org/). 
You can then run [MkDocs](http://www.mkdocs.org/) on any of those folders to build a site that you can deploy to a server.

## Installation

The easiest way to get ***JsMkDocs*** is with NPM: `npm install --save-dev jsmkdocs`

## Usage / Options

Use the command `jsmkdocs` with the following options to generate your docs:

| Name   | Alias | Default             | Description                                             |
|--------|:-----:|---------------------|---------------------------------------------------------|
| ignore |   i   | `.git,node_modules` | comma-separated list of files/directories to ignore     |
| out    |   o   | `./docs_src`        | relative path to the output directory                   |
| regex  |   r   | `\.js$`             | regex string for matching files in the source directory |
| src    |   s   | `./`                | relative path to the source directory                   |

## Comment Format

***JsMkDocs*** looks for jsDoc-style comments with a special `@docs` tag in the format `document [// page] // section` which describes where the comment belongs in which document. 
Use a jsDoc `@desc` to describe the function or event in the format `@name - description`. 
You can have any number of `@params` or `@data` tags and one `@returns` tag.

```javascript
/**
 * @docs Some Docs // Users & Accounts // User Helpers
 * @desc getUsernames - A description of getUsernames
 * @param {Object[]} users - An array of user objects
 * @param {String} users[].name - A user's name
 * @param {Number} limit - The max number to return
 * @returns {String[]} An array of usernames
 */

function getUsernames (users, limit) {
	
	const usernames = [];
	
	for (let i = 0; i < limit; i++) {
		usernames.push(users[i].name);
	}
	
	return usernames;
}

/**
 * @docs Tracking // Registration
 * @desc registration-complete - Fires when a user successfully completes registration.
 * @data {String} forename - The user's forename
 * @data {String} surname - The user's surname
 * @data {Date} dob - The user's date of birth
 * @data {Object} address - An object containing details of a user's address
 * @data {String} address.house - The house name/no. of the user's address
 * @data {String} address.postcode - The postcode of the user's address
 */

SomeTrackingAPI.trigger('registration-complete', {
	forename: "Sherlock",
	surname: "Holmes",
	dob: dateOfBirth,
	address: {
		house: "221B",
		postcode: "NW16XE"
	}
});

```

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Diomeh/concurrent_callback_queue/blob/master/LICENSE) file for details.

## Author

[David Urbina](https://github.com/Diomeh)

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue if you have any suggestions or feedback.

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md)
and the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/).

### Commit Message Format

From the Conventional Commits Specification [Summary](https://www.conventionalcommits.org/en/v1.0.0/#summary):

The commit message should be structured as follows:

```plaintext
{type}[optional scope]: {description}

[optional body]

[optional footer(s)]
```

Where `type` is one of the following:

| Type              | Description                                                                                             | Example Commit Message                            |
|-------------------|---------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| `fix`             | Patches a bug in your codebase (correlates with PATCH in Semantic Versioning)                           | `fix: correct typo in README`                     |
| `feat`            | Introduces a new feature to the codebase (correlates with MINOR in Semantic Versioning)                 | `feat: add new user login functionality`          |
| `BREAKING CHANGE` | Introduces a breaking API change (correlates with MAJOR in Semantic Versioning)                         | `feat!: drop support for Node 8`                  |
| `build`           | Changes that affect the build system or external dependencies                                           | `build: update dependency version`                |
| `chore`           | Other changes that don't modify src or test files                                                       | `chore: update package.json scripts`              |
| `ci`              | Changes to CI configuration files and scripts                                                           | `ci: add CircleCI config`                         |
| `docs`            | Documentation only changes                                                                              | `docs: update API documentation`                  |
| `style`           | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.) | `style: fix linting errors`                       |
| `refactor`        | Code change that neither fixes a bug nor adds a feature                                                 | `refactor: rename variable for clarity`           |
| `perf`            | Code change that improves performance                                                                   | `perf: reduce size of image files`                |
| `test`            | Adding missing tests or correcting existing tests                                                       | `test: add unit tests for new feature`            |
| Custom Types      | Any other type defined by the project for its specific needs                                            | `security: address vulnerability in dependencies` |

For more information, refer to the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/).

## TODO
- Replace `regex` option with glob pattern for matching files and directories.

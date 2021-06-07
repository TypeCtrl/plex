# @ctrl/plex

[![npm](https://badgen.net/npm/v/@ctrl/plex)](https://www.npmjs.com/package/@ctrl/plex)
[![CircleCI](https://badgen.net/circleci/github/scttcper/plex)](https://circleci.com/gh/scttcper/plex)
[![coverage](https://badgen.net/codecov/c/github/scttcper/plex)](https://codecov.io/gh/scttcper/plex)

> A TypeScript [Plex](https://www.plex.tv/) API client based on [pkkid/python-plexapi](https://github.com/pkkid/python-plexapi)

### Install

```
npm install @ctrl/plex
```

### Docs

https://ctrl-plex.vercel.app 

### Use

Create a plex connection
```ts
import { MyPlexAccount } from '@ctrl/plex';

const account = await new MyPlexAccount('http://localhost:32400', 'username', 'password').connect();
const resource = await account.resource('<SERVERNAME>');
const plex = await resource.connect();
const library = await plex.library();
```

###### Example 1: List all unwatched movies.
```ts
import { MovieSection } from '@ctrl/plex';

// Pass MovieSection generic because the section title doesn't imply a section type.
const section = await library.section<MovieSection>('Movies');
// Get an array of Movie objects
const results = await section.search({ unwatched: true });
```

###### Example 2: Search for a list of movies containing a title
```ts
const library = await plex.library();
const section = await library.section<MovieSection>('Movies');
const results = await section.search({ title: 'Rush Hour' });
```

###### Example 3: List all content containing a specific query
```ts
const results = await plex.search('Arnold');
// Each hub represents a single Hub (or category) in the PlexServer search (movie, actor, etc)
for (const hub of results) {
  // Log first result in each category
  console.log(hub?.Metadata?.[0]);
}
```

###### Example 4: List all episodes of a tv show.
```ts
import { ShowSection } from '@ctrl/plex';

// Pass ShowSection generic because the section title doesn't imply a section type.
const section = await library.section<ShowSection>('TV Shows');
// Get an array of Show objects
const results = await section.search({ title: 'Silicon Valley' });
const episodes = await results[0].episodes();
```

### Differences from python plex client
JS is a different language and some methods of the api were not possible. 
Chaining functions with requests must be awaited mostly individually. Constructors in JS don't typically make requests
and accessing properties normally cannot make requests either.

### Testing

Tests are run against a real instance of plex.

Start docker container [scttcper/plex-with-media](https://hub.docker.com/r/scttcper/plex-with-media)

Setup test environment variables, create a plex account just for testing. Using a real account will break everything

```sh
export PLEX_USERNAME=email
export PLEX_PASSWORD=password
```

Claim server and setup test content (once)

```sh
npm run claim-server && npm run add-media
```

Run tests

```sh
npm test
```

Post testing, remove plex server from account. Warning this is destructive. Do not use this on a real plex account.

```sh
npm run test-cleanup
```

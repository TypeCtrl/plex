import { beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import { Movie, MovieSection, PlexServer, Show, ShowSection } from '../src';

import { createClient } from './test-client';

describe('Movies', () => {
  let plex: PlexServer;
  let section: MovieSection;
  /** Big buck bunny */
  let movie: Movie;
  beforeAll(async () => {
    plex = await createClient();
    const library = await plex.library();
    section = await library.section<MovieSection>('Movies');
  });

  beforeEach(async () => {
    const results = await section.search({ title: 'Bunny' });
    movie = results[0];
  });

  // Takes forever
  it.skip('should analyze movie', async () => {
    await movie.analyze();
  });

  it('should reutrn roles as actors', () => {
    expect(movie.actors).toEqual(movie.roles);
  });

  it('should get movie locations', async () => {
    expect(await movie.locations()).toEqual(['/data/movies/Big Buck Bunny (2008).mp4']);
  });

  it('should add and remove movie from collection', async () => {
    await movie.addCollection(['Test']);
    expect(movie.collections.length).toBe(1);
    expect(movie.collections[0].tag).toBe('Test');
    const collections = await section.collections({ title: 'Test' });
    expect(collections.length).toBe(1);
    const myCollection = collections[0];
    expect(myCollection.title.toLowerCase()).toBe('test');
    expect(myCollection.childCount).toBe(1);
    const movies = await collections[0].items();
    expect(movies[0].title).toBe(movie.title);
    await movie.removeCollection(['Test']);
    expect(movie.collections.length).toBe(0);
    await myCollection.reload();
    expect(myCollection.childCount).toBe(0);
  });

  it('should get movie matches', async () => {
    const matches = await movie.matches();
    expect(matches[0].year).toBe(movie.year);
    expect(matches[0].name).toBe(movie.title);
  });
});

describe('Shows', () => {
  let plex: PlexServer;
  /** Silicon Valley */
  let show: Show;
  let showSection: ShowSection;
  beforeAll(async () => {
    plex = await createClient();
    const library = await plex.library();
    showSection = await library.section<ShowSection>('TV Shows');
  });
  beforeEach(async () => {
    const results = await showSection.search({ title: 'Silicon Valley' });
    show = results[0];
  });

  it("should get a shows's episodes", async () => {
    const episodes = await show.episodes();
    // 2 seasons of Silicon Valley
    expect(episodes.length).toBe(18);
  });

  it("should get a season's episodes", async () => {
    const seasons = await show.seasons();
    const episodes = await seasons[0].episodes();
    // Season 1 of Silicon Valley
    expect(episodes.length).toBe(8);
  });

  it("should get an episode's full data", async () => {
    const [season] = await show.seasons();
    const [episode] = await season.episodes();
    expect(episode.isFullObject).toBeFalsy();
    await episode.reload();
    expect(episode.isFullObject).toBeTruthy();
  });

  it("should get a episode's season and show", async () => {
    const seasons = await show.seasons();
    const episodes = await seasons[0].episodes();
    const [episode] = episodes;
    // Season 1 of Silicon Valley
    expect((await episode.season()).key).toBe(seasons[0].key);
    expect((await episode.show()).key).toBe(show.key);
    expect(episode.isWatched).toBe(false);
  });

  it('should edit an episode title', async () => {
    const seasons = await show.seasons();
    const episodes = await seasons[0].episodes();
    const [episode] = episodes;
    const originalTitle = `${episode.title}`;
    await episode.edit({ 'title.value': 'hello' });
    await episode.reload();
    expect(episode.title).toBe('hello');
    await episode.edit({ 'title.value': originalTitle });
  });

  it('should edit a show title', async () => {
    const originalTitle = `${show.title}`;
    await show.edit({ 'title.value': 'hello' });
    await show.reload();
    expect(show.ratingKey).toBeDefined();
    expect(show.title).toBe('hello');
    await show.edit({ 'title.value': originalTitle });
  });

  // Markers don't seem to be available from json? Or in the test env
  it('should determine if an episode has makers', async () => {
    const seasons = await show.seasons();
    const episodes = await seasons[0].episodes();
    const [episode] = episodes;
    expect(await episode.hasIntroMarker()).toBe(false);
  });

  it('should load all episode extra data', async () => {
    const episodes = await show.episodes();
    const [episode] = episodes;
    await episode.reload();
    // expect(episode.writers.length).toBeGreaterThan(0);
    expect(episode.grandparentTitle).toContain('Silicon Valley');
    expect(await episode.seasonNumber()).toBe(1);
  });

  it('should get show locations', async () => {
    const episodes = await show.episodes();
    const [episode] = episodes;
    expect(episode.locations()).toEqual(['/data/shows/Silicon Valley/S01E01.mp4']);
  });

  it('should get show hubs', async () => {
    const hubs = await showSection.hubs();
    expect(hubs.length).toBeDefined();
    expect(hubs[0].type).toBe('episode');
  });

  it('should get show folders', async () => {
    const folders = await showSection.folders();
    expect(folders.length).toBe(2);
    expect(folders[0].title).toBeDefined();
  });

  it('should search shows', async () => {
    const shows = await showSection.search({ title: 'Silicon Valley' });
    expect(shows[0].title).toContain('Silicon Valley');
  });
});

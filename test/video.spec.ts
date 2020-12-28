import { describe, it, beforeAll, expect } from '@jest/globals';

import { PlexServer, ShowSection } from '../src';
import { Show } from '../src/video';
import { createClient } from './test-client';

describe('Show', () => {
  let plex: PlexServer;
  /** Game of thrones */
  let show: Show;
  beforeAll(async () => {
    plex = await createClient();
    const library = await plex.library();
    const section = await library.section<ShowSection>('TV Shows');
    const results = await section.search({ title: 'Game of Thrones' });
    show = results[0];
  });

  it('should get show details', async () => {
    const library = await plex.library();
    const section = await library.section<ShowSection>('TV Shows');
    const results = await section.search({ title: 'Game of Thrones' });
    const show = results[0];
    await show.reload();
    expect(show.key).toBe(show._details_key);
    // console.log(show.genres);
    // // const seasons = await show.seasons({ index: 2 });
    // // console.log(seasons);
  });

  it("should get a shows's episodes", async () => {
    const episodes = await show.episodes();
    // 2 seasons of GoT
    expect(episodes.length).toBe(20);
  });

  it("should get a season's episodes", async () => {
    const seasons = await show.seasons();
    const episodes = await seasons[0].episodes();
    // Season 1 of GoT
    expect(episodes.length).toBe(10);
  });

  it("should get an episode's full data", async () => {
    const [season] = await show.seasons();
    const [episode] = await season.episodes();
    await episode.reload();
  });

  it("should get a episode's season and show", async () => {
    const seasons = await show.seasons();
    const episodes = await seasons[0].episodes();
    const [episode] = episodes;
    // Season 1 of GoT
    expect((await episode.season()).key).toBe(seasons[0].key);
    expect((await episode.show()).key).toBe(show.key);
  });

  // Markers don't seem to be available from json? Or in the test env
  // it.skip('should determine if an episode has makers', async () => {
  //   const seasons = await show.seasons();
  //   const episodes = await seasons[0].episodes();
  //   const [episode] = episodes;
  //   // @ts-expect-error
  //   expect(await episode.hasIntroMarker()).toBe(true);
  // });

  it('should load all episode extra data', async () => {
    const episodes = await show.episodes();
    const [episode] = episodes;
    expect(episode.writers.length).toBe(2);
    expect(episode.grandparentTitle).toBe('Game of Thrones');
    expect(await episode.seasonNumber()).toBe(1);
  });

  it('should get show locations', async () => {
    const episodes = await show.episodes();
    const [episode] = episodes;
    expect(episode.locations()).toEqual(['/data/shows/Game of Thrones/S01E01.mp4']);
  });
});

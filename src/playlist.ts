import { URLSearchParams } from 'url';

import { Playable } from './base/playable';
import { fetchItems } from './baseFunctionality';
import { Episode, Movie } from './video';

/**
 * Map media types to their respective class
 */
function contentClass(data: any) {
  switch (data.type) {
    case 'episode':
      return Episode;
    case 'movie':
      return Movie;
    default:
      throw new Error('Media type not implemented');
  }
}

type PlaylistContent = Episode | Movie;

export class Playlist extends Playable {
  static TAG = 'Playlist';
  TYPE = 'playlist';

  addedAt!: Date;
  updatedAt!: Date;
  allowSync!: string;
  composite!: string;
  duration!: string;
  durationInSeconds!: string;
  guid!: string;
  leafCount!: string;
  playlistType!: string;
  smart!: string;
  summary!: string;
  /** Cache of playlist items */
  private _items: Array<Episode | Movie> | null = null;

  /**
   * @returns the item in the playlist that matches the specified title.
   */
  async item(title: string): Promise<PlaylistContent | null> {
    const items = await this.items();
    for (const item of items) {
      if (item.title.toLowerCase() === title.toLowerCase()) {
        return item;
      }
    }

    return null;
  }

  async items() {
    if (this._items === null) {
      const key = `/playlists/${this.ratingKey!}/items`;
      const items = await fetchItems(this.server, key);
      this._items = items.map(data => {
        const Cls = contentClass(data);
        return new Cls(this.server, data, key, this);
      });
    }

    return this._items;
  }

  /** Add items to a playlist. */
  async addItems(items: PlaylistContent[]) {
    const ratingKeys = items.map(x => x.ratingKey);
    const params = new URLSearchParams({
      uri: `server://${
        this.server.key
      }/com.plexapp.plugins.library/library/metadata/${ratingKeys.join(',')}`,
    });
    const key = `${this.key}?${params.toString()}`;
    const result = await this.server.query(key, 'put');
    await this.reload();
    return result;
  }

  /** Remove an item from a playlist. */
  async removeItem(item: PlaylistContent) {
    if (!item.playlistItemID) {
      throw new Error('Missing playlistItemID');
    }

    const key = `${this.key}/items/${item.playlistItemID}`;
    const result = await this.server.query(key, 'delete');
    await this.reload();
    return result;
  }

  protected _loadData(data: any) {
    this.key = data.key;
    this.ratingKey = data.ratingKey;
    this.title = data.title;
    this.type = data.type;

    this.addedAt = new Date(data.addedAt);
    this.updatedAt = new Date(data.updatedAt);
    this.allowSync = data.allowSync;
    this.composite = data.composite;
    this.duration = data.duration;
    this.durationInSeconds = data.durationInSeconds;
    this.guid = data.guid;
    this.leafCount = data.leafCount;
    this.playlistType = data.playlistType;
    this.smart = data.smart;
    this.summary = data.summary;
  }

  protected _loadFullData(data: any) {
    this._loadData(data);
  }
}

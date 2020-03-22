import os from 'os';
import { default as getmac } from 'getmac';
import macaddr from 'macaddr';

// TODO: Load User Defined Config
// const DEFAULT_CONFIG_PATH = os.path.expanduser('~/.config/plexapi/config.ini');
// const CONFIG_PATH = os.environ.get('PLEXAPI_CONFIG_PATH', DEFAULT_CONFIG_PATH);
// const CONFIG = PlexConfig(CONFIG_PATH);

// PlexAPI Settings
export const PROJECT = 'PlexAPI' as const;
export const VERSION = '3.3.0' as const;
export const TIMEOUT = 30000 as const;
export const X_PLEX_CONTAINER_SIZE = 100 as const;
export const X_PLEX_ENABLE_FAST_CONNECT = false as const;

// Plex Header Configuation
export const X_PLEX_PROVIDES = 'controller';
export const X_PLEX_PLATFORM = os.type();
export const X_PLEX_PLATFORM_VERSION = os.release();
export const X_PLEX_PRODUCT = PROJECT;
export const X_PLEX_VERSION = VERSION;
export const X_PLEX_DEVICE = X_PLEX_PLATFORM;
export const X_PLEX_DEVICE_NAME = os.hostname();
const mac = getmac();
const base16Mac: string = macaddr
  .parse(mac)
  .toLong()
  .toString(16);
export const X_PLEX_IDENTIFIER = `0x${base16Mac}`;
export const BASE_HEADERS = {
  'X-Plex-Platform': X_PLEX_PLATFORM,
  'X-Plex-Platform-Version': X_PLEX_PLATFORM_VERSION,
  'X-Plex-Provides': X_PLEX_PROVIDES,
  'X-Plex-Product': X_PLEX_PRODUCT,
  'X-Plex-Version': X_PLEX_VERSION,
  'X-Plex-Device': X_PLEX_DEVICE,
  'X-Plex-Device-Name': X_PLEX_DEVICE_NAME,
  'X-Plex-Client-Identifier': X_PLEX_IDENTIFIER,
  'X-Plex-Sync-Version': '2',
} as const;
import { Manifest } from './types';

/**
 * Get the platforms from a loaded manifest.
 * This will fallback to the default from Expo itself.
 */
export function getPlatforms(manifest: Manifest) {
	return manifest.platforms || ['android', 'ios'];
}

/**
 * Get the platform settings for Android, if available.
 */
export function getAndroidPlatform(manifest: Manifest) {
	return manifest.android || { versionCode: 0 };
}

/**
 * Get the platform settings for iOS, if available.
 */
export function getIosPlatform(manifest: Manifest) {
	return manifest.ios || { buildNumber: '' };
}

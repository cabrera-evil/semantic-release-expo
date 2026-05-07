import { getPlatforms } from '../platforms';
import { VersionBumper } from '../types';
import bumpAndroid from './platform-android';
import bumpIos from './platform-ios';
import bumpVersion from './version';

const PLATFORM_BUMPERS: Partial<Record<string, VersionBumper>> = {
	android: bumpAndroid,
	ios: bumpIos,
};

/**
 * Update all versions from the manifest and return an updated version.
 * This will check if the manifest supports android and/or ios before applying.
 */
const bumpVersions: VersionBumper = (meta, config, context) => {
	const platforms = getPlatforms(meta.manifest);
	let newManifest = bumpVersion(meta, config, context);

	for (const platform of platforms) {
		const bumper = PLATFORM_BUMPERS[platform];
		if (bumper) {
			newManifest = bumper({ ...meta, manifest: newManifest }, config, context);
		}
	}

	return newManifest;
};

export default bumpVersions;

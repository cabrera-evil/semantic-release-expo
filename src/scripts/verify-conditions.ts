import SemanticReleaseError from '@semantic-release/error';
import { getManifestFiles, inheritPrepareConfig } from '../config';
import { logManifestFromError, readManifests } from '../expo';
import { SemanticMethod } from '../types';

/**
 * Verify the configuration of this plugin.
 * This checks if all Expo manifests are readable.
 */
const verifyConditions: SemanticMethod = async (config, context) => {
	const verifyConfig = inheritPrepareConfig(config, context);

	try {
		(await readManifests(getManifestFiles(verifyConfig))).forEach((meta) => {
			context.logger.log(
				'Found %s manifest for %s in %s',
				'Expo',
				meta.manifest.name,
				meta.filename
			);
		});
	} catch (error: unknown) {
		logManifestFromError(context, error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		throw new SemanticReleaseError(
			'Could not load Expo manifest(s).',
			'EINVALIDEXPOMANIFEST',
			errorMessage
		);
	}
};

export default verifyConditions;

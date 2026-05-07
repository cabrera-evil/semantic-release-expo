jest.mock('../../src/expo', () => ({
	readManifests: jest.fn(),
	writeManifest: jest.fn(),
	MANIFEST_FILE: 'app.json',
}));
jest.mock('../../src/version-bumpers', () => jest.fn());

import { readManifests, writeManifest } from '../../src/expo';
import prepare from '../../src/scripts/prepare';
import bumpVersions from '../../src/version-bumpers';
import { createConfig, createContext, createManifestMeta } from '../factory';

describe('scripts/prepare', () => {
	it('reads and writes manifests with new version bumped', async () => {
		const config = createConfig();
		const context = createContext({
			last: {
				gitHead: 'abc123',
				gitTag: 'v0.2.0',
				version: '0.2.0',
			},
			next: {
				gitHead: 'abc234',
				gitTag: 'v0.2.1',
				notes: 'Testing a new version',
				version: '0.2.1',
			},
		});

		const oldMeta = createManifestMeta({ name: 'test', version: '0.2.0' });
		const newMeta = createManifestMeta({ name: 'test', version: '0.2.1' });

		jest.mocked(readManifests).mockResolvedValue([oldMeta]);
		jest.mocked(bumpVersions).mockReturnValue(newMeta.manifest);
		jest.mocked(writeManifest).mockResolvedValue(undefined);

		await prepare(config, context);

		expect(jest.mocked(readManifests)).toHaveBeenCalled();
		expect(jest.mocked(bumpVersions)).toHaveBeenCalledWith(
			oldMeta,
			config,
			context
		);
		expect(jest.mocked(writeManifest)).toHaveBeenCalledWith(
			oldMeta,
			newMeta.manifest
		);

		expect(context.logger.log as jest.Mock).toHaveBeenCalledWith(
			'New %s manifest written for %s to %s',
			'Expo',
			'test',
			'app.json'
		);
	});
});

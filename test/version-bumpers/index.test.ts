jest.mock('../../src/platforms', () => ({ getPlatforms: jest.fn() }));
jest.mock('../../src/version-bumpers/platform-android', () => jest.fn());
jest.mock('../../src/version-bumpers/platform-ios', () => jest.fn());
jest.mock('../../src/version-bumpers/version', () => jest.fn());

import { getPlatforms } from '../../src/platforms';
import bumpAllVersion from '../../src/version-bumpers';
import bumpPlatformAndroid from '../../src/version-bumpers/platform-android';
import bumpPlatformIos from '../../src/version-bumpers/platform-ios';
import bumpVersion from '../../src/version-bumpers/version';
import { createConfig, createContext, createManifestMeta } from '../factory';

describe('version-bumpers', () => {
	it('returns new manifest with bumped version', () => {
		const config = createConfig();
		const context = createContext({
			next: {
				gitHead: 'abc12',
				gitTag: 'v9.1.0',
				notes: 'Testing a new version',
				version: '9.1.0',
			},
		});

		const oldMeta = createManifestMeta({ name: 'test', version: '9.0.0' });
		const newMeta = createManifestMeta({ name: 'test', version: '9.1.9' });

		jest.mocked(getPlatforms).mockReturnValue([]);
		jest.mocked(bumpVersion).mockReturnValue(newMeta.manifest);

		const received = bumpAllVersion(oldMeta, config, context);

		expect(received).toBe(newMeta.manifest);
		expect(jest.mocked(bumpVersion)).toHaveBeenCalledWith(
			oldMeta,
			config,
			context
		);
	});

	it('returns new manifest with bumped version and platform versions', () => {
		const config = createConfig();
		const context = createContext({
			next: {
				gitHead: 'abc12',
				gitTag: 'v2.4.0',
				notes: 'Testing a new version',
				version: '2.4.0',
			},
		});

		const oldMeta = createManifestMeta({
			android: { versionCode: 12 },
			ios: { buildNumber: '2.3.0' },
			name: 'test',
			version: '2.3.0',
		});

		// reuse the old manifest meta, stringified contents should match the exact file content (not updated one).
		const createPatchedManifestMeta = (meta: any, manifest: any) => ({
			...meta,
			manifest: {
				...meta.manifest,
				...manifest,
			},
		});

		const newVersionMeta = createPatchedManifestMeta(oldMeta, {
			version: '2.4.0',
		});
		const newAndroidMeta = createPatchedManifestMeta(newVersionMeta, {
			android: { versionCode: 13 },
		});
		const newIosMeta = createPatchedManifestMeta(newAndroidMeta, {
			ios: { buildNumber: '2.4.0' },
		});

		jest.mocked(getPlatforms).mockReturnValue(['android', 'ios']);
		jest.mocked(bumpVersion).mockReturnValue(newVersionMeta.manifest);
		jest.mocked(bumpPlatformAndroid).mockReturnValue(newAndroidMeta.manifest);
		jest.mocked(bumpPlatformIos).mockReturnValue(newIosMeta.manifest);

		const received = bumpAllVersion(oldMeta, config, context);

		expect(received).toBe(newIosMeta.manifest);
		expect(jest.mocked(bumpVersion)).toHaveBeenCalledWith(
			oldMeta,
			config,
			context
		);
		expect(jest.mocked(bumpPlatformAndroid)).toHaveBeenCalledWith(
			newVersionMeta,
			config,
			context
		);
		expect(jest.mocked(bumpPlatformIos)).toHaveBeenCalledWith(
			newAndroidMeta,
			config,
			context
		);
	});
});

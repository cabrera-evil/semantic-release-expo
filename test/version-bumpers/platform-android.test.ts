jest.mock('../../src/platforms', () => ({ getAndroidPlatform: jest.fn() }));
jest.mock('../../src/version', () => ({ calculateAndroidVersion: jest.fn() }));

import { getAndroidPlatform } from '../../src/platforms';
import { calculateAndroidVersion } from '../../src/version';
import bumpPlatformAndroid from '../../src/version-bumpers/platform-android';
import { createConfig, createContext, createManifestMeta } from '../factory';

describe('version-bumpers/platform-android', () => {
	it('returns new manifest with bumped android version', () => {
		const config = createConfig();
		const context = createContext({
			last: {
				gitHead: '12asd1',
				gitTag: 'v1.2.0',
				version: '1.2.0',
			},
			next: {
				gitHead: 'asd123',
				gitTag: 'v1.3.0',
				notes: 'New version',
				version: '1.3.0',
			},
		});

		const meta = createManifestMeta({
			android: { versionCode: 290010200 },
			ios: { buildNumber: '1.2.0' },
			name: 'test',
			sdkVersion: '29.0.0',
			version: '1.2.0',
		});

		jest
			.mocked(getAndroidPlatform)
			.mockReturnValue(meta.manifest.android as any);
		jest.mocked(calculateAndroidVersion).mockReturnValue('290010300');

		const manifest = bumpPlatformAndroid(meta, config, context);

		expect(jest.mocked(getAndroidPlatform)).toHaveBeenCalledWith(meta.manifest);
		expect(jest.mocked(calculateAndroidVersion)).toHaveBeenCalledWith(
			meta,
			config,
			context
		);
		expect(context.logger.log as jest.Mock).toHaveBeenCalledWith(
			'%s manifest android version changed (%s => %s) in %s',
			'Expo',
			meta.manifest.android!.versionCode,
			290010300,
			meta.filename
		);

		expect(manifest).toMatchObject({
			android: { versionCode: 290010300 },
			ios: { buildNumber: '1.2.0' },
			name: 'test',
			sdkVersion: '29.0.0',
			version: '1.2.0',
		});
	});
});

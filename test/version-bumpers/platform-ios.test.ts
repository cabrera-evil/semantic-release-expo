jest.mock('../../src/platforms', () => ({ getIosPlatform: jest.fn() }));
jest.mock('../../src/version', () => ({ calculateIosVersion: jest.fn() }));

import { getIosPlatform } from '../../src/platforms';
import { calculateIosVersion } from '../../src/version';
import bumpPlatformIos from '../../src/version-bumpers/platform-ios';
import { createConfig, createContext, createManifestMeta } from '../factory';

describe('version-bumpers/platform-ios', () => {
	it('returns new manifest with bumped ios version', () => {
		const config = createConfig();
		const context = createContext();
		const meta = createManifestMeta({
			android: { versionCode: 6 },
			ios: { buildNumber: context.lastRelease!.version },
			name: 'test',
			version: context.lastRelease!.version,
		});

		jest.mocked(getIosPlatform).mockReturnValue(meta.manifest.ios as any);
		jest.mocked(calculateIosVersion).mockReturnValue('newversion');

		const manifest = bumpPlatformIos(meta, config, context);

		expect(jest.mocked(getIosPlatform)).toHaveBeenCalledWith(meta.manifest);
		expect(jest.mocked(calculateIosVersion)).toHaveBeenCalledWith(
			meta,
			config,
			context
		);
		expect(context.logger.log as jest.Mock).toHaveBeenCalledWith(
			'%s manifest ios version changed (%s => %s) in %s',
			'Expo',
			meta.manifest.ios!.buildNumber,
			'newversion',
			meta.filename
		);

		expect(manifest).toMatchObject({
			android: { versionCode: 6 },
			ios: { buildNumber: 'newversion' },
			name: 'test',
			version: context.lastRelease!.version,
		});
	});
});

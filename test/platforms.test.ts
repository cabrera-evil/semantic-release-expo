import {
	getAndroidPlatform,
	getIosPlatform,
	getPlatforms,
} from '../src/platforms';

describe('platforms', () => {
	describe('#getPlatforms', () => {
		it('returns default platforms', () => {
			const platforms = getPlatforms({ name: 'test' });

			expect(platforms).toContain('android');
			expect(platforms).toContain('ios');
		});

		it('returns defined platforms from manifest', () => {
			const platforms = ['android'];

			expect(getPlatforms({ name: 'test', platforms })).toBe(platforms);
		});
	});

	describe('#getAndroidPlatform', () => {
		it('returns default android settings', () => {
			expect(getAndroidPlatform({ name: 'test' })).toMatchObject({
				versionCode: 0,
			});
		});

		it('returns defined android settings from manifest', () => {
			const android = { versionCode: 1337 };

			expect(getAndroidPlatform({ name: 'test', android })).toMatchObject(
				android
			);
		});
	});

	describe('#getIosPlatform', () => {
		it('returns default ios settings', () => {
			expect(getIosPlatform({ name: 'test' })).toMatchObject({
				buildNumber: '',
			});
		});

		it('returns defined ios settings from manifest', () => {
			const ios = { buildNumber: '1.3.7' };

			expect(getIosPlatform({ name: 'test', ios })).toMatchObject(ios);
		});
	});
});

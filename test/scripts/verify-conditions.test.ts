jest.mock('../../src/expo', () => ({
	readManifests: jest.fn(),
	MANIFEST_FILE: 'app.json',
}));

import { readManifests } from '../../src/expo';
import verifyConditions from '../../src/scripts/verify-conditions';
import { createContext } from '../factory';

describe('scripts/verify-conditions', () => {
	it('reads manifest and logs name', async () => {
		const context = createContext();
		const config = {
			manifests: ['app.json', 'app.staging.json'],
		};

		const firstMeta = {
			content: '{ "name": "test" }',
			filename: 'app.json',
			manifest: { name: 'test' },
		};

		const secondMeta = {
			content: '{ "name": "test-staging" }',
			filename: 'app.staging.json',
			manifest: { name: 'test-staging' },
		};

		jest
			.mocked(readManifests)
			.mockResolvedValue([firstMeta, secondMeta] as any);

		await verifyConditions(config, context);

		expect(jest.mocked(readManifests)).toHaveBeenCalled();
		expect(context.logger.log as jest.Mock).toHaveBeenNthCalledWith(
			1,
			'Found %s manifest for %s in %s',
			'Expo',
			'test',
			'app.json'
		);

		expect(context.logger.log as jest.Mock).toHaveBeenNthCalledWith(
			2,
			'Found %s manifest for %s in %s',
			'Expo',
			'test-staging',
			'app.staging.json'
		);
	});

	it('throws when read manifest failed', async () => {
		const config = {};
		const context = createContext();

		jest.mocked(readManifests).mockRejectedValue(new Error());

		expect(verifyConditions(config, context)).rejects.toThrow();
	});

	it('inherits prepare configration without verify conditions configuration', async () => {
		const config = {};
		const manifests = ['app.production.json', 'app.staging.json'];
		const context = createContext();

		context.options!.prepare = [
			{ path: '@semantic-release/changelog' },
			{ path: '@semantic-release/npm' },
			{ path: '@cabrera-evil/semantic-release-expo', manifests },
		];

		const firstMeta = {
			content: '{ "name": "test" }',
			filename: 'app.production.json',
			manifest: { name: 'test' },
		};

		const secondMeta = {
			content: '{ "name": "test-staging" }',
			filename: 'app.staging.json',
			manifest: { name: 'test-staging' },
		};

		jest
			.mocked(readManifests)
			.mockResolvedValue([firstMeta, secondMeta] as any);

		await verifyConditions(config, context);

		expect(jest.mocked(readManifests)).toHaveBeenCalled();
		expect(context.logger.log as jest.Mock).toHaveBeenNthCalledWith(
			1,
			'Found %s manifest for %s in %s',
			'Expo',
			'test',
			'app.production.json'
		);

		expect(context.logger.log as jest.Mock).toHaveBeenNthCalledWith(
			2,
			'Found %s manifest for %s in %s',
			'Expo',
			'test-staging',
			'app.staging.json'
		);
	});
});

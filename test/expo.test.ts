jest.mock('fs-extra', () => ({ readFile: jest.fn(), writeJson: jest.fn() }));
jest.mock('detect-indent', () => jest.fn());
jest.mock('detect-newline', () => ({ detectNewline: jest.fn() }));

import detectIndent from 'detect-indent';
import { detectNewline } from 'detect-newline';
import { readFile, writeJson } from 'fs-extra';
import {
	DEFAULT_INDENT,
	DEFAULT_NEWLINE,
	logManifestFromError,
	MANIFEST_FILE,
	readManifest,
	readManifests,
	writeManifest,
} from '../src/expo';
import { createContext } from './factory';

describe('expo', () => {
	describe('constants', () => {
		it('has correct manifest file name', () =>
			expect(MANIFEST_FILE).toBe('app.json'));
		it('has double spaces as default indent', () =>
			expect(DEFAULT_INDENT).toBe('  '));
		it('has line feed as default new line', () =>
			expect(DEFAULT_NEWLINE).toBe('\n'));
	});

	describe('#logManifestFromError', () => {
		it('does not log anything for normal errors', () => {
			const context = createContext();

			logManifestFromError(context, new Error());

			expect((context.logger.log as jest.Mock).mock.calls).toHaveLength(0);
		});

		it('does log for errors related to manifest errors', () => {
			const context = createContext();
			const error = new Error() as any;
			error.expo = 'app.production.json';

			logManifestFromError(context, error);

			expect(context.logger.log as jest.Mock).toHaveBeenCalledWith(
				'Error encountered for %s manifest %s',
				'Expo',
				'app.production.json'
			);
		});
	});

	describe('#readManifest', () => {
		it('reads the manifest file', async () => {
			jest
				.mocked(readFile as unknown as jest.Mock)
				.mockResolvedValue('{ "expo": { "name": "test" } }');

			const meta = await readManifest(MANIFEST_FILE);

			expect(
				jest.mocked(readFile as unknown as jest.Mock)
			).toHaveBeenCalledWith(MANIFEST_FILE, 'utf8');
			expect(meta.manifest).toMatchObject({ name: 'test' });
		});
	});

	describe('#readManifests', () => {
		it('reads multiple manifest files', async () => {
			jest
				.mocked(readFile as unknown as jest.Mock)
				.mockResolvedValueOnce('{ "expo": { "name": "first" } }')
				.mockResolvedValueOnce('{ "expo": { "name": "second" } }');

			const metas = await readManifests([MANIFEST_FILE, MANIFEST_FILE]);

			expect(
				jest.mocked(readFile as unknown as jest.Mock)
			).toHaveBeenNthCalledWith(1, MANIFEST_FILE, 'utf8');
			expect(
				jest.mocked(readFile as unknown as jest.Mock)
			).toHaveBeenNthCalledWith(2, MANIFEST_FILE, 'utf8');

			expect(metas[0].manifest).toMatchObject({ name: 'first' });
			expect(metas[1].manifest).toMatchObject({ name: 'second' });
		});
	});

	describe('#writeManifest', () => {
		it('writes the manifest file with indentation detection', async () => {
			const manifestData = { name: 'test' };
			const manifestString = `{
				"expo": {
					"name": "old"
				}
			}`;

			const manifestMeta = {
				content: manifestString,
				filename: MANIFEST_FILE,
				manifest: JSON.parse(manifestString).expo,
			};

			jest.mocked(detectIndent as jest.Mock).mockReturnValue({ indent: '\t' });
			jest.mocked(detectNewline as jest.Mock).mockReturnValue('\n');

			await writeManifest(manifestMeta, manifestData as any);

			expect(jest.mocked(detectIndent as jest.Mock)).toHaveBeenCalledWith(
				manifestString
			);
			expect(jest.mocked(detectNewline as jest.Mock)).toHaveBeenCalledWith(
				manifestString
			);
			expect(jest.mocked(writeJson as jest.Mock)).toHaveBeenCalledWith(
				MANIFEST_FILE,
				{ expo: manifestData },
				{ spaces: '\t', EOL: '\n' }
			);
		});

		it('writes manifest file with fallback indentation', async () => {
			const manifestData = { name: 'test' };
			const manifestString = `{
				"expo": {
					"name": "old"
				}
			}`;

			const manifestMeta = {
				content: manifestString,
				filename: MANIFEST_FILE,
				manifest: JSON.parse(manifestString).expo,
			};

			const options = {
				EOL: DEFAULT_NEWLINE,
				spaces: DEFAULT_INDENT,
			};

			jest.mocked(detectIndent as jest.Mock).mockReturnValue(undefined);
			jest.mocked(detectNewline as jest.Mock).mockReturnValue(undefined);

			await writeManifest(manifestMeta, manifestData as any);

			expect(jest.mocked(detectIndent as jest.Mock)).toHaveBeenCalledWith(
				manifestString
			);
			expect(jest.mocked(detectNewline as jest.Mock)).toHaveBeenCalledWith(
				manifestString
			);
			expect(jest.mocked(writeJson as jest.Mock)).toHaveBeenCalledWith(
				MANIFEST_FILE,
				{ expo: manifestData },
				options
			);
		});
	});
});

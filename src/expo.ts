import detectIndent from 'detect-indent';
import { detectNewline } from 'detect-newline';
import { readFile, writeJson } from 'fs-extra';
import { Context, Manifest, ManifestMeta } from './types';

/**
 * The name of the default Expo manifest file.
 */
export const MANIFEST_FILE = 'app.json';

/**
 * The default indentation to use when no indentation is found.
 */
export const DEFAULT_INDENT = '  ';

/**
 * The default newline character to use when no existing was detected.
 */
export const DEFAULT_NEWLINE = '\n';

/**
 * Log information about the manifest which is related to the error.
 */
export function logManifestFromError(context: Context, error: any) {
	if (error && error.expo) {
		context.logger.log(
			'Error encountered for %s manifest %s',
			'Expo',
			error.expo
		);
	}
}

/**
 * Read the Expo manifest content and return the parsed JSON.
 */
export async function readManifest(filename: string): Promise<ManifestMeta> {
	try {
		const content = await readFile(filename, 'utf8');
		const manifest = JSON.parse(content).expo;

		return { filename, content, manifest };
	} catch (error: any) {
		error.expo = filename;
		throw error;
	}
}

/**
 * Read a list of Expo mannifest files and return the parsed JSON.
 */
export async function readManifests(
	filenames: string[]
): Promise<ManifestMeta[]> {
	return await Promise.all(filenames.map(readManifest));
}

/**
 * Write new content to the Expo manifest file, keeping indentation intact.
 */
export async function writeManifest(meta: ManifestMeta, manifest: Manifest) {
	const { indent } = detectIndent(meta.content) || { indent: DEFAULT_INDENT };
	const newline = detectNewline(meta.content) || DEFAULT_NEWLINE;

	await writeJson(
		meta.filename,
		{ expo: manifest },
		{ spaces: indent, EOL: newline }
	);
}

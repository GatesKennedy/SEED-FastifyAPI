import { copyFile, writeFile } from 'fs/promises';
export default async ({ tempFilePath, workFilePath, records }) => {
	const recordsSnapshot = records.join('\n');
	// write to temp (async OS proc)
	await writeFile(tempFilePath, recordsSnapshot);
	// copy temp to working file (async OS proc)
	await copyFile(tempFilePath, workFilePath);
};

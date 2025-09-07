export function checkLinkType(url: string): string {
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return 'url';
	}
	return 'string';
}

export async function buildUploadFileData(this: any, filePath: string): Promise<{ value: string }> {
	// This is a placeholder implementation
	// In a real implementation, this would handle file upload logic
	return { value: filePath };
}

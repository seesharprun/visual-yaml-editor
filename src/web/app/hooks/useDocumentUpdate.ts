import { useRef } from 'react';
import type { YamlData, Message } from '../types';

export const useDocumentUpdate = (
	vscode: { postMessage: (message: Message) => void },
	data: YamlData,
	setData: (data: YamlData) => void
) => {
	const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const rafRef = useRef<number | null>(null);

	const updateDocument = (newData: YamlData) => {
		setData(newData);
		vscode.postMessage({
			type: 'update',
			content: newData,
		});
	};

	const debouncedUpdateDocument = (newData: YamlData) => {
		setData(newData);
		
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}
		
		updateTimeoutRef.current = setTimeout(() => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
			
			rafRef.current = requestAnimationFrame(() => {
				try {
					vscode.postMessage({
						type: 'update',
						content: newData,
					});
				} catch (e) {
					console.error('Failed to update document:', e);
				}
				rafRef.current = null;
			});
			updateTimeoutRef.current = null;
		}, 300);
	};

	const flushUpdates = () => {
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
			updateTimeoutRef.current = null;
		}
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		requestAnimationFrame(() => {
			vscode.postMessage({
				type: 'update',
				content: data,
			});
		});
	};

	const cleanup = () => {
		if (updateTimeoutRef.current) {
			clearTimeout(updateTimeoutRef.current);
		}
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
		}
	};

	return { updateDocument, debouncedUpdateDocument, flushUpdates, cleanup };
};

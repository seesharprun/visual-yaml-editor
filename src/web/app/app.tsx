import React, { useState, useEffect } from 'react';
import * as yaml from 'js-yaml';
import type { YamlData, Message } from './types';
import { validateYamlSchema } from './validation';
import { useDocumentUpdate } from './hooks/useDocumentUpdate';
import { ErrorBanner } from './components/ErrorBanner';
import { EditableBreadcrumbs } from './components/EditableBreadcrumbs';
import { HeaderSection } from './components/HeaderSection';
import { SyntaxSection } from './components/SyntaxSection';
import { ParametersSection } from './components/ParametersSection';
import { ExamplesSection } from './components/ExamplesSection';
import { RelatedSection } from './components/RelatedSection';
import '../styles.css';

declare const acquireVsCodeApi: () => {
	postMessage: (message: Message) => void;
	getState: () => any;
	setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();

export const App: React.FC = () => {
	const [data, setData] = useState<YamlData>({
		type: 'command',
		category: 'aggregation',
		name: 'Loading...',
		parameters: [],
		examples: { items: [] },
		related: []
	});
	const [hasReceivedData, setHasReceivedData] = useState(false);
	const [yamlError, setYamlError] = useState<string | null>(null);

	// Editing states for breadcrumbs
	const [editingType, setEditingType] = useState(false);
	const [editingCategory, setEditingCategory] = useState(false);

	const { updateDocument, debouncedUpdateDocument, flushUpdates, cleanup } =
		useDocumentUpdate(vscode, data, setData);

	useEffect(() => {
		vscode.postMessage({ type: 'ready' });

		const messageHandler = (event: MessageEvent<Message>) => {
			const message = event.data;
			switch (message.type) {
				case 'update':
					if (message.text) {
						try {
							const parsed = yaml.load(message.text) as YamlData;
							const newData = parsed || {
								type: 'command' as const,
								category: '',
								name: '',
								parameters: [],
								examples: { items: [] },
								related: []
							};

							if (typeof newData === 'object' && newData !== null) {
								const validation = validateYamlSchema(newData);

								if (!validation.valid) {
									console.warn('Schema validation failed:', validation.error);
									setYamlError(`Schema validation error: ${validation.error}`);
									setHasReceivedData(true);
								} else {
									setData(newData);
									setHasReceivedData(true);
									setYamlError(null);
								}
							} else {
								console.warn('Invalid YAML structure, maintaining current state');
								setYamlError('Invalid YAML structure. Please check your syntax.');
								setHasReceivedData(true);
							}
						} catch (e) {
							console.error('Failed to parse YAML:', e);
							const errorMessage = e instanceof Error ? e.message : 'Unknown error';
							setYamlError(`YAML parsing error: ${errorMessage}`);
							setHasReceivedData(true);
						}
					}
					break;
			}
		};

		window.addEventListener('message', messageHandler);
		return () => {
			window.removeEventListener('message', messageHandler);
			cleanup();
		};
	}, [cleanup]);

	return (
		<main className="min-h-screen p-8 inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black relative">
			{/* Error notification banner */}
			{yamlError && (
				<ErrorBanner error={yamlError} onDismiss={() => setYamlError(null)} />
			)}

			{/* Overlay when YAML is invalid */}
			{yamlError && hasReceivedData && (
				<div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-[2px] z-40 pointer-events-none" />
			)}

			{/* Main content */}
			<div className={yamlError && hasReceivedData ? 'opacity-50 pointer-events-none select-none' : ''}>
				<article className="flex-1 p-8">
					<div className="max-w-4xl">
						<article>
							<EditableBreadcrumbs
								data={data}
								editingType={editingType}
								editingCategory={editingCategory}
								setEditingType={setEditingType}
								setEditingCategory={setEditingCategory}
								onUpdate={debouncedUpdateDocument}
								onFlush={flushUpdates}
								vscode={vscode}
							/>

							<HeaderSection
								data={data}
								onUpdate={updateDocument}
								onDebouncedUpdate={debouncedUpdateDocument}
								onFlush={flushUpdates}
							/>

							<SyntaxSection
								syntax={data.syntax}
								onUpdate={(syntax) => debouncedUpdateDocument({ ...data, syntax })}
								onFlush={flushUpdates}
							/>

							<ParametersSection
								parameters={data.parameters}
								data={data}
								onUpdate={updateDocument}
							/>

							<ExamplesSection
								examples={data.examples}
								data={data}
								onUpdate={updateDocument}
							/>

							<RelatedSection
								related={data.related}
								data={data}
								onUpdate={updateDocument}
							/>
						</article>
					</div>
				</article>
			</div>
		</main>
	);
};

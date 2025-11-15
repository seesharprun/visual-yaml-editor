import React from 'react';
import type { YamlData, Examples, ExampleItem } from '../types';
import { CodeBlock } from './CodeBlock';
import { OptionalField } from './OptionalField';
import { EditableExampleItem } from './EditableExampleItem';
import { DeleteIcon, AddIcon } from './Icons';

interface ExamplesSectionProps {
	examples?: Examples;
	onUpdate: (data: YamlData) => void;
	data: YamlData;
}

export const ExamplesSection: React.FC<ExamplesSectionProps> = ({
	examples,
	onUpdate,
	data
}) => {
	if (!examples || (examples.items.length === 0 && !examples.sample)) {
		return null;
	}

	return (
		<section className="mb-8">
			<a className="invisible scroll-mt-24" id="examples"></a>
			<h2 className="text-2xl font-bold text-white mb-4">Examples</h2>
			
			{/* Sample Data */}
			<div className="mb-6">
				<a className="invisible scroll-mt-24" id="sample-data"></a>
				{examples.sample && <h3 className="text-lg font-semibold text-gray-200 mb-3">Sample Data</h3>}
				{examples.sample ? (
					<div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700/50 overflow-x-auto relative group">
						<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
							<button
								onClick={() => {
									if (data.examples) {
										const newExamples = { ...data.examples };
										delete newExamples.sample;
										onUpdate({ ...data, examples: newExamples });
									}
								}}
								className="bg-neutral-900 rounded px-2 py-1 border border-neutral-700/50 hover:border-red-500/50 text-gray-400 hover:text-red-400"
								aria-label="Delete sample data"
							>
								<DeleteIcon className="w-3 h-3" />
							</button>
						</div>
						<CodeBlock code={examples.sample} language="json" />
					</div>
				) : (
					<OptionalField
						label="Sample Data"
						value={examples.sample}
						onUpdate={(value) => {
							if (data.examples) {
								const newExamples = { ...data.examples };
								if (value) {
									newExamples.sample = value;
								} else {
									delete newExamples.sample;
								}
								onUpdate({ ...data, examples: newExamples });
							}
						}}
						multiline={true}
						rows={8}
						codeStyle={true}
						placeholder="Enter sample data (JSON)..."
					/>
				)}
			</div>

			{/* Example Items */}
			<div className="space-y-6">
				{examples.items.map((example, index) => (
					<EditableExampleItem
						key={index}
						example={example}
						index={index}
						onUpdate={(updated) => {
							if (data.examples) {
								const newItems = [...data.examples.items];
								newItems[index] = updated;
								onUpdate({ ...data, examples: { ...data.examples, items: newItems } });
							}
						}}
						onDelete={() => {
							if (data.examples) {
								const newExamples = {
									...data.examples,
									items: data.examples.items.filter((_, i) => i !== index)
								};
								onUpdate({ ...data, examples: newExamples });
							}
						}}
					/>
				))}
				
				<button
					onClick={() => {
						const newExample: ExampleItem = {
							title: 'New Example',
							description: 'Description',
							query: 'db.collection.find({})',
							output: { value: '{}' }
						};
						if (data.examples) {
							const newExamples = {
								...data.examples,
								items: [...data.examples.items, newExample]
							};
							onUpdate({ ...data, examples: newExamples });
						} else {
							onUpdate({ ...data, examples: { sample: '', items: [newExample] } });
						}
					}}
					className="w-full bg-neutral-900 rounded-lg p-4 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
				>
					<AddIcon />
					<span className="font-medium">Add Example</span>
				</button>
			</div>
		</section>
	);
};

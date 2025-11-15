import React, { useState } from 'react';
import type { ExampleItem } from '../types';
import { CodeBlock } from './CodeBlock';
import { EditIcon, DeleteIcon, SaveIcon, CancelIcon, AddIcon } from './Icons';
import { slugify } from '../utils';

interface EditableExampleItemProps {
	example: ExampleItem;
	index: number;
	onUpdate: (updated: ExampleItem) => void;
	onDelete: () => void;
}

export const EditableExampleItem: React.FC<EditableExampleItemProps> = ({
	example,
	index,
	onUpdate,
	onDelete
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [localExample, setLocalExample] = useState<ExampleItem>(example);

	const handleSave = () => {
		onUpdate(localExample);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setLocalExample(example);
		setIsEditing(false);
	};

	const updateField = <K extends keyof ExampleItem>(field: K, value: ExampleItem[K]) => {
		setLocalExample({ ...localExample, [field]: value });
	};

	const addExplanation = () => {
		updateField('explanation', '');
	};

	const removeExplanation = () => {
		const { explanation, ...rest } = localExample;
		setLocalExample(rest as ExampleItem);
	};

	const addOutput = () => {
		updateField('output', { value: '{}' });
	};

	const removeOutput = () => {
		const { output, ...rest } = localExample;
		setLocalExample(rest as ExampleItem);
	};

	if (isEditing) {
		return (
			<div className="bg-neutral-800/30 rounded-lg border border-neutral-700/50 p-6 relative group">
				<button
					onClick={onDelete}
					className="absolute top-3 right-3 bg-neutral-900 rounded-lg px-2 py-2 border border-neutral-700/50 hover:border-red-500/50 hover:bg-neutral-800/50 text-gray-400 hover:text-red-400 z-10"
					aria-label="Delete example"
				>
					<DeleteIcon />
				</button>

				<div className="space-y-4">
					{/* Title */}
					<div>
						<label className="text-sm font-semibold text-gray-300 mb-2 block">Title</label>
						<input
							type="text"
							value={localExample.title}
							onChange={(e) => updateField('title', e.target.value)}
							className="w-full text-xl font-semibold text-white bg-neutral-900 rounded px-3 py-2 border border-neutral-700 outline-none focus:border-blue-500"
							placeholder="Example title"
						/>
					</div>

					{/* Explanation (Optional) */}
					{localExample.explanation !== undefined ? (
						<div className="relative group/field">
							<label className="text-sm font-semibold text-gray-300 mb-2 block">
								Explanation <span className="text-gray-500 text-xs">(optional)</span>
							</label>
							<textarea
								value={localExample.explanation}
								onChange={(e) => updateField('explanation', e.target.value)}
								className="w-full text-gray-300 text-sm bg-blue-900/20 rounded px-3 py-2 border-l-4 border-blue-500 outline-none resize-vertical"
								placeholder="Explanation"
								rows={2}
							/>
							<button
								onClick={removeExplanation}
								className="absolute top-0 right-0 opacity-0 group-hover/field:opacity-100 transition-all bg-neutral-900 rounded px-2 py-1 text-xs text-gray-400 hover:text-red-400"
								aria-label="Remove explanation"
							>
								<DeleteIcon className="w-3 h-3" />
							</button>
						</div>
					) : (
						<button
							onClick={addExplanation}
							className="w-full bg-neutral-900 rounded-lg p-2 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400 text-sm"
						>
							<AddIcon className="w-4 h-4" />
							<span>Add Explanation</span>
						</button>
					)}

					{/* Description */}
					<div>
						<label className="text-sm font-semibold text-gray-300 mb-2 block">Description</label>
						<textarea
							value={localExample.description}
							onChange={(e) => updateField('description', e.target.value)}
							className="w-full text-gray-400 text-sm bg-neutral-900 rounded px-3 py-2 border border-neutral-700 outline-none focus:border-blue-500 resize-vertical"
							placeholder="Description"
							rows={2}
						/>
					</div>

					{/* Query */}
					<div>
						<label className="text-sm font-semibold text-gray-300 mb-2 block">Query</label>
						<textarea
							value={localExample.query}
							onChange={(e) => updateField('query', e.target.value)}
							className="w-full text-gray-300 font-mono text-sm bg-neutral-900 rounded px-3 py-2 border border-neutral-700 outline-none focus:border-blue-500 resize-vertical"
							rows={4}
						/>
					</div>

					{/* Output (Optional) */}
					{localExample.output !== undefined ? (
						<div className="relative group/field">
							<label className="text-sm font-semibold text-gray-300 mb-2 block">
								Output <span className="text-gray-500 text-xs">(optional)</span>
							</label>
							<textarea
								value={localExample.output.value}
								onChange={(e) => updateField('output', { value: e.target.value })}
								className="w-full text-gray-300 font-mono text-sm bg-neutral-900 rounded px-3 py-2 border border-neutral-700 outline-none focus:border-blue-500 resize-vertical"
								rows={4}
							/>
							<button
								onClick={removeOutput}
								className="absolute top-0 right-0 opacity-0 group-hover/field:opacity-100 transition-all bg-neutral-900 rounded px-2 py-1 text-xs text-gray-400 hover:text-red-400"
								aria-label="Remove output"
							>
								<DeleteIcon className="w-3 h-3" />
							</button>
						</div>
					) : (
						<button
							onClick={addOutput}
							className="w-full bg-neutral-900 rounded-lg p-2 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400 text-sm"
						>
							<AddIcon className="w-4 h-4" />
							<span>Add Output</span>
						</button>
					)}

					{/* Action Buttons */}
					<div className="flex gap-2 pt-2">
						<button
							onClick={handleSave}
							className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 flex items-center gap-2"
						>
							<SaveIcon />
							Save
						</button>
						<button
							onClick={handleCancel}
							className="bg-neutral-700 hover:bg-neutral-600 text-white rounded px-4 py-2 flex items-center gap-2"
						>
							<CancelIcon />
							Cancel
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Display mode
	return (
		<div className="bg-neutral-800/30 rounded-lg border border-neutral-700/50 p-6 relative group cursor-pointer hover:border-blue-500/50 transition-colors">
			<button
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-neutral-900 rounded-lg px-2 py-2 border border-neutral-700/50 hover:border-red-500/50 hover:bg-neutral-800/50 text-gray-400 hover:text-red-400 z-10"
				aria-label="Delete example"
			>
				<DeleteIcon />
			</button>

			<div onClick={() => setIsEditing(true)}>
				<a className="invisible scroll-mt-24" id={slugify(example.title)}></a>
				<h3 className="text-xl font-semibold text-white mb-3 hover:text-blue-400 transition-colors">
					{example.title}
				</h3>

				{example.explanation && (
					<div className="mb-4 p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded">
						<p className="text-gray-300 text-sm">{example.explanation}</p>
					</div>
				)}

				{example.description && (
					<p className="text-gray-400 text-sm mb-4 leading-relaxed">
						{example.description}
					</p>
				)}

				<div className="mb-4">
					<h4 className="text-sm font-semibold text-gray-300 mb-2">Query:</h4>
					<div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700/50 overflow-x-auto">
						<CodeBlock code={example.query} language="javascript" />
					</div>
				</div>

				{example.output && example.output.value && example.output.value.trim() !== '' && (
					<div>
						<h4 className="text-sm font-semibold text-gray-300 mb-2">Output:</h4>
						<div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700/50 overflow-x-auto">
							<CodeBlock code={example.output.value} language="json" />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

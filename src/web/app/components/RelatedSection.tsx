import React, { useState } from 'react';
import type { YamlData, RelatedItem } from '../types';
import { DeleteIcon, AddIcon, SaveIcon, CancelIcon } from './Icons';

interface RelatedSectionProps {
	related?: RelatedItem[];
	onUpdate: (data: YamlData) => void;
	data: YamlData;
}

export const RelatedSection: React.FC<RelatedSectionProps> = ({
	related,
	onUpdate,
	data
}) => {
	const [showForm, setShowForm] = useState(false);
	const [newRelated, setNewRelated] = useState('');

	if (!related || related.length === 0) {
		return null;
	}

	return (
		<section className="mb-8">
			<a className="invisible scroll-mt-24" id="related"></a>
			<h2 className="text-2xl font-bold text-white mb-4">Related</h2>
			<div className="space-y-2">
				{related.map((item, index) => (
					<div
						key={index}
						className="flex items-center justify-between bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/50 group"
					>
						<span className="text-blue-400">{item.reference}</span>
						<button
							onClick={() => {
								const newRelated = data.related?.filter((_, i) => i !== index);
								onUpdate({ ...data, related: newRelated });
							}}
							className="opacity-0 group-hover:opacity-100 transition-all bg-neutral-900 rounded-lg px-2 py-2 border border-neutral-700/50 hover:border-red-500/50 hover:bg-neutral-800/50 text-gray-400 hover:text-red-400"
							aria-label="Delete related item"
						>
							<DeleteIcon className="w-4 h-4" />
						</button>
					</div>
				))}
				
				{showForm ? (
					<div className="flex gap-2">
						<input
							type="text"
							value={newRelated}
							onChange={(e) => setNewRelated(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && newRelated.trim()) {
									onUpdate({
										...data,
										related: [...(data.related || []), { reference: newRelated }]
									});
									setNewRelated('');
									setShowForm(false);
								}
							}}
							className="flex-1 bg-neutral-900 rounded px-3 py-2 border border-neutral-700 outline-none focus:border-blue-500 text-white"
							placeholder="Enter reference name"
							autoFocus
						/>
						<button
							onClick={() => {
								if (newRelated.trim()) {
									onUpdate({
										...data,
										related: [...(data.related || []), { reference: newRelated }]
									});
									setNewRelated('');
									setShowForm(false);
								}
							}}
							className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 flex items-center gap-2"
						>
							<SaveIcon />
							Save
						</button>
						<button
							onClick={() => {
								setNewRelated('');
								setShowForm(false);
							}}
							className="bg-neutral-700 hover:bg-neutral-600 text-white rounded px-4 py-2 flex items-center gap-2"
						>
							<CancelIcon />
							Cancel
						</button>
					</div>
				) : (
					<button
						onClick={() => setShowForm(true)}
						className="w-full bg-neutral-900 rounded-lg p-3 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
					>
						<AddIcon />
						<span className="font-medium">Add Related Item</span>
					</button>
				)}
			</div>
		</section>
	);
};


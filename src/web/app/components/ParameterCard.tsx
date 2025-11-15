import React, { useState } from 'react';
import type { Parameter } from '../types';
import { CancelIcon, SaveIcon } from './Icons';

interface ParameterCardProps {
	parameter: Parameter;
	isEditMode?: boolean;
	onUpdate?: (param: Parameter) => void;
}

export const ParameterCard: React.FC<ParameterCardProps> = ({ parameter, isEditMode = false, onUpdate }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editedParam, setEditedParam] = useState(parameter);

	const handleSave = () => {
		if (onUpdate) {
			onUpdate(editedParam);
		}
		setIsEditing(false);
	};

	if (isEditing && isEditMode) {
		return (
			<div className="space-y-3">
				<input
					type="text"
					value={editedParam.name}
					onChange={(e) => setEditedParam({ ...editedParam, name: e.target.value })}
					className="w-full bg-neutral-900 text-blue-300 font-mono font-semibold text-lg py-2 px-3 rounded border border-blue-500 outline-none"
					placeholder="Parameter name"
				/>
				<select
					value={editedParam.type || 'string'}
					onChange={(e) => setEditedParam({ ...editedParam, type: e.target.value as any })}
					className="bg-neutral-900 text-white py-2 px-3 rounded border border-neutral-700 outline-none"
				>
					<option value="string">string</option>
					<option value="number">number</option>
					<option value="object">object</option>
					<option value="array">array</option>
					<option value="pattern">pattern</option>
					<option value="expression">expression</option>
				</select>
				<label className="flex items-center gap-2 text-white">
					<input
						type="checkbox"
						checked={editedParam.required}
						onChange={(e) => setEditedParam({ ...editedParam, required: e.target.checked })}
						className="rounded"
					/>
					Required
				</label>
				<textarea
					value={editedParam.description || ''}
					onChange={(e) => setEditedParam({ ...editedParam, description: e.target.value })}
					className="w-full bg-neutral-900 text-gray-300 py-2 px-3 rounded border border-neutral-700 outline-none resize-vertical"
					placeholder="Parameter description"
					rows={3}
				/>
				<div className="flex gap-2">
					<button
						onClick={handleSave}
						className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
					>
						<SaveIcon />
						Save
					</button>
					<button
						onClick={() => {
							setEditedParam(parameter);
							setIsEditing(false);
						}}
						className="bg-neutral-700 text-white py-2 px-4 rounded hover:bg-neutral-600"
					>
						<CancelIcon />
						Cancel
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			className={isEditMode ? 'cursor-pointer hover:bg-neutral-800/70 transition-colors' : ''}
			onClick={() => isEditMode && setIsEditing(true)}
		>
			<div className="flex items-center gap-3 mb-2">
				<code className="text-blue-300 font-mono font-semibold text-lg bg-transparent">{parameter.name}</code>
				{parameter.required && (
					<span className="text-xs px-2 py-1 rounded bg-red-900/40 text-red-300 border border-red-700/50">
						required
					</span>
				)}
				{parameter.type && (
					<span className="text-xs px-2 py-1 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
						{parameter.type}
					</span>
				)}
			</div>
			{parameter.description && (
				<p className="text-gray-400 text-sm mt-2 leading-relaxed">
					{parameter.description}
				</p>
			)}
		</div>
	);
};

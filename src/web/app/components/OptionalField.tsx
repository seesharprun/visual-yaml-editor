import React, { useState } from 'react';
import { EditIcon, DeleteIcon, AddIcon } from './Icons';

interface OptionalFieldProps {
	label: string;
	value: string | undefined;
	placeholder?: string;
	onUpdate: (value: string | undefined) => void;
	multiline?: boolean;
	rows?: number;
	showAddButton?: boolean;
	codeStyle?: boolean;
	className?: string;
}

export const OptionalField: React.FC<OptionalFieldProps> = ({
	label,
	value,
	placeholder = 'Enter value...',
	onUpdate,
	multiline = false,
	rows = 3,
	showAddButton = true,
	codeStyle = false,
	className = ''
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [localValue, setLocalValue] = useState(value || '');

	const handleSave = () => {
		onUpdate(localValue.trim() || undefined);
		setIsEditing(false);
	};

	const handleDelete = () => {
		onUpdate(undefined);
	};

	const handleAdd = () => {
		setLocalValue('');
		setIsEditing(true);
	};

	// If value doesn't exist and we're not editing, show add button
	if (!value && !isEditing) {
		return showAddButton ? (
			<button
				onClick={handleAdd}
				className={`w-full bg-neutral-900 rounded-lg p-3 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400 ${className}`}
			>
				<AddIcon />
				<span className="font-medium">Add {label}</span>
			</button>
		) : null;
	}

	// Editing mode
	if (isEditing) {
		return (
			<div className="space-y-2">
				<label className="text-sm font-semibold text-gray-300">{label}</label>
				{multiline ? (
					<textarea
						value={localValue}
						onChange={(e) => setLocalValue(e.target.value)}
						className={`w-full bg-neutral-900 rounded-lg px-3 py-2 border border-blue-500 outline-none resize-vertical ${
							codeStyle ? 'text-gray-300 font-mono text-sm' : 'text-gray-300 text-sm'
						}`}
						placeholder={placeholder}
						rows={rows}
						autoFocus
					/>
				) : (
					<input
						type="text"
						value={localValue}
						onChange={(e) => setLocalValue(e.target.value)}
						className="w-full bg-neutral-900 rounded-lg px-3 py-2 border border-blue-500 outline-none text-gray-300 text-sm"
						placeholder={placeholder}
						autoFocus
					/>
				)}
				<div className="flex gap-2">
					<button
						onClick={handleSave}
						className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm"
					>
						Save
					</button>
					<button
						onClick={() => {
							setLocalValue(value || '');
							setIsEditing(false);
						}}
						className="bg-neutral-700 hover:bg-neutral-600 text-white rounded px-4 py-2 text-sm"
					>
						Cancel
					</button>
				</div>
			</div>
		);
	}

	// Display mode
	return (
		<div className="group relative">
			<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
				<button
					onClick={() => {
						setLocalValue(value || '');
						setIsEditing(true);
					}}
					className="bg-neutral-900 rounded px-2 py-1 border border-neutral-700/50 hover:border-blue-500/50 text-gray-400 hover:text-blue-400"
					aria-label={`Edit ${label}`}
				>
					<EditIcon className="w-3 h-3" />
				</button>
				<button
					onClick={handleDelete}
					className="bg-neutral-900 rounded px-2 py-1 border border-neutral-700/50 hover:border-red-500/50 text-gray-400 hover:text-red-400"
					aria-label={`Delete ${label}`}
				>
					<DeleteIcon className="w-3 h-3" />
				</button>
			</div>
			{value}
		</div>
	);
};

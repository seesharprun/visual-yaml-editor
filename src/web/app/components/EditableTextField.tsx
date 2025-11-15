import React from 'react';
import { EditIcon } from './Icons';

interface EditableTextFieldProps {
	value: string;
	isEditing: boolean;
	onEdit: () => void;
	onSave: () => void;
	onChange: (value: string) => void;
	placeholder?: string;
	multiline?: boolean;
	rows?: number;
	className?: string;
	editClassName?: string;
	displayClassName?: string;
	large?: boolean;
}

export const EditableTextField: React.FC<EditableTextFieldProps> = ({
	value,
	isEditing,
	onEdit,
	onSave,
	onChange,
	placeholder = 'Click to add...',
	multiline = false,
	rows = 3,
	className = '',
	editClassName = '',
	displayClassName = '',
	large = false
}) => {
	return (
		<div className={`group flex items-${multiline ? 'start' : 'center'} justify-between gap-3 ${className}`}>
			{isEditing ? (
				multiline ? (
					<textarea
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onBlur={onSave}
						className={`bg-transparent border-b-2 border-blue-500 outline-none flex-1 resize-vertical ${editClassName}`}
						autoFocus
						rows={rows}
					/>
				) : (
					<input
						type="text"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onBlur={onSave}
						className={`bg-transparent border-b-2 border-blue-500 outline-none flex-1 ${editClassName}`}
						autoFocus
					/>
				)
			) : (
				<>
					{multiline ? (
						<p
							className={`cursor-pointer hover:text-blue-400 transition-colors flex-1 ${displayClassName}`}
							onClick={onEdit}
						>
							{value || placeholder}
						</p>
					) : (
						<h1
							className={`cursor-pointer hover:text-blue-400 transition-colors flex-1 ${displayClassName}`}
							onClick={onEdit}
						>
							{value || placeholder}
						</h1>
					)}
					<button
						onClick={onEdit}
						className="opacity-0 group-hover:opacity-100 transition-all bg-neutral-900 rounded-lg px-3 py-2 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-neutral-800/50 flex items-center gap-2 text-gray-400 hover:text-blue-400 flex-shrink-0"
						aria-label={`Edit ${multiline ? 'description' : 'title'}`}
					>
						<EditIcon />
					</button>
				</>
			)}
		</div>
	);
};

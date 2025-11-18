import React from 'react';
import type { YamlData } from '../types';
import { ChatIcon } from './Icons';

interface EditableBreadcrumbsProps {
	data: YamlData;
	editingType: boolean;
	editingCategory: boolean;
	setEditingType: (editing: boolean) => void;
	setEditingCategory: (editing: boolean) => void;
	onUpdate: (data: YamlData) => void;
	onFlush: () => void;
	vscode: any;
}

const OPERATOR_CATEGORIES = [
	'accumulator',
	'aggregation',
	'arithmetic-expression',
	'array-expression',
	'array-query',
	'array-update',
	'bitwise',
	'bitwise-query',
	'bitwise-update',
	'boolean-expression',
	'comparison-query',
	'conditional-expression',
	'date-expression',
	'data-size',
	'element-query',
	'evaluation-query',
	'field-update',
	'geospatial',
	'logical-query',
	'miscellaneous',
	'object-expression',
	'projection',
	'timestamp-expression',
	'set-expression',
	'variable-expression',
	'window'
];

const COMMAND_CATEGORIES = ['aggregation', 'query-and-write'];

export const EditableBreadcrumbs: React.FC<EditableBreadcrumbsProps> = ({
	data,
	editingType,
	editingCategory,
	setEditingType,
	setEditingCategory,
	onUpdate,
	onFlush,
	vscode
}) => {
	const handleOpenChat = () => {
		vscode.postMessage({ type: 'openChat' });
	};

	return (
		<div className="mb-6 flex items-center justify-between gap-4">
			<nav className="text-sm text-gray-400 flex items-center gap-2">
			<span className="hover:text-blue-400 transition-colors">Reference</span>
			<span>/</span>
			
			{/* Type dropdown */}
			{editingType ? (
				<select
					value={data.type}
					onChange={(e) => {
						onUpdate({ ...data, type: e.target.value as 'operator' | 'command' });
						setEditingType(false);
					}}
					onBlur={() => setEditingType(false)}
					className="bg-neutral-800 text-white rounded px-2 py-1 outline-none capitalize"
					autoFocus
				>
					<option value="operator">Operator</option>
					<option value="command">Command</option>
				</select>
			) : (
				<span
					className="capitalize cursor-pointer hover:text-blue-400 transition-colors"
					onClick={() => setEditingType(true)}
				>
					{data.type}
				</span>
			)}
			<span>/</span>
			
			{/* Category dropdown */}
			{editingCategory ? (
				<select
					value={data.category}
					onChange={(e) => {
						onUpdate({ ...data, category: e.target.value });
						setEditingCategory(false);
					}}
					onBlur={() => {
						onFlush();
						setEditingCategory(false);
					}}
					className="bg-neutral-800 text-white rounded px-2 py-1 outline-none"
					autoFocus
				>
					{data.type === 'operator'
						? OPERATOR_CATEGORIES.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
						  ))
						: COMMAND_CATEGORIES.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
						  ))}
				</select>
			) : (
				<span
					className="cursor-pointer hover:text-blue-400 transition-colors"
					onClick={() => setEditingCategory(true)}
				>
					{data.category}
				</span>
			)}
				<span>/</span>
				<span className="text-white">{data.name}</span>
			</nav>
			<button
				onClick={handleOpenChat}
				className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
				title="Open Copilot Chat"
			>
				<ChatIcon className="w-4 h-4" />
				Ask Copilot
			</button>
		</div>
	);
};

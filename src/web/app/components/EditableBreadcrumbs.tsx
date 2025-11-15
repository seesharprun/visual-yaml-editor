import React from 'react';
import type { YamlData } from '../types';

interface EditableBreadcrumbsProps {
	data: YamlData;
	editingType: boolean;
	editingCategory: boolean;
	setEditingType: (editing: boolean) => void;
	setEditingCategory: (editing: boolean) => void;
	onUpdate: (data: YamlData) => void;
	onFlush: () => void;
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
	onFlush
}) => {
	return (
		<nav className="mb-6 text-sm text-gray-400 flex items-center gap-2">
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
	);
};

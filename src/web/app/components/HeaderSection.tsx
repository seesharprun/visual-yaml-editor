import React, { useState } from 'react';
import type { YamlData } from '../types';
import { EditableTextField } from './EditableTextField';
import { OptionalField } from './OptionalField';

interface HeaderSectionProps {
	data: YamlData;
	onUpdate: (data: YamlData) => void;
	onDebouncedUpdate: (data: YamlData) => void;
	onFlush: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
	data,
	onUpdate,
	onDebouncedUpdate,
	onFlush
}) => {
	const [editingName, setEditingName] = useState(false);
	const [editingDescription, setEditingDescription] = useState(false);
	const [localName, setLocalName] = useState('');
	const [localDescription, setLocalDescription] = useState('');

	return (
		<div className="mb-8">
			{/* Name */}
			<div className="mb-4">
				<EditableTextField
					value={editingName ? localName : data.name}
					isEditing={editingName}
					onEdit={() => {
						setLocalName(data.name);
						setEditingName(true);
					}}
					onSave={() => {
						onFlush();
						setEditingName(false);
					}}
					onChange={(value) => {
						setLocalName(value);
						onDebouncedUpdate({ ...data, name: value });
					}}
					placeholder="Untitled"
					className="mb-4"
					editClassName="text-5xl font-bold text-white"
					displayClassName="text-5xl font-bold text-white"
				/>
			</div>
			
			<div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full mb-6"></div>
			
			{/* Description */}
			<EditableTextField
				value={editingDescription ? localDescription : (data.description || '')}
				isEditing={editingDescription}
				onEdit={() => {
					setLocalDescription(data.description || '');
					setEditingDescription(true);
				}}
				onSave={() => {
					onFlush();
					setEditingDescription(false);
				}}
				onChange={(value) => {
					setLocalDescription(value);
					onDebouncedUpdate({ ...data, description: value });
				}}
				placeholder="Click to add description..."
				multiline={true}
				rows={3}
				className="mb-4"
				editClassName="text-gray-300 text-lg leading-relaxed"
				displayClassName="text-gray-300 text-lg leading-relaxed"
			/>
			
			{/* Summary */}
			<div className="mt-4">
				{data.summary ? (
					<div className="p-4 bg-blue-900/20 border-l-4 border-blue-500 rounded">
						<OptionalField
							label="Summary"
							value={data.summary}
							onUpdate={(value) => {
								const newData = { ...data };
								if (value) {
									newData.summary = value;
								} else {
									delete newData.summary;
								}
								onUpdate(newData);
							}}
							multiline={true}
							rows={2}
							showAddButton={false}
							placeholder="Enter summary..."
						/>
					</div>
				) : (
					<OptionalField
						label="Summary"
						value={data.summary}
						onUpdate={(value) => {
							const newData = { ...data };
							if (value) {
								newData.summary = value;
							} else {
								delete newData.summary;
							}
							onUpdate(newData);
						}}
						multiline={true}
						rows={2}
						showAddButton={true}
						placeholder="Enter summary..."
					/>
				)}
			</div>
		</div>
	);
};

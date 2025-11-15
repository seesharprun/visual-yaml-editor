import React from 'react';
import type { YamlData, Parameter } from '../types';
import { ParameterCard } from './ParameterCard';
import { DeleteIcon, AddIcon } from './Icons';

interface ParametersSectionProps {
	parameters?: Parameter[];
	onUpdate: (data: YamlData) => void;
	data: YamlData;
}

export const ParametersSection: React.FC<ParametersSectionProps> = ({
	parameters,
	onUpdate,
	data
}) => {
	if (!parameters || parameters.length === 0) {
		return null;
	}

	return (
		<section className="mb-8">
			<a className="invisible scroll-mt-24" id="parameters"></a>
			<h2 className="text-2xl font-bold text-white mb-4">Parameters</h2>
			<div className="space-y-4">
				{parameters.map((param, index) => (
					<div
						key={index}
						className="bg-neutral-800/50 backdrop-blur-sm rounded-lg border border-neutral-700/50 p-5 relative group hover:border-blue-500/50 transition-colors"
					>
						<button
							onClick={() => {
								const newParams = data.parameters?.filter((_, i) => i !== index);
								onUpdate({ ...data, parameters: newParams });
							}}
							className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-neutral-900 rounded-lg px-2 py-2 border border-neutral-700/50 hover:border-red-500/50 hover:bg-neutral-800/50 text-gray-400 hover:text-red-400"
							aria-label="Delete parameter"
						>
							<DeleteIcon />
						</button>
						<ParameterCard
							parameter={param}
							isEditMode={true}
							onUpdate={(updated) => {
								const newParams = [...(data.parameters || [])];
								newParams[index] = updated;
								onUpdate({ ...data, parameters: newParams });
							}}
						/>
					</div>
				))}
				<button
					onClick={() => {
						const newParam = { name: 'newParam', required: false, description: '' };
						onUpdate({ ...data, parameters: [...(data.parameters || []), newParam] });
					}}
					className="w-full bg-neutral-900 rounded-lg p-4 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-neutral-800/50 transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
				>
					<AddIcon />
					<span className="font-medium">Add Parameter</span>
				</button>
			</div>
		</section>
	);
};

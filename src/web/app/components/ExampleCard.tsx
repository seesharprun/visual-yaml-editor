import React from 'react';
import type { ExampleItem } from '../types';
import { CodeBlock } from './CodeBlock';

interface ExampleCardProps {
	example: ExampleItem;
	slugify: (text: string) => string;
}

export const ExampleCard: React.FC<ExampleCardProps> = ({ example, slugify }) => {
	return (
		<div className="bg-neutral-800/30 rounded-lg border border-neutral-700/50 p-6">
			<a className="invisible scroll-mt-24" id={slugify(example.title)}></a>
			<h3 className="text-xl font-semibold text-white mb-3">{example.title}</h3>
			
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

			{/* Query */}
			<div className="mb-4">
				<h4 className="text-sm font-semibold text-gray-300 mb-2">Query:</h4>
				<div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700/50 overflow-x-auto">
					<CodeBlock code={example.query} language="javascript" />
				</div>
			</div>

			{/* Output */}
			{example.output && example.output.value && example.output.value.trim() !== '' && (
				<div>
					<h4 className="text-sm font-semibold text-gray-300 mb-2">Output:</h4>
					<div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700/50 overflow-x-auto">
						<CodeBlock code={example.output.value} language="json" />
					</div>
				</div>
			)}
		</div>
	);
};

import React, { useState } from 'react';
import { CodeBlock } from './CodeBlock';

interface SyntaxSectionProps {
	syntax?: string;
	onUpdate: (syntax: string) => void;
	onFlush: () => void;
}

export const SyntaxSection: React.FC<SyntaxSectionProps> = ({
	syntax,
	onUpdate,
	onFlush
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [localSyntax, setLocalSyntax] = useState('');

	if (!syntax && !isEditing) {
		return null;
	}

	return (
		<section className="mb-8">
			<a className="invisible scroll-mt-24" id="syntax"></a>
			<h2 className="text-2xl font-bold text-white mb-4">Syntax</h2>
			{isEditing ? (
				<textarea
					value={localSyntax}
					onChange={(e) => {
						setLocalSyntax(e.target.value);
						onUpdate(e.target.value);
					}}
					onBlur={() => {
						onFlush();
						setIsEditing(false);
					}}
					className="w-full bg-neutral-900 rounded-lg p-6 border-2 border-blue-500 text-green-400 font-mono text-sm outline-none resize-vertical"
					autoFocus
					rows={6}
				/>
			) : (
				<div
					className="bg-neutral-900 rounded-lg p-6 border border-neutral-700/50 overflow-x-auto cursor-pointer hover:border-blue-500/50"
					onClick={() => {
						setLocalSyntax(syntax || '');
						setIsEditing(true);
					}}
				>
					<CodeBlock code={syntax || ''} language="javascript" />
				</div>
			)}
		</section>
	);
};

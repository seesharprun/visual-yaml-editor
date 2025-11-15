import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
	code: string;
	language?: string;
	className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
	code,
	language = 'javascript'
}) => {
	return (
		<section className="text-sm">
			<SyntaxHighlighter
				language={language}
				style={atomDark}
				customStyle={{
					margin: 0,
					padding: 0,
					background: 'transparent !important',
				}}
				codeTagProps={{
					style: {
						backgroundColor: 'transparent',
						background: 'transparent'
					}
				}}>
				{code}
			</SyntaxHighlighter>
		</section>
	);
};

import React from 'react';

interface ErrorBannerProps {
	error: string;
	onDismiss: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
	return (
		<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4 animate-fade-in">
			<div className="bg-red-900/95 border border-red-500 rounded-lg shadow-2xl backdrop-blur-sm">
				<div className="flex items-start gap-3 p-4">
					<div className="flex-shrink-0 mt-0.5">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" 
							stroke="currentColor" className="w-6 h-6 text-red-300">
							<path strokeLinecap="round" strokeLinejoin="round" 
								d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
						</svg>
					</div>
					<div className="flex-1">
						<h3 className="text-red-100 font-semibold text-sm mb-1">
							Invalid YAML Document
						</h3>
						<p className="text-red-200/90 text-sm leading-relaxed break-words">
							{error}
						</p>
						<p className="text-red-300/70 text-xs mt-2">
							Fix the errors in the text editor to restore functionality. The visual editor is temporarily disabled.
						</p>
					</div>
					<button 
						onClick={onDismiss}
						className="flex-shrink-0 text-red-300/70 hover:text-red-100 transition-colors"
						aria-label="Dismiss error"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" 
							stroke="currentColor" className="w-5 h-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

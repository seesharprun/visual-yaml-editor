import React from 'react';

interface Breadcrumb {
	label: string;
	href: string;
	current?: boolean;
	capitalize?: boolean;
}

interface BreadcrumbsProps {
	items: Breadcrumb[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
	return (
		<nav className="mb-6 text-sm text-gray-400">
			{items.map((crumb, index) => (
				<React.Fragment key={index}>
					{index > 0 && <span className="mx-2">/</span>}
					{crumb.current ? (
						<span className="text-white">{crumb.label}</span>
					) : (
						<a 
							className={`hover:text-blue-400 transition-colors ${crumb.capitalize ? 'capitalize' : ''}`}
							onClick={(e) => e.preventDefault()}
						>
							{crumb.label}
						</a>
					)}
				</React.Fragment>
			))}
		</nav>
	);
};

export const generateBreadcrumbs = (type: string, category: string, name: string) => {
	const parts = [
		{ label: 'Reference', href: '/docs/reference' },
		{ label: type === 'command' ? 'Commands' : 'Operators', href: `/docs/reference/${type}`, capitalize: true },
		{ label: category, href: `/docs/reference/${type}/${category}`, capitalize: true },
		{ label: name, href: '', current: true }
	];
	return parts;
};

export const slugify = (text: string) => {
	return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

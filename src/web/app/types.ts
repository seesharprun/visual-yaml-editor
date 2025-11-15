export interface YamlData {
	type: 'operator' | 'command';
	category: string;
	name: string;
	description?: string;
	summary?: string;
	syntax?: string;
	parameters?: Parameter[];
	examples?: Examples;
	related?: RelatedItem[];
}

export interface Parameter {
	name: string;
	type?: 'object' | 'string' | 'number' | 'pattern' | 'array' | 'expression';
	required: boolean;
	description?: string;
}

export interface Examples {
	sample?: string;
	items: ExampleItem[];
}

export interface ExampleItem {
	title: string;
	explanation?: string;
	description: string;
	query: string;
	output?: {
		value: string;
	};
}

export interface RelatedItem {
	reference: string;
}

export interface Message {
	type: string;
	text?: string;
	content?: any;
}

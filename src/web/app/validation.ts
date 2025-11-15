// @ts-ignore - generated file
import validate from './validator.generated.js';

export interface ValidationResult {
	valid: boolean;
	error?: string;
	errors?: string[];
}

export const validateYamlSchema = (data: any): ValidationResult => {
	if (!data || typeof data !== 'object') {
		return { valid: false, error: 'Document must be an object' };
	}

	const valid = validate(data);
	
	if (!valid && validate.errors) {
		const errors = validate.errors.map((err: any) => {
			const path = err.instancePath ? err.instancePath.substring(1) : 'root';
			return `${path}: ${err.message}`;
		});
		
		return {
			valid: false,
			error: errors[0],
			errors
		};
	}

	return { valid: true };
};

import React from 'react';

interface IconProps {
	className?: string;
}

export const EditIcon: React.FC<IconProps> = ({ className = "" }) => (
	<i className={`codicon codicon-edit ${className}`} />
);

export const DeleteIcon: React.FC<IconProps> = ({ className = "" }) => (
	<i className={`codicon codicon-trash ${className}`} />
);

export const AddIcon: React.FC<IconProps> = ({ className = "" }) => (
	<i className={`codicon codicon-add ${className}`} />
);

export const SaveIcon: React.FC<IconProps> = ({ className = "" }) => (
	<i className={`codicon codicon-save ${className}`} />
);

export const CancelIcon: React.FC<IconProps> = ({ className = "" }) => (
	<i className={`codicon codicon-close ${className}`} />
);

export const ChatIcon: React.FC<IconProps> = ({ className = "" }) => (
	<i className={`codicon codicon-copilot ${className}`} />
);

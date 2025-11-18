import {
	chat,
	ChatParticipant,
	ExtensionContext,
	Uri,
	ChatFollowup,
	ChatResult,
	ChatContext
} from 'vscode';

import { YamlEditorProvider } from './app/services/Provider';
import { ChatHandler } from './app/services/Chat';

// Activate the extension and register any providers or participants
export function activate(context: ExtensionContext) {

	console.log('DocumentDB - MongoDB Query Language (MQL) Reference extension is now active!');

	{ // Register the custom editor provider for YAML files

		const disposable = YamlEditorProvider.register(context);

		context.subscriptions.push(disposable);
	}

	{ // Register the chat participant with follow-up provider

		const participant: ChatParticipant = chat.createChatParticipant('documentdb-mql-reference-editor.chat-participant', ChatHandler);

		participant.iconPath = Uri.joinPath(context.extensionUri, 'assets', 'icon.png');

		// Register follow-up provider
		participant.followupProvider = {
			provideFollowups(
				result: ChatResult & { metadata?: { command?: string; success?: boolean; yamlGenerated?: boolean } },
				context: ChatContext,
				token: any
			): ChatFollowup[] {
				const followups: ChatFollowup[] = [];

				if (!result.metadata) {
					return followups;
				}

				const { command, success, yamlGenerated } = result.metadata;

				// Follow-ups based on command executed
				switch (command) {
					case 'new':
						if (success && yamlGenerated) {
							followups.push({
								prompt: 'Can you add more examples to this?',
								label: '➕ Add more examples'
							});
							followups.push({
								prompt: 'Improve the descriptions',
								label: '✍️ Improve descriptions'
							});
						} else {
							followups.push({
								prompt: '@mqlyml /fix',
								label: '🔧 Try to fix the issues'
							});
						}
						break;

					case 'fix':
						if (success) {
							followups.push({
								prompt: 'Is the YAML valid now?',
								label: '✅ Validate the fix'
							});
							followups.push({
								prompt: '@mqlyml /edit Improve the documentation quality',
								label: '📝 Copy edit the content'
							});
						}
						break;

					case 'edit':
						if (success) {
							followups.push({
								prompt: 'Add more examples',
								label: '➕ Add examples'
							});
							followups.push({
								prompt: 'Is my YAML valid?',
								label: '✅ Validate'
							});
						}
						break;

					case 'validate':
						if (!success) {
							followups.push({
								prompt: '@mqlyml /fix',
								label: '🔧 Fix validation errors'
							});
						}
						break;

					case 'general':
						if (yamlGenerated) {
							followups.push({
								prompt: 'Can you add more examples?',
								label: '➕ Add examples'
							});
							followups.push({
								prompt: 'Is this YAML valid?',
								label: '✅ Validate'
							});
						} else {
							followups.push({
								prompt: '@mqlyml /new Create a reference for $match',
								label: '📄 Generate new reference'
							});
							followups.push({
								prompt: 'What fields are required in MQL YAML?',
								label: '❓ Schema requirements'
							});
						}
						break;

					case 'help':
						followups.push({
							prompt: '@mqlyml /new Create a reference for $group',
							label: '📄 Try generating a reference'
						});
						followups.push({
							prompt: 'What are the required fields?',
							label: '❓ Learn about schema'
						});
						break;
				}

				return followups;
			}
		};

		// Register feedback handler for telemetry
		participant.onDidReceiveFeedback((feedback) => {
			// Create telemetry logger
			const logger = context.environmentVariableCollection ? 
				require('vscode').env.createTelemetryLogger({
					sendEventData(eventName: string, data: any) {
						console.log(`Event: ${eventName}`, data);
					},
					sendErrorData(error: any, data: any) {
						console.error(`Error: ${error}`, data);
					}
				}) : null;

			if (logger) {
				logger.logUsage('chatResultFeedback', {
					kind: feedback.kind,
					result: feedback.result
				});
			}

			// Log for measuring success metric
			console.log('Chat Feedback Received:', {
				kind: feedback.kind,
				timestamp: new Date().toISOString()
			});
		});

		context.subscriptions.push(participant);
	}
}

export function deactivate() { }

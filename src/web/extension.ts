import {
	chat,
	ChatParticipant,
	ExtensionContext,
	Uri,
  ChatRequestHandler,
  ChatRequest,
  ChatContext,
  ChatResponseStream,
  CancellationToken,
  ChatResult,
  LanguageModelChatMessage,
  LanguageModelChatResponse,
  l10n,
  LanguageModelError,
  TelemetryLogger,
  env
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

	{ // Register the chat participant

		const participant: ChatParticipant = chat.createChatParticipant('documentdb-mql-reference-editor.chat-participant', ChatHandler);

		participant.iconPath = Uri.joinPath(context.extensionUri, 'assets', 'icon.png');
	}
}

export function deactivate() { }

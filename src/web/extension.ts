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

		const handler: ChatRequestHandler = async (
			request: ChatRequest,
			context: ChatContext,
			stream: ChatResponseStream,
			token: CancellationToken
		) => {

			// Greet user
			stream.progress('Starting...');
			stream.markdown('Hello from MQL YAML!');

			// Generic prompt
			/*const prompt: string = 'You are a helpful math tutor. Your job is to answer math questions and provide a brief visual explanation of how you calculated the answer.';

			const messages: LanguageModelChatMessage[] = [
				LanguageModelChatMessage.User(prompt),
				LanguageModelChatMessage.User(request.prompt)
			];

			const response: LanguageModelChatResponse = await request.model.sendRequest(messages, {}, token);

			for await (const fragment of response.text) {
				stream.markdown(fragment);
			}*/

			return;
		};

		const participant: ChatParticipant = chat.createChatParticipant('documentdb-mql-reference-editor.chat-participant', handler);

		participant.iconPath = Uri.joinPath(context.extensionUri, 'assets', 'icon.png');

		context.subscriptions.push(participant);
	}
}

export function deactivate() { }

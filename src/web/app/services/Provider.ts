import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

/**
 * Provider for YAML visual editors.
 * 
 * This provider creates custom editors for .yaml files using VS Code's CustomTextEditorProvider API.
 * It synchronizes changes between the YAML text document and a webview-based visual editor.
 */
export class YamlEditorProvider implements vscode.CustomTextEditorProvider {
	
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new YamlEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(
			YamlEditorProvider.viewType, 
			provider,
			{
				webviewOptions: {
					retainContextWhenHidden: true,
				},
				supportsMultipleEditorsPerDocument: true,
			}
		);
		return providerRegistration;
	}

	private static readonly viewType = 'documentdbmqlreference.editor';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	/**
	 * Called when a custom editor is opened.
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		// Function to update webview based on document changes
		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'ready':
					// Webview is ready, send initial content
					updateWebview();
					return;
				case 'update':
					this.updateTextDocument(document, e.content);
					return;
				case 'openChat':
					// Open Copilot chat with the mqlyml participant
					vscode.commands.executeCommand('workbench.action.chat.open', '@mqlyml ');
					return;
			}
		});
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'dist', 'web', 'webview.js'));

		// Codicon font URI - using VS Code's built-in codicon font
		const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
					img-src ${webview.cspSource} https:; 
					font-src ${webview.cspSource};
					script-src 'nonce-${nonce}'; 
					style-src ${webview.cspSource} 'unsafe-inline';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${codiconsUri}" rel="stylesheet" />
				<title>YAML Visual Editor</title>
				<style>
					body {
						margin: 0;
						padding: 0;
						overflow-x: hidden;
					}
					#root {
						min-height: 100vh;
					}
				</style>
			</head>
			<body>
				<div id="root"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	/**
	 * Try to update the text document with the new YAML content from the webview.
	 */
	private updateTextDocument(document: vscode.TextDocument, content: any) {
		const edit = new vscode.WorkspaceEdit();

		// Convert the content to YAML
		const yamlText = yaml.dump(content, {
			indent: 2,
			lineWidth: -1,
			noRefs: true,
		});

		// Replace the entire document
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			yamlText
		);

		return vscode.workspace.applyEdit(edit);
	}
}

function getNonce(): string {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
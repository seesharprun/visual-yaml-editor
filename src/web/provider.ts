import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import { getNonce } from './util';

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

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
					img-src ${webview.cspSource} https:; 
					script-src 'nonce-${nonce}'; 
					style-src ${webview.cspSource} 'unsafe-inline';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
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

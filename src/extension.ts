// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		if (!vscode.window.activeTextEditor) {
			console.log('No active editor, returning');
			return;
		}

		const allSelections = vscode.window.activeTextEditor.selections;

		// We remove selections that span multiple lines
		const selections = allSelections.filter(selection => selection.isSingleLine);

		if (selections.length == 0) {
			console.log('No valid selections, returning');
			return;
		}

		const snippetString = makeSnippetString(vscode.window.activeTextEditor.document, selections);
		const selectionRange = getSelectionRange(selections);
		vscode.window.activeTextEditor.edit(builder => {
			builder.delete(selectionRange);
		}).then(() => {
			vscode.window.activeTextEditor?.insertSnippet(snippetString, selectionRange.start);
		})
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

/* Utility Functions */
function selectionComparator(a: vscode.Selection, b: vscode.Selection) : number {
	if (a.start.line == b.start.line) {
		return a.start.character - b.start.character;
	}
	return a.start.line - b.start.line;
}

function makeSnippetString(document: vscode.TextDocument, selections: vscode.Selection[]): vscode.SnippetString {
	const sortedSelections = [...selections].sort(selectionComparator);

	// `chunks` is text that alternates between selections and nonselections, starting with selections.
	// It should always be an odd length (bookended by selection chunks).
	const chunks = [];
	let placeholderIndex = 1;
	for (let i = 0; i < sortedSelections.length; i++) {
		const selection = sortedSelections[i];
		const placeholderRawText = document.getText(selection);
		const placeholderText = makePlaceholderText(placeholderIndex++, placeholderRawText);
		chunks.push(placeholderText);

		if (i + 1 < sortedSelections.length) {
			const nextSelection = selections[i + 1];
			const vanillaText = document.getText(new vscode.Range(selection.end, nextSelection.start));
			chunks.push(vanillaText);
		}
	}

	const finalText = chunks.join("");

	return new vscode.SnippetString(finalText);
}

// Format per https://code.visualstudio.com/docs/editor/userdefinedsnippets#_create-your-own-snippets
function makePlaceholderText(index: number, rawText: string): string {
	return '${' + index + ":" + rawText + '}';
}

function getSelectionRange(selections: vscode.Selection[]): vscode.Range {

	let min = selections[0];
	let max = selections[0];

	selections.forEach(selection => {
		if (selection.start.isBefore(min.start)) {
			min = selection;
		}
		if (selection.end.isAfter(max.end)) {
			max = selection;
		}
	});

	return new vscode.Range(min.start, max.end);
}
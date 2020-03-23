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

		const selections = vscode.window.activeTextEditor?.selections;

		if (!selections) {
			console.log('No selection, returning');
			return;
		}

		const isSingleSelection = selections.length == 1;
		if (isSingleSelection) {
			console.log('Only one selection found, returning');
			return;
		}

		const log = (sels: vscode.Selection[] | undefined) => {
			console.log(sels?.map(selection => `Ln ${selection.start.line}, Col ${selection.start.character} to Ln ${selection.end.line}, Col ${selection.end.character}`));
		}
		log(selections);

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

		console.log({ min, max });

		const region = { start: min.start, end: max.end };
		console.log(region);

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

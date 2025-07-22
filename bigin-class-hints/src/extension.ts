import * as vscode from 'vscode';
import * as path from 'path';
import { extractClassNamesFromLess } from './lessParser';

export function activate(context: vscode.ExtensionContext) {
  const lessFiles = [
    path.join(vscode.workspace.rootPath || '', 'css/bigin-less-styles/layout/core/base/base.less'),
    path.join(vscode.workspace.rootPath || '', 'css/bigin-less-styles/layout/core/base/ignite-common.less'),
  ];

  //Deduplicated class names
  let classNames = Array.from(new Set(
    lessFiles.flatMap(extractClassNamesFromLess)
  ));
  console.log("Loaded unique class names from multiple LESS files:", classNames);

  const lessWatchers = lessFiles.map(file =>
    vscode.workspace.createFileSystemWatcher(file)
  );

  lessWatchers.forEach(watcher => {
    watcher.onDidChange(() => {
      classNames = Array.from(new Set(
        lessFiles.flatMap(extractClassNamesFromLess)
      ));
      console.log("Reloaded unique class names after LESS change");
    });
    context.subscriptions.push(watcher);
  });

  console.log("Extension activated");

  const provider = vscode.languages.registerCompletionItemProvider(
    ['html', 'javascriptreact', 'typescriptreact'],
    {
      provideCompletionItems(document, position) {
        const line = document.lineAt(position).text.substring(0, position.character);
        const insideClassAttr = /\bclass(Name)?\s*=\s*["'][^"']*$/;
        if (!insideClassAttr.test(line)) return;

        return classNames.map(cls => {
          const item = new vscode.CompletionItem(cls, vscode.CompletionItemKind.Keyword);
          item.insertText = cls;
          return item;
        });
      }
    },
    '"', ' '
  );

  context.subscriptions.push(provider);
}

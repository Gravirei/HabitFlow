/**
 * Type-only import guard.
 *
 * Under verbatimModuleSyntax, a value-style `import { X }` of a type-only
 * export survives into the emitted JS and crashes the browser at module load
 * ("does not provide an export named 'X'") — a blank white screen. tsc cannot
 * flag these inside @ts-nocheck ledger files, so this script walks the whole
 * program with the type checker and fails on any value-import of a pure type.
 *
 * Background: this exact bug shipped to dev on 2026-08-25 (useHabitStore's
 * non-type Habit import broke the entire app bundle).
 */
const ts = require('typescript');
const path = require('path');

const root = path.join(__dirname, '..');
const cfg = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, root);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();

let bad = [];
for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile) continue;
  const rel = path.relative(root, sf.fileName);
  if (!rel.startsWith('src/')) continue;
  ts.forEachChild(sf, (node) => {
    if (!ts.isImportDeclaration(node) || !node.importClause) return;
    // skip whole `import type`
    if (node.importClause.isTypeOnly) return;
    const named = node.importClause.namedBindings;
    if (!named || !ts.isNamedImports(named)) return;
    let modFile = null;
    try {
      const resolved = ts.resolveModuleName(
        node.moduleSpecifier.text, sf.fileName, parsed.options, ts.sys
      );
      if (!resolved.resolvedModule) return;
      modFile = program.getSourceFile(resolved.resolvedModule.resolvedFileName);
    } catch { return; }
    if (!modFile || modFile.isDeclarationFile) return;
    const sym = checker.getSymbolAtLocation(modFile);
    if (!sym) return;
    const exports = checker.getExportsOfModule(sym);
    for (const el of named.elements) {
      if (el.isTypeOnly) continue;
      const name = el.propertyName ? el.propertyName.text : el.name.text;
      const exp = exports.find((e) => e.name === name);
      if (!exp) {
        bad.push(`${rel}: '${name}' not exported by ${node.moduleSpecifier.text}`);
        continue;
      }
      const flags = exp.getFlags();
      const isValue = !!(flags & (ts.SymbolFlags.Value | ts.SymbolFlags.Function | ts.SymbolFlags.Class |
        ts.SymbolFlags.Enum | ts.SymbolFlags.ConstEnum | ts.SymbolFlags.RegularEnum | ts.SymbolFlags.Alias));
      const isInterfaceOrType = !!(flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias));
      if (!isValue && isInterfaceOrType) {
        bad.push(`${rel}:${el.name.getStart(sf)}: '${name}' is type-only in ${node.moduleSpecifier.text}`);
      }
    }
  });
}
if (bad.length) {
  console.error(`✖ ${bad.length} value-import(s) of type-only exports found:\n`);
  console.error(bad.map((b) => '  ' + b).join('\n'));
  console.error('\nFix: use `import type { X }` or the inline `type` modifier.');
  process.exit(1);
}
console.log('✔ No value-imports of type-only exports.');

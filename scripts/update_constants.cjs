const fs = require('fs');
const path = require('path');

// Repo root, resolved from this script's location — runnable from any cwd.
const ROOT = path.resolve(__dirname, '..');

const constants = fs.readFileSync(path.join(ROOT, 'src/features/social/constants.ts'), 'utf-8');
const generated = fs.readFileSync(path.join(ROOT, 'leagues_output.txt'), 'utf-8');

const configsMatch = generated.match(/export const LEAGUE_CONFIGS: LeagueConfig\[\] = \[\s*[\s\S]*?\];/);
const colorsMatch = generated.match(/const colors: Record<string, string> = {[\s\S]*?};/);
const gradientsMatch = generated.match(/const gradients: Record<string, string> = {[\s\S]*?};/);

let newConstants = constants;

// Replace LEAGUE_CONFIGS
newConstants = newConstants.replace(
  /export const LEAGUE_CONFIGS: LeagueConfig\[\] = \[\s*[\s\S]*?\]/,
  configsMatch[0]
);

// Replace colors in getLeagueTierColor
newConstants = newConstants.replace(
  /const colors: Record<string, string> = {[\s\S]*?}/,
  colorsMatch[0]
);
newConstants = newConstants.replace(/colors\.bronze/g, 'colors.reis');

// Replace gradients in getLeagueTierGradient
newConstants = newConstants.replace(
  /const gradients: Record<string, string> = {[\s\S]*?}/,
  gradientsMatch[0]
);
newConstants = newConstants.replace(/gradients\.bronze/g, 'gradients.reis');

fs.writeFileSync(path.join(ROOT, 'src/features/social/constants.ts'), newConstants);
console.log("Updated constants.ts");

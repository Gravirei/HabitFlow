const spells = [
  // Brago
  "reis", "gravirei", "gigano_reis", "ion_gravirei", "rioru_reis", "oruga_reis", "baber_gravidon", "dioga_gravidon", "diborudo_jii_gravidon", "nyuborutsu_ma_gurabirei", "nyuborutsu_shin_gurabirei", "berudo_gravirei", "bidom_gravirei", "kueaborutsu_gravirei", "digou_gurabiruku", "shin_baberuga_gravidon",
  // Zatch
  "zaker", "zakeruga", "teozaker", "ganreizu_zakeru", "rashirudo", "jikerudo", "maazu_jikerudon", "rauzaruku", "zaguruzemu", "bao_zakeruga", "baou_kurou_disugurugu", "jiou_renzu_zakeruga", "shin_beruwan_bao_zakeruga", "barudo_forusu",
  // Tio
  "seoshi", "ma_seshield", "giga_la_seoshi", "chajiru_seshieldon", "rima_chajiru_seshieldon", "saifojio", "shin_saifojio", "saisu", "gigano_saisu", "chajiru_saifodon",
  // Clear Note
  "radisu", "rajia_radisu", "teoradisu", "ba_radisu", "giru_ranzu_radisu", "dioga_ranzu_radisu", "ranzu_radisu", "supurifo", "ba_supurifo", "qua_supurifo", "shin_kuria_seunousu", "ria_uruku"
];

function formatLabel(str) {
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Just generate a bunch of gradients and hex colors for them.
const tailwindColors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];

let configs = `export const LEAGUE_CONFIGS: LeagueConfig[] = [\n`;
let colors = `const colors: Record<string, string> = {\n`;
let gradients = `const gradients: Record<string, string> = {\n`;

let xp = 0;
for (let i = 0; i < spells.length; i++) {
  const tier = spells[i];
  const label = formatLabel(tier) + ' League';
  const cIndex = i % tailwindColors.length;
  const colorName = tailwindColors[cIndex];
  
  // Just use a simple color hex map for approximation, or we can just return tailwind colors if they are used as hex? 
  // Wait, the existing code uses hex values. Let's just generate random or progressive hex values.
  
  // Let's create specific palettes based on characters.
  let hex, grad;
  let icon = 'shield';
  if (i < 16) {
    // Brago: Dark, Purple, Black
    const shade = Math.floor(i/16 * 100);
    hex = `#${(100+shade).toString(16)}00${(200+shade).toString(16)}`; // purplish
    grad = `from-purple-${500 + (i%4)*100} to-fuchsia-${600 - (i%3)*100}`;
    icon = 'dark_mode';
  } else if (i < 30) {
    // Zatch: Yellow, Orange, Electric
    const relI = i - 16;
    hex = `#FF${(200 - relI*5).toString(16)}00`;
    grad = `from-yellow-${400 + (relI%4)*100} to-amber-${500 - (relI%3)*100}`;
    icon = 'bolt';
  } else if (i < 40) {
    // Tio: Pink, Red, Healing
    const relI = i - 30;
    hex = `#FF${(100 + relI*10).toString(16)}${(150 + relI*10).toString(16)}`;
    grad = `from-pink-${400 + (relI%4)*100} to-rose-${500 - (relI%3)*100}`;
    icon = 'favorite';
  } else {
    // Clear Note: White, Gray, Pale
    const relI = i - 40;
    hex = `#${(200 + relI*4).toString(16)}${(200 + relI*4).toString(16)}${(200 + relI*4).toString(16)}`;
    grad = `from-slate-${300 + (relI%4)*100} to-gray-${400 - (relI%3)*100}`;
    icon = 'auto_awesome';
  }

  configs += `  {
    tier: '${tier}',
    label: '${label}',
    icon: '${icon}',
    color: '${hex}',
    gradient: '${grad}',
    minXP: ${xp},
    usersPerLeague: 30,
    promoteCount: ${i === spells.length - 1 ? 0 : 5},
    demoteCount: ${i === 0 ? 0 : 5},
  },\n`;
  
  colors += `  '${tier}': '${hex}',\n`;
  gradients += `  '${tier}': '${grad}',\n`;
  
  xp += 100 + (i * 50); // Progressively harder
}

configs += `];\n`;
colors += `};\n`;
gradients += `};\n`;

console.log("TIERS");
console.log(spells.map(s => `'${s}'`).join(' | '));
console.log(configs);
console.log(colors);
console.log(gradients);

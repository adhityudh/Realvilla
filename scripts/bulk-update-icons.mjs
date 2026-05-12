import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesDir = path.resolve(__dirname, '../sanity/schemaTypes/modules');

const iconMap = {
  'aboutSection.ts': 'InfoOutlineIcon',
  'buyHeroSection.ts': 'DashboardIcon',
  'buyPropertiesSection.ts': 'HomeIcon',
  'contactSection.ts': 'EnvelopeIcon',
  'heroSection.ts': 'PresentationIcon',
  'mortgageFAQSection.ts': 'HelpCircleIcon',
  'partnerSection.ts': 'UsersIcon',
  'propertiesSection.ts': 'ThLargeIcon',
  'splashIntro.ts': 'SparklesIcon',
  'testimonialsSection.ts': 'HeartIcon',
  'valuationSection.ts': 'TrendUpwardIcon'
};

for (const [filename, iconName] of Object.entries(iconMap)) {
  const filePath = path.join(modulesDir, filename);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has icon import
  if (content.includes('@sanity/icons')) {
    continue;
  }

  // 1. Inject import
  content = `import { ${iconName} } from '@sanity/icons'\n` + content;

  // 2. Inject icon: IconName, after type: 'object',
  const target = "type: 'object',";
  if (content.includes(target)) {
    content = content.replace(target, `${target}\n  icon: ${iconName},`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Successfully updated ${filename} with ${iconName}`);
  } else {
    console.log(`Failed target match for ${filename}`);
  }
}

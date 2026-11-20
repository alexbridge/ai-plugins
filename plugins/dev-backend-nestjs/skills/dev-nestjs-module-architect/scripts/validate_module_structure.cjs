const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];
const modulesRoot = process.argv[3] || 'src/modules';
if (!moduleName) {
  console.log('Usage: node validate_module_structure.cjs <module-name> [modules-root]');
  process.exit(1);
}

const modulePath = path.resolve(process.cwd(), modulesRoot, moduleName);

if (!fs.existsSync(modulePath)) {
  console.log(`Error: Module '${moduleName}' not found in ${modulesRoot}`);
  process.exit(1);
}

const requiredDirs = ['api', 'domain', 'services', 'config'];
const missingDirs = requiredDirs.filter((dir) => !fs.existsSync(path.join(modulePath, dir)));

const moduleFile = path.join(modulePath, `${moduleName}.module.ts`);
if (!fs.existsSync(moduleFile)) {
  console.log(`Warning: Main module file '${moduleName}.module.ts' is missing.`);
}

if (missingDirs.length > 0) {
  console.log(`Module '${moduleName}' is missing directories: ${missingDirs.join(', ')}`);
  process.exit(1);
}
console.log(`Module '${moduleName}' structure is valid.`);

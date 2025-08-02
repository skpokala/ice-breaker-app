#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function incrementVersion(version, type = 'patch') {
  const parts = version.split('.');
  let [major, minor, patch] = parts.map(Number);

  switch (type) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
    default:
      patch++;
      break;
  }

  return `${major}.${minor}.${patch}`;
}

function updatePackageVersion(packagePath, newVersion) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const oldVersion = packageJson.version;
    packageJson.version = newVersion;
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated ${packagePath}: ${oldVersion} -> ${newVersion}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${packagePath}:`, error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const incrementType = args[0] || 'patch'; // patch, minor, major

  // Read root package.json version
  const rootPackagePath = path.join(process.cwd(), 'package.json');
  
  try {
    const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
    const currentVersion = rootPackage.version;
    const newVersion = incrementVersion(currentVersion, incrementType);

    console.log(`🚀 Incrementing version from ${currentVersion} to ${newVersion}`);

    // Update all package.json files
    const packagesToUpdate = [
      rootPackagePath,
      path.join(process.cwd(), 'frontend', 'package.json'),
      path.join(process.cwd(), 'backend', 'package.json')
    ];

    let allSuccess = true;
    packagesToUpdate.forEach(packagePath => {
      if (fs.existsSync(packagePath)) {
        const success = updatePackageVersion(packagePath, newVersion);
        allSuccess = allSuccess && success;
      }
    });

    // Update version.json for frontend consumption
    const versionInfo = {
      version: newVersion,
      buildDate: new Date().toISOString(),
      buildNumber: Date.now()
    };

    const versionJsonPath = path.join(process.cwd(), 'frontend', 'public', 'version.json');
    fs.writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 2));
    console.log(`📝 Created version.json: ${newVersion}`);

    if (allSuccess) {
      console.log(`✅ Successfully updated all packages to version ${newVersion}`);
      process.exit(0);
    } else {
      console.log('❌ Some packages failed to update');
      process.exit(1);
    }

  } catch (error) {
    console.error('Error reading root package.json:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { incrementVersion, updatePackageVersion }; 
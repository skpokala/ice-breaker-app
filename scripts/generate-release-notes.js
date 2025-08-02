#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn(`Warning: Command failed: ${command}`);
    return '';
  }
}

function getGitCommitsSinceLastTag() {
  try {
    // Get the last tag
    const lastTag = executeCommand('git describe --tags --abbrev=0');
    
    if (lastTag) {
      // Get commits since last tag
      return executeCommand(`git log ${lastTag}..HEAD --pretty=format:"%h|%s|%an|%ad" --date=short`);
    } else {
      // If no tags, get all commits
      return executeCommand('git log --pretty=format:"%h|%s|%an|%ad" --date=short');
    }
  } catch (error) {
    // Fallback to recent commits
    return executeCommand('git log -10 --pretty=format:"%h|%s|%an|%ad" --date=short');
  }
}

function parseCommits(commitString) {
  if (!commitString) return [];
  
  return commitString.split('\n').map(line => {
    const [hash, subject, author, date] = line.split('|');
    return {
      hash: hash?.trim(),
      subject: subject?.trim(),
      author: author?.trim(),
      date: date?.trim()
    };
  }).filter(commit => commit.hash && commit.subject);
}

function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    improvements: [],
    chores: [],
    breaking: []
  };

  commits.forEach(commit => {
    const subject = commit.subject.toLowerCase();
    
    if (subject.includes('breaking') || subject.includes('breaking change')) {
      categories.breaking.push(commit);
    } else if (subject.startsWith('feat') || subject.includes('feature') || subject.includes('add ')) {
      categories.features.push(commit);
    } else if (subject.startsWith('fix') || subject.includes('bug') || subject.includes('resolve')) {
      categories.fixes.push(commit);
    } else if (subject.startsWith('improve') || subject.includes('enhance') || subject.includes('update')) {
      categories.improvements.push(commit);
    } else if (!subject.includes('version bump') && !subject.includes('chore: version')) {
      categories.chores.push(commit);
    }
  });

  return categories;
}

function generateReleaseNotes(version, categories, stats) {
  const date = new Date().toISOString().split('T')[0];
  
  let notes = `# Release ${version}\n\n`;
  notes += `**Release Date:** ${date}\n\n`;
  
  if (stats.totalCommits > 0) {
    notes += `**Changes:** ${stats.totalCommits} commits by ${stats.uniqueAuthors.length} contributor${stats.uniqueAuthors.length !== 1 ? 's' : ''}\n\n`;
  }

  // Breaking Changes
  if (categories.breaking.length > 0) {
    notes += `## 🚨 Breaking Changes\n\n`;
    categories.breaking.forEach(commit => {
      notes += `- ${commit.subject} (${commit.hash})\n`;
    });
    notes += '\n';
  }

  // Features
  if (categories.features.length > 0) {
    notes += `## ✨ New Features\n\n`;
    categories.features.forEach(commit => {
      notes += `- ${commit.subject} (${commit.hash})\n`;
    });
    notes += '\n';
  }

  // Bug Fixes
  if (categories.fixes.length > 0) {
    notes += `## 🐛 Bug Fixes\n\n`;
    categories.fixes.forEach(commit => {
      notes += `- ${commit.subject} (${commit.hash})\n`;
    });
    notes += '\n';
  }

  // Improvements
  if (categories.improvements.length > 0) {
    notes += `## 🚀 Improvements\n\n`;
    categories.improvements.forEach(commit => {
      notes += `- ${commit.subject} (${commit.hash})\n`;
    });
    notes += '\n';
  }

  // Other Changes
  if (categories.chores.length > 0) {
    notes += `## 🔧 Other Changes\n\n`;
    categories.chores.forEach(commit => {
      notes += `- ${commit.subject} (${commit.hash})\n`;
    });
    notes += '\n';
  }

  if (stats.uniqueAuthors.length > 0) {
    notes += `## 👥 Contributors\n\n`;
    stats.uniqueAuthors.forEach(author => {
      const authorCommits = stats.authorCounts[author];
      notes += `- ${author} (${authorCommits} commit${authorCommits !== 1 ? 's' : ''})\n`;
    });
    notes += '\n';
  }

  return notes;
}

function updateReleasesJson(version, releaseNotes, categories) {
  const releasesJsonPath = path.join(process.cwd(), 'frontend', 'public', 'releases.json');
  
  let releases = [];
  if (fs.existsSync(releasesJsonPath)) {
    try {
      releases = JSON.parse(fs.readFileSync(releasesJsonPath, 'utf8'));
    } catch (error) {
      console.warn('Could not parse existing releases.json, starting fresh');
      releases = [];
    }
  }

  const newRelease = {
    version,
    date: new Date().toISOString(),
    notes: releaseNotes,
    summary: {
      features: categories.features.length,
      fixes: categories.fixes.length,
      improvements: categories.improvements.length,
      breaking: categories.breaking.length,
      total: Object.values(categories).reduce((sum, arr) => sum + arr.length, 0)
    },
    commits: Object.values(categories).flat().map(commit => ({
      hash: commit.hash,
      subject: commit.subject,
      author: commit.author,
      date: commit.date
    }))
  };

  // Add to beginning of array (newest first)
  releases.unshift(newRelease);

  // Keep only last 50 releases
  releases = releases.slice(0, 50);

  fs.writeFileSync(releasesJsonPath, JSON.stringify(releases, null, 2));
  console.log(`📝 Updated releases.json with ${releases.length} releases`);

  return newRelease;
}

function main() {
  const args = process.argv.slice(2);
  const version = args[0];

  if (!version) {
    console.error('❌ Please provide a version number');
    process.exit(1);
  }

  console.log(`📋 Generating release notes for version ${version}...`);

  try {
    // Get commits since last version
    const commitString = getGitCommitsSinceLastTag();
    const commits = parseCommits(commitString);
    
    if (commits.length === 0) {
      console.log('ℹ️  No commits found for release notes');
      return;
    }

    // Categorize commits
    const categories = categorizeCommits(commits);
    
    // Calculate stats
    const stats = {
      totalCommits: commits.length,
      uniqueAuthors: [...new Set(commits.map(c => c.author))],
      authorCounts: commits.reduce((acc, commit) => {
        acc[commit.author] = (acc[commit.author] || 0) + 1;
        return acc;
      }, {})
    };

    // Generate release notes
    const releaseNotes = generateReleaseNotes(version, categories, stats);
    
    // Update releases.json
    const release = updateReleasesJson(version, releaseNotes, categories);

    // Display summary
    console.log('\n🎉 Release Summary:');
    console.log(`Version: ${version}`);
    console.log(`Features: ${categories.features.length}`);
    console.log(`Bug Fixes: ${categories.fixes.length}`);
    console.log(`Improvements: ${categories.improvements.length}`);
    console.log(`Other Changes: ${categories.chores.length}`);
    if (categories.breaking.length > 0) {
      console.log(`⚠️  Breaking Changes: ${categories.breaking.length}`);
    }
    console.log(`Total Commits: ${commits.length}`);
    console.log(`Contributors: ${stats.uniqueAuthors.join(', ')}`);

    // Save detailed notes to file
    const notesPath = path.join(process.cwd(), 'RELEASE_NOTES.md');
    fs.writeFileSync(notesPath, releaseNotes);
    console.log(`\n📄 Detailed release notes saved to: ${notesPath}`);

    return release;

  } catch (error) {
    console.error('❌ Error generating release notes:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateReleaseNotes, categorizeCommits, parseCommits }; 
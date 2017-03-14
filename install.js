// 'use strict';

//
// Compatibility with older node.js as path.exists got moved to `fs`.
//
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = path.resolve(__dirname, '.');
const exists = fs.existsSync || path.existsSync;

//
// Gather the location of the possible hidden .git directory, the hooks
// directory which contains all git hooks and the absolute location of the
// `pre-commit` file. The path needs to be absolute in order for the symlinking
// to work correctly.
//
const git = path.resolve(root, '.git');
const hooks = path.resolve(git, 'hooks');
const precommit = path.resolve(hooks, 'pre-commit');

//
// Bail out if we don't have an `.git` directory as the hooks will not get
// triggered. If we do have directory create a hooks folder if it doesn't exist.
//
if (!exists(git)) {
  process.exit(1);
} else if (fs.lstatSync(git).isDirectory()) {
  // Do nothing.
  console.log('');
} else if (fs.lstatSync(git).isFile()) {
  const dotgit = fs.readFileSync('.git', 'utf8');
  const re = /gitdir:\s(.+)\.git.*/;
  const found = dotgit.match(re);
  if (found === null) {
    process.exit(1);
  }
  const parentdotgit = `${found[1]}.git`;
  if (!exists(parentdotgit)) {
    process.exit(1);
  } else {
    fs.renameSync('.git', '.gitpath');
    cp.execSync(`ln -s ${parentdotgit} .git`);
    process.exit(0);
  }
} else {
  process.exit(1);
}
if (!exists(hooks)) fs.mkdirSync(hooks);

//
// If there's an existing `pre-commit` hook we want to back it up instead of
// overriding it and losing it completely as it might contain something
// important.
//
if (exists(precommit) && !fs.lstatSync(precommit).isSymbolicLink()) {
  console.log('pre-commit:');
  console.log('pre-commit: Detected an existing git pre-commit hook');
  fs.writeFileSync(precommit.concat('.old'), fs.readFileSync(precommit));
  console.log('pre-commit: Old pre-commit hook backuped to pre-commit.old');
  console.log('pre-commit:');
}

//
// We cannot create a symlink over an existing file so make sure it's gone and
// finish the installation process.
//
try {
  fs.unlinkSync(precommit);
} catch (e) {
  console.error('Failed to remove precommit file');
}

const precommitContent = fs.readFileSync('pre-commit-template');

//
// It could be that we do not have rights to this folder which could cause the
// installation of this module to completely fail. We should just output the
// error instead destroying the whole npm install process.
//
try {
  const options = { mode: '0755' };
  fs.writeFileSync(precommit, precommitContent, options);
} catch (e) {
  console.error('pre-commit:');
  console.error('pre-commit: Failed to create the hook file in your .git/hooks folder because:');
  console.error('pre-commit: '.concat(e.message));
  console.error('pre-commit: The hook was not installed.');
  console.error('pre-commit:');
}

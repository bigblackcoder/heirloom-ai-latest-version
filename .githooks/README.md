# Git Hooks for Heirloom Identity Platform

This directory contains Git hooks that help enforce security and code quality standards.

## Setting up the hooks

To set up the Git hooks, run the following commands from the project root:

```bash
# Tell Git to use the hooks in this directory
git config core.hooksPath .githooks

# Make sure the hooks are executable
chmod +x .githooks/pre-commit
```

This should be done automatically when you run `npm install` as it's part of the postinstall script, but this provides a manual option if needed.

## Available Hooks

### pre-commit

The pre-commit hook checks for:

1. Hard-coded credentials like AWS access keys
2. API keys, passwords, and tokens
3. Private keys and certificates

If any of these are found, the commit will be blocked with a warning message.

## Bypassing hooks

**NOT RECOMMENDED**: In rare cases, you may need to bypass the hooks. You can do this by using the `--no-verify` flag:

```bash
git commit --no-verify -m "Your commit message"
```

Only do this if you're absolutely certain that your commit doesn't contain any sensitive information.

## Adding or Modifying Hooks

If you need to add or modify hooks:

1. Update the relevant file in this directory
2. Make sure the hook is executable (`chmod +x .githooks/hook-name`)
3. Test the hook to ensure it works as expected
4. Document the changes in this README file
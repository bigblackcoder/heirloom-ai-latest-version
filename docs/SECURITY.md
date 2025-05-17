# Security Best Practices

This document outlines the security best practices for the Heirloom Identity Platform project, with a particular focus on credentials and secrets management.

## Handling Credentials and Secrets

### Never Hard-code Credentials

**IMPORTANT**: Never hard-code credentials, API keys, or other secrets directly in your code, including:
- Source code files
- Configuration files
- SVG or image files (via embedded metadata)
- HTML files
- JSON files

### Using Environment Variables

Always use environment variables for all credentials and sensitive information:

1. Create a `.env` file locally (this should never be committed to version control)
2. Copy the template from `.env.example` and add your actual credentials
3. In your code, access these values via `process.env.VARIABLE_NAME`

Example:
```javascript
// GOOD - Accessing a secret via environment variable
const apiKey = process.env.AWS_ACCESS_KEY_ID;

// BAD - Hard-coding a secret
const apiKey = "AKIAIOSFODNN7EXAMPLE"; // Never do this!
```

### Environment Variable Setup

1. For local development, create a `.env` file in the project root
2. For production, set environment variables in your deployment environment
3. Never commit `.env` files to version control (they're already in `.gitignore`)

## Pre-commit Hooks

We've set up a pre-commit hook to help prevent accidental credential leaks:

1. The hook is located in `.githooks/pre-commit`
2. It will check for common credential patterns before allowing commits
3. If credentials are found, the commit will be blocked with an error message
4. To bypass the hook (USE WITH CAUTION): `git commit --no-verify`

## Scanning for Credentials

To scan the codebase for potential credential leaks:

```bash
./scripts/scan-credentials.sh
```

This will:
- Check all files for common credential patterns
- Report any potential credentials found
- Look for specific patterns identified in security scans

## Rotating Credentials

If you discover that credentials have been compromised:

1. Immediately invalidate/rotate the compromised credentials
2. Update the new credentials in your environment variables
3. Check for any unauthorized usage
4. Document the incident and take preventive measures

## AWS Credentials Best Practices

When working with AWS:

1. Use IAM roles with the principle of least privilege
2. Generate temporary credentials when possible
3. Regularly rotate access keys
4. Consider using AWS Secrets Manager for storing secrets
5. Enable MFA for AWS accounts
6. Use AWS-provided SDKs which support credential providers

## Reporting Security Issues

If you discover a security vulnerability:

1. Do not create a public GitHub issue
2. Contact the security team directly at [security@example.com] 
3. Provide details of the vulnerability
4. Do not disclose the issue publicly until it has been addressed

## Regular Security Audits

Schedule regular security audits to:

1. Scan for credentials in the codebase
2. Review access control policies
3. Update dependencies to patch known vulnerabilities
4. Review and update security documentation
# Heirloom Blockchain Contracts

This directory contains smart contracts for the Heirloom Identity Platform.

## Contract Structure

### Core Contracts

- **SimpleHIT.sol** - Heirloom Identity Token that represents a user's digital identity.
- **PRVNToken.sol** - Provenance Token for managing data provenance and access control.
- **LicenseManager.sol** - Manages licensing terms, royalties, and access permissions.

### Modules

- **MetadataManagement.sol** - Handles metadata updates and history for identity tokens.
- **HITLinking.sol** - Manages relationships between HITs and PRVNs.
- **AccessManagement.sol** - Controls access permissions to digital assets.
- **GovernanceModule.sol** - Provides governance capabilities through proposals and voting.

### Interfaces

- **IHIT.sol** - Interface for the Heirloom Identity Token contract.
- **IPRVNToken.sol** - Interface for the Provenance Token contract.

## Deployment Details

The contracts are deployed on the Polygon Amoy Testnet (chainId: 80002).

## Key Features

- **Identity Management** - Non-transferrable identity tokens (HITs) that represent a user's digital identity.
- **Asset Provenance** - PRVNs that track the provenance and ownership of digital assets.
- **License Management** - Tools for creating, managing, and enforcing licenses.
- **Access Control** - Granular permissions for accessing digital assets and identity information.
- **Metadata Management** - Controlled updates to identity and asset metadata.
- **Governance** - Decentralized decision-making for identity platform management.

## Security Features

- Role-based access control
- Non-transferrable identity tokens
- Time-limited access grants
- Gas-limited operations
- Reentrancy protection
- Event logging for all important operations
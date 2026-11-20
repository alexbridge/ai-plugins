---
name: dev-nestjs-security-keys
description: Manage and generate security keys, PEM to JWK conversion, and JWKS (JSON Web Key Set) implementation. Use when working with JWT signing keys, public key distribution, or identity provider standards (OIDC/OAuth2).
---

# Security Keys

## Overview
Guidance on managing cryptographic keys for identity services. Default algorithm: **ES256 (ECDSA P-256)**, published as **JWKS**. If the project already signs with another algorithm (check JWT module config, `algorithm`/`algorithms` options), follow the project.

## Key Standards & Algorithms
For detailed information on the algorithms and RFC standards followed (RFC 7517, 7518, 7519), refer to [algorithms.md](references/algorithms.md).

## Common Tasks

### 1. Generating ES256 Keys
To generate a new pair of ES256 keys using OpenSSL:
```bash
# Generate private key
openssl ecparam -name prime256v1 -genkey -noout -out private.key
# Extract public key
openssl ec -in private.key -pubout -out public.key
```

### 2. Converting PEM to JWK
When implementing a JWKS endpoint, use Node.js's `crypto` module to export the public key:
```typescript
import * as crypto from 'crypto';

const publicKeyPem = '...';
const key = crypto.createPublicKey(publicKeyPem);
const jwk = key.export({ format: 'jwk' });
```

### 3. Implementing JWKS Endpoint
A standard JWKS endpoint should return a `keys` array. Ensure the following fields are present:
- `kty`: "EC"
- `use`: "sig"
- `alg`: "ES256"
- `kid`: A stable unique identifier (e.g., hash of the public key)
- `crv`, `x`, `y`: Extracted from the EC key

## Best Practices
- **Never** expose private keys in public endpoints or version control.
- Use a **stable `kid`** (Key ID) so that consumers can cache keys effectively.
- Follow the **Base64URL** encoding standard for JWK parameters (no padding, `+` to `-`, `/` to `_`).

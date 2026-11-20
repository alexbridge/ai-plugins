# Cryptographic Algorithms and Standards

## ECDSA (Elliptic Curve Digital Signature Algorithm)
Default: **ES256** — ECDSA using the **P-256** curve and **SHA-256** hash algorithm.

### Why ES256?
- **Security**: Provides strong security with smaller key sizes compared to RSA.
- **Performance**: Faster signing and verification.
- **Standards**: Widely supported by modern identity providers (Apple, Google) and web standards.

## Standards Followed

### RFC 7517: JSON Web Key (JWK)
A JWK is a JSON data structure that represents a cryptographic key. PEM keys are converted into JWK format for public distribution.

**Key Parameters for EC Keys:**
- `kty` (Key Type): Must be "EC".
- `crv` (Curve): Must be "P-256".
- `x`, `y`: The x and y coordinates on the elliptic curve, Base64URL encoded.
- `kid` (Key ID): A unique identifier for the key, used to match a key in a set.

### RFC 7518: JSON Web Algorithms (JWA)
Defines the cryptographic algorithms used for JWS, JWE, and JWK. **ES256** is defined here.

### RFC 7519: JSON Web Token (JWT)
Tokens are issued in JWT format, signed with the private key and verifiable via the public JWKS endpoint.

### RFC 7515: JSON Web Signature (JWS)
The mechanism for signing the JWTs.

## JWKS (JSON Web Key Set)
A JWKS is a JSON object that contains an array of JWKs. It is usually served at `/.well-known/jwks.json` or a project-specific endpoint (find the existing one before adding a new route).

**Structure:**
```json
{
  "keys": [
    {
      "kty": "EC",
      "kid": "...",
      "use": "sig",
      "alg": "ES256",
      "crv": "P-256",
      "x": "...",
      "y": "..."
    }
  ]
}
```

# Secrets & Key Management

- Local development uses `ENCRYPTION_MASTER_KEY` (32 bytes) for AES-256-GCM field-level encryption.
- Production should use a KMS (e.g., AWS KMS). This app supports envelope encryption via `ENCRYPTION_KEY_KMS_ID` to derive data keys per environment.
- Never log tokens or PII. Ensure logs redact secrets and PII paths.

Rotation:
- Generate a new master key/data key
- Re-encrypt sensitive fields using migration or rolling decrypt+encrypt on access

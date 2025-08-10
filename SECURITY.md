# Security & Compliance Notes

- TLS termination assumed at ingress (reverse proxy or platform).
- Field-level encryption planned via AES-256-GCM; use KMS in production.
- RBAC and audit logging to be enforced in API once DB wired.
- No secrets or tokens are logged; avoid including PII in logs.
- Rate limiting and WAF headers recommended at reverse proxy.

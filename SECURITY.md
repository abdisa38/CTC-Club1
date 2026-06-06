# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The CTC Club team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by emailing:

📧 **security@ctcclub.com**

### What to Include

Please include the following information in your report:

1. **Description**: A clear description of the vulnerability
2. **Impact**: Potential impact and severity
3. **Steps to Reproduce**: Detailed steps to reproduce the issue
4. **Proof of Concept**: Code or screenshots demonstrating the vulnerability
5. **Suggested Fix**: If you have ideas on how to fix it (optional)
6. **Your Contact Info**: How we can reach you for follow-up

### What to Expect

- **Acknowledgment**: We'll acknowledge your email within 48 hours
- **Updates**: We'll keep you informed about our progress
- **Timeline**: We aim to fix critical vulnerabilities within 7 days
- **Credit**: We'll credit you in our security advisories (unless you prefer to remain anonymous)

## Security Measures

### Current Security Features

#### Authentication & Authorization
- ✅ JWT tokens stored in httpOnly cookies (not accessible via JavaScript)
- ✅ bcrypt password hashing with salt rounds
- ✅ Role-based access control (RBAC)
- ✅ OAuth 2.0 integration (Google, GitHub)
- ✅ Password reset with time-limited codes
- ✅ Automatic token expiration

#### API Security
- ✅ Rate limiting on all endpoints
- ✅ Stricter rate limiting on auth endpoints
- ✅ CORS with configurable origin allowlist
- ✅ Helmet.js security headers
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (MongoDB + Mongoose)
- ✅ XSS protection via sanitization

#### Data Protection
- ✅ Soft delete pattern (data not permanently removed)
- ✅ Password field excluded from queries by default
- ✅ Sensitive data not logged
- ✅ Environment variables for secrets
- ✅ No credentials in version control

#### File Upload Security
- ✅ File type validation
- ✅ File size limits (512MB videos, 50MB resources)
- ✅ Multer security configuration
- ✅ File scanning for malicious content (recommended in production)

#### Network Security
- ✅ HTTPS required in production
- ✅ Secure cookie flags (Secure, SameSite)
- ✅ Trust proxy configuration for production
- ✅ MongoDB connection string encryption

### Known Limitations

⚠️ **Client-Side Security**: JWT validation happens server-side only

⚠️ **File Storage**: Files stored locally by default (use S3 in production)

⚠️ **Email Security**: Nodemailer used without SPF/DKIM by default

## Security Best Practices for Deployment

### Environment Variables

Never commit these to version control:

```bash
# Critical secrets
JWT_SECRET=<strong-random-string>
MONGO_URI=<database-connection-string>
SESSION_SECRET=<strong-random-string>

# OAuth credentials
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GITHUB_CLIENT_ID=<your-client-id>
GITHUB_CLIENT_SECRET=<your-client-secret>

# Email credentials
EMAIL_HOST=<smtp-host>
EMAIL_USER=<smtp-username>
EMAIL_PASSWORD=<smtp-password>

# Payment gateway
CHAPA_SECRET_KEY=<your-secret-key>
```

### Generating Secure Secrets

```bash
# Generate JWT secret (Linux/Mac)
openssl rand -base64 32

# Generate JWT secret (Windows PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Use MongoDB Atlas or secure MongoDB instance
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domains only
- [ ] Set up monitoring and alerting
- [ ] Enable database backups
- [ ] Use environment-specific secrets
- [ ] Review all exposed endpoints
- [ ] Implement IP whitelisting for admin routes
- [ ] Set up Web Application Firewall (WAF)
- [ ] Enable audit logging
- [ ] Perform security audit/penetration testing

### MongoDB Security

```javascript
// Use authentication
mongodb://username:password@host:port/database

// Use SSL/TLS
mongodb://host:port/database?ssl=true

// Limit connection pool
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2
});

// Disable debug in production
if (process.env.NODE_ENV === 'production') {
  mongoose.set('debug', false);
}
```

### Rate Limiting Configuration

Adjust based on your needs:

```typescript
// General API (default: 500 requests per 15 minutes)
RATE_LIMIT_MAX=500

// Auth endpoints (default: 20 requests per 15 minutes)
AUTH_RATE_LIMIT_MAX=20

// Custom rate limits per route
router.use('/api/expensive-operation', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10 // 10 requests per hour
}));
```

## Security Headers

We use Helmet.js to set secure HTTP headers:

```typescript
// Applied headers
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Input Validation

All user input is validated:

```typescript
// Zod validation example
const userSchema = z.object({
  name: z.string()
    .min(2, 'Name too short')
    .max(50, 'Name too long'),
  email: z.string()
    .email('Invalid email'),
  password: z.string()
    .min(8, 'Password too short')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
});
```

## Common Vulnerabilities Addressed

### SQL Injection ✅
- **Protection**: MongoDB + Mongoose ORM
- **Validation**: All inputs validated before queries

### Cross-Site Scripting (XSS) ✅
- **Protection**: React escapes output by default
- **Headers**: X-XSS-Protection header set
- **Validation**: HTML/script tags sanitized in inputs

### Cross-Site Request Forgery (CSRF) ✅
- **Protection**: SameSite cookie attribute
- **Token**: JWT verification on all protected routes

### Authentication Bypass ✅
- **Protection**: Middleware on all protected routes
- **Validation**: Token expiration enforced
- **Refresh**: Automatic logout on invalid tokens

### Broken Authentication ✅
- **Password**: bcrypt with 10 salt rounds
- **Storage**: httpOnly cookies (not localStorage)
- **Session**: JWT with configurable expiration

### Sensitive Data Exposure ✅
- **Passwords**: Never returned in API responses
- **Tokens**: Never logged or exposed
- **Environment**: Secrets in .env (not committed)

### Broken Access Control ✅
- **RBAC**: Role-based authorization middleware
- **Ownership**: Resource-level permission checks
- **Enumeration**: Object IDs validated

### Security Misconfiguration ✅
- **Defaults**: Secure defaults in all configs
- **Headers**: Security headers via Helmet
- **Errors**: Generic error messages in production

## Dependency Security

### Automated Scanning

We use automated tools to scan dependencies:

```bash
# npm audit
npm audit

# Fix automatically
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force
```

### Update Policy

- Security patches applied immediately
- Minor updates reviewed and applied weekly
- Major updates reviewed and tested before applying

## Incident Response Plan

### If a Vulnerability is Discovered

1. **Assess**: Determine severity and impact
2. **Contain**: Take affected systems offline if critical
3. **Patch**: Develop and test a fix
4. **Deploy**: Roll out fix to production
5. **Notify**: Inform affected users if necessary
6. **Document**: Update security advisories
7. **Review**: Conduct post-mortem analysis

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | Data breach, RCE, authentication bypass | 24 hours |
| **High** | Significant data exposure, privilege escalation | 7 days |
| **Medium** | Limited data exposure, CSRF | 30 days |
| **Low** | Minor information disclosure | 90 days |

## Security Audit History

| Date | Type | Findings | Status |
|------|------|----------|--------|
| TBD  | Internal | - | Planned |

## Responsible Disclosure

We kindly request that security researchers:

1. **Allow** reasonable time to fix vulnerabilities before public disclosure
2. **Make good faith effort** to avoid privacy violations and service disruption
3. **Do not** access or modify user data beyond what's necessary for proof-of-concept
4. **Do not** perform DoS/DDoS attacks
5. **Do not** use social engineering against our team members

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we greatly appreciate security research. Researchers who responsibly disclose vulnerabilities will be:

- Credited in our security advisories (with permission)
- Recognized in our contributors list
- Given our sincere thanks and appreciation

We may consider monetary rewards on a case-by-case basis for critical vulnerabilities.

## Contact

- **Security Email**: security@ctcclub.com
- **PGP Key**: [Link to public key]
- **Security Advisories**: [GitHub Security Advisories](https://github.com/yourusername/CTC-Club1/security/advisories)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)

---

*Last Updated: [Current Date]*
*Version: 1.0*

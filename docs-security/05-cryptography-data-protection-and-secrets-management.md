# 05 - Cryptography, Data Protection & Enterprise Secrets Management

Protecting sensitive enterprise data requires appropriate encryption algorithms, secure key storage, and safe secrets orchestration.

---

## 1. Cryptographic Algorithms Comparison

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ SYMMETRIC ENCRYPTION (Same secret key for encrypt & decrypt)                            │
│ - AES-256-GCM (Authenticated Encryption with Associated Data - Industry Standard)       │
│ - ChaCha20-Poly1305 (Ultra-fast on hardware without AES-NI instructions)                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ASYMMETRIC ENCRYPTION & SIGNING (Public key encrypts / verifies; Private key signs)     │
│ - RSA-4096 (Legacy standard, large key sizes)                                           │
│ - ECDSA / Ed25519 (Elliptic Curve - smaller keys, faster signing, higher security)     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ CRYPTOGRAPHIC HASHING & KDFs (One-way mathematical transformation)                     │
│ - SHA-256 / SHA-512 (Integrity checksums, file hashing, HMAC)                          │
│ - PBKDF2 / Argon2id (Password hashing with deliberate computational cost)               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authenticated Symmetric Encryption with AES-256-GCM in `C#`

AES in Galois/Counter Mode (GCM) provides both **confidentiality** (encryption) and **integrity** (an authentication tag preventing tampering).

```csharp
using System.Security.Cryptography;

public static class AesGcmHelper
{
    public static (byte[] CipherText, byte[] Nonce, byte[] Tag) Encrypt(byte[] plainText, byte[] key256Bit)
    {
        using var aesGcm = new AesGcm(key256Bit, AesGcm.TagByteSizes.MaxSize);
        
        var nonce = new byte[AesGcm.NonceByteSizes.MaxSize]; // 12 bytes
        RandomNumberGenerator.Fill(nonce);

        var cipherText = new byte[plainText.Length];
        var tag = new byte[AesGcm.TagByteSizes.MaxSize];     // 16 bytes

        aesGcm.Encrypt(nonce, plainText, cipherText, tag);
        return (cipherText, nonce, tag);
    }

    public static byte[] Decrypt(byte[] cipherText, byte[] key256Bit, byte[] nonce, byte[] tag)
    {
        using var aesGcm = new AesGcm(key256Bit, AesGcm.TagByteSizes.MaxSize);
        var decryptedBytes = new byte[cipherText.Length];

        // Will throw CryptographicException if the tag does not match (tamper proof!)
        aesGcm.Decrypt(nonce, cipherText, tag, decryptedBytes);
        return decryptedBytes;
    }
}
```

---

## 3. ASP.NET Core Data Protection API

ASP.NET Core includes a built-in Data Protection stack used for securing authentication cookies, CSRF tokens, and temporary URLs.

### Configuring Key Persistence and Encryption at Rest

```csharp
public static IServiceCollection AddConfiguredDataProtection(
    this IServiceCollection services,
    IConfiguration configuration,
    IHostEnvironment env)
{
    var dataProtection = services.AddDataProtection()
        .SetApplicationName("CleanArchEnterprise");

    if (env.IsProduction())
    {
        // 1. Persist keys in Redis or Azure Blob Storage
        dataProtection.PersistKeysToDbContext<AppDbContext>();

        // 2. Encrypt keys at rest using Azure Key Vault or AWS KMS
        // dataProtection.ProtectKeysWithAzureKeyVault(new Uri("https://myvault.vault.azure.net/keys/k1"), new DefaultAzureCredential());
    }

    return services;
}
```

### Encrypting / Decrypting Sensitive Strings in Services

```csharp
public class SensitiveDataService
{
    private readonly IDataProtector _protector;

    public SensitiveDataService(IDataProtectionProvider provider)
    {
        // Purpose string creates an isolated cryptographic sandbox
        _protector = provider.CreateProtector("CleanArch.Services.CreditCardTokens.v1");
    }

    public string ProtectToken(string rawToken) => _protector.Protect(rawToken);

    public string UnprotectToken(string protectedToken) => _protector.Unprotect(protectedToken);
}
```

---

## 4. Enterprise Secrets Management

```text
┌───────────────────────────┐           ┌────────────────────────────┐
│ Local Development         │           │ Production CI/CD & Cloud   │
├───────────────────────────┤           ├────────────────────────────┤
│ • dotnet user-secrets     │           │ • Azure Key Vault          │
│ • appsettings.Development │           │ • AWS Secrets Manager      │
│ • Local .env (gitignored) │           │ • HashiCorp Vault          │
│ ❌ NEVER check secrets in!│           │ • Managed Workload Identity│
└───────────────────────────┘           └────────────────────────────┘
```

### Best Practices for Secrets Security:

1. **Never Commit Secrets to Git**: Use `.gitignore` for `.env`, `appsettings.Production.json`, and private keys.
2. **Scan Repositories with Gitleaks**: Run pre-commit hooks or GitHub Actions to detect accidental API key leaks.
3. **Use Managed Identities**: In cloud environments (Azure Managed Identity / AWS IAM Roles), authenticate services to databases and key vaults without static passwords.
4. **Automate Secret Rotation**: Configure 90-day automatic key rotation in Key Vaults to reduce blast radius.

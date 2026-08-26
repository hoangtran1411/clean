# 08 - Secure Coding, Input Validation & Data Sanitization

Input validation ensures that **untrusted data from external callers conforms to strict structural, lexical, and semantic rules** before reaching application domain logic.

---

## 1. Input Validation at the Architecture Boundary

Validation must occur early in the request lifecycle (within Application CQRS commands using FluentValidation), before database transactions or third-party API calls execute.

```
       HTTP Request ──► Controller ──► MediatR Pipeline ──► ValidationBehavior (FluentValidation)
                                                                       │
                                               ┌───────────────────────┴───────────────────────┐
                                               ▼                                               ▼
                                      [Valid Command]                                 [Validation Failed]
                                               │                                               │
                                      Domain / EF Core Handler                        Throw ValidationException
                                                                                               │
                                                                                      RFC ProblemDetails (400)
```

### FluentValidation Implementation Example
```csharp
public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(150).WithMessage("Product name must not exceed 150 characters.")
            .Must(name => !ContainsDangerousHtml(name)).WithMessage("HTML or script tags are prohibited.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.")
            .LessThanOrEqualTo(1_000_000).WithMessage("Price exceeds enterprise maximum limit.");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock cannot be negative.");
    }

    private static bool ContainsDangerousHtml(string input)
    {
        return input.Contains('<') || input.Contains('>') || input.Contains("javascript:", StringComparison.OrdinalIgnoreCase);
    }
}
```

---

## 2. Cross-Site Scripting (XSS) Prevention

XSS occurs when an application includes untrusted data in a web page without proper validation or contextual escaping.

```
┌───────────────────────────┬────────────────────────────────────────────────────────┐
│ Context                   │ Correct Sanitization / Encoding Technique              │
├───────────────────────────┼────────────────────────────────────────────────────────┤
│ HTML Body                 │ System.Text.Encodings.Web.HtmlEncoder.Default.Encode() │
│ HTML Attribute            │ Context-aware attribute encoding                       │
│ JavaScript Variable       │ System.Text.Json.JsonSerializer.Serialize()            │
│ React 19 Frontend         │ React escapes JSX strings automatically by default     │
│ Rich-Text HTML Rendering  │ DOMPurify (client-side) / Ganss.Xss.HtmlSanitizer (.NET│
└───────────────────────────┴────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> Never use `dangerouslySetInnerHTML` in React or bypass `@Html.Raw()` in Razor without passing the content through a certified HTML Sanitizer (e.g. `DOMPurify.sanitize(dirtyHtml)`).

---

## 3. Secure File Upload Architecture

File upload endpoints represent a severe threat surface (malicious executable uploads, path traversal, Zip bombs, and denial of service).

```
   Client Upload ──► [1. File Extension Whitelist] ──► [2. Magic Byte Check] ──► [3. Anti-Virus Scan]
                                                                                       │
                                                                                       ▼
                                 [Store in Isolated Blob Storage / Sandbox (Not Web Root!)]
```

### Step 1: Magic Byte Inspection in C#
Never trust `Content-Type` headers or file extensions alone, as attackers can rename `evil.exe` to `invoice.png`.

```csharp
public static class FileSecurityValidator
{
    // Signatures for common file types
    private static readonly Dictionary<string, List<byte[]>> FileSignatures = new()
    {
        { ".png",  new() { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } } },
        { ".jpg",  new() { new byte[] { 0xFF, 0xD8, 0xFF } } },
        { ".jpeg", new() { new byte[] { 0xFF, 0xD8, 0xFF } } },
        { ".pdf",  new() { new byte[] { 0x25, 0x50, 0x44, 0x46 } } }, // %PDF
        { ".xlsx", new() { new byte[] { 0x50, 0x4B, 0x03, 0x04 } } }  // PK.. (Zip header)
    };

    public static bool IsValidFileSignature(Stream stream, string fileExtension)
    {
        var ext = fileExtension.ToLowerInvariant();
        if (!FileSignatures.ContainsKey(ext)) return false;

        using var reader = new BinaryReader(stream, System.Text.Encoding.Default, leaveOpen: true);
        var maxSignatureLength = FileSignatures[ext].Max(sig => sig.Length);
        var headerBytes = reader.ReadBytes(maxSignatureLength);
        stream.Position = 0; // Reset stream

        return FileSignatures[ext].Any(signature =>
            headerBytes.Take(signature.Length).SequenceEqual(signature));
    }
}
```

---

## 4. Excel & CSV Formula Injection (DDE Injection) Prevention

When exporting user-generated data to Excel using EPPlus or CSV, characters such as `=`, `+`, `-`, or `@` at the beginning of a cell cause Excel to interpret the cell as an executable formula (e.g. `=CMD|' /C calc'!A0`).

### Sanitizing Excel Cell Values
```csharp
public static class ExcelSanitizer
{
    private static readonly char[] DangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];

    public static string SanitizeForExcel(string? input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;

        // If string starts with a formula trigger character, prepend a single apostrophe (')
        if (DangerousPrefixes.Contains(input[0]))
        {
            return "'" + input;
        }

        return input;
    }
}
```

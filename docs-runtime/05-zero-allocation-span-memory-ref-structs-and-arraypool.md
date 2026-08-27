# 05 - High-Performance Zero-Allocation: Span, Memory, Ref Structs & ArrayPool

Modern high-throughput .NET programming revolves around eliminating heap allocations, minimizing GC pause times, and using contiguous memory representations.

---

## 1. Anatomy of `Span<T>` and `ReadOnlySpan<T>`

`Span<T>` provides type-safe, contiguous memory representation across **Stack Memory**, **Managed Heap Memory**, or **Native Unmanaged Memory** with zero copying or allocations.

```text
                  ┌─────────────────────────────────────────────────────────┐
                  │                 Span<T> (16 bytes on x64)               │
                  ├────────────────────────────┬────────────────────────────┤
                  │ ref byte _reference        │ int _length                │
                  │ (8-byte interior pointer)  │ (4-byte length + padding)  │
                  └─────────────┬──────────────┴────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  [Stack Buffer]          [Managed Array]         [Native Unmanaged Heap]
  (stackalloc byte[64])   (byte[] on GC Heap)     (Marshal.AllocHGlobal)
```

---

## 2. The `ref struct` Invariants & C# 13 `allows ref struct`

Because `Span<T>` contains an interior reference pointer (`ref byte`), it is declared as a **`ref struct`**. This enforces strict compile-time safety rules to prevent dangling stack pointers:

### `ref struct` Rules:

- ❌ Cannot be boxed to `object` or interfaces.
- ❌ Cannot be stored as a field in normal classes or regular structs.
- ❌ Cannot be used across `async` / `await` boundaries or inside iterator blocks (`yield return`).
- ❌ Cannot be captured in lambda closures.
- ✅ In **C# 13**, generic parameters can accept `ref struct` via the `where T : allows ref struct` anti-constraint!

---

## 3. `Memory<T>` and `ReadOnlyMemory<T>` for Async Pipelines

Because `Span<T>` cannot survive `await` boundaries, use **`Memory<T>`** for heap-surviving, asynchronous streaming operations:

```text
┌─────────────────────────────────┬─────────────────────────────────┐
│ `Span<T>`                       │ `Memory<T>`                     │
├─────────────────────────────────┼─────────────────────────────────┤
│ • Stack-only `ref struct`.      │ • Regular heap-compatible struct│
│ • Synchronous fast operations.  │ • Async/await compatible.       │
│ • Convert to Span via `.Span`.  │ • Slices without allocation.    │
└─────────────────────────────────┴─────────────────────────────────┘
```

---

## 4. `ArrayPool<T>.Shared` Memory Recycling

Renting temporary buffers from `ArrayPool<T>` avoids creating short-lived heap arrays that trigger Gen 0 garbage collections.

```text
       App Thread ──► Rent(minSize: 4096) ──► ArrayPool Bucket (Returns pre-allocated byte[4096])
                            │
                      Execute Operations
                            │
       App Thread ──► Return(buffer, clearArray: true) ──► Returned to Bucket
```

### Complete Implementation Pattern:

```csharp
using System.Buffers;

public static void ProcessStreamEfficiently(Stream stream)
{
    var pool = ArrayPool<byte>.Shared;
    byte[] buffer = pool.Rent(minimumLength: 8192);

    try
    {
        int bytesRead;
        while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) > 0)
        {
            var dataSpan = buffer.AsSpan(0, bytesRead);
            ProcessBytes(dataSpan); // Zero allocations!
        }
    }
    finally
    {
        // Always return buffer to pool, clearing sensitive payload
        pool.Return(buffer, clearArray: true);
    }
}
```

---

## 5. High-Throughput I/O with `System.IO.Pipelines`

`System.IO.Pipelines` (the core engine behind Kestrel) decouples memory allocation from socket I/O, utilizing a linked list of recycled memory pages (`ReadOnlySequence<byte>`).

```csharp
using System.IO.Pipelines;

public static async Task ProcessPipeAsync(PipeReader reader)
{
    while (true)
    {
        ReadResult result = await reader.ReadAsync();
        ReadOnlySequence<byte> buffer = result.Buffer;

        while (TryReadLine(ref buffer, out ReadOnlySequence<byte> line))
        {
            ProcessLine(line);
        }

        // Tell the pipe how much data was consumed vs examined
        reader.AdvanceTo(buffer.Start, buffer.End);

        if (result.IsCompleted) break;
    }
}
```

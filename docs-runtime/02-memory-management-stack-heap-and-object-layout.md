# 02 - Memory Management: Stack vs. Heap & Object Memory Layout

Understanding how the .NET runtime allocates, aligns, and structures memory at the byte level is fundamental for writing high-throughput, low-latency C# code.

---

## 1. Stack vs. Heap Memory

```
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ STACK MEMORY (LIFO - Execution Thread Frames)               │ HEAP MEMORY (Dynamic Managed Memory)                        │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Allocated per OS thread (default 1MB on Windows x64).     │ • Shared across all application threads.                    │
│ • Ultra-fast allocation: simply moves Stack Pointer (`RSP`).│ • Managed by Garbage Collector (GC).                        │
│ • Automatically reclaimed when method exits (pop frame).    │ • Allocation via bump pointer (Gen 0) or free list (LOH).   │
│ • Stores: Local variables, method arguments, value types,   │ • Stores: Reference types (classes, strings, arrays),       │
│   and stack references pointing to heap objects.            │   boxed value types, long-lived data.                       │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Anatomy of a 64-Bit Managed Object on the Heap

Every managed reference-type object allocated on the 64-bit CoreCLR heap has a mandatory **16-byte object header overhead**:

```
 ┌───────────────────────────────┬───────────────────────────────┬───────────────────────────────┬───────────────────┐
 │     SyncBlock Index           │      MethodTable Pointer      │        Instance Fields        │ Alignment Padding │
 │         (8 bytes)             │        (MethodTable*)         │       (Payload Data)          │   (0 - 7 bytes)   │
 │         [Offset 0]            │         [Offset 8]            │         [Offset 16]           │                   │
 └───────────────────────────────┴───────────────────────────────┴───────────────────────────────┴───────────────────┘
 ◄────────────────────── Object Header Overhead (16 bytes) ─────►
 ◄────────────────────────────── Total Object Size (Must be multiple of 8 bytes) ──────────────────────────────────►
```

### Components:
1. **SyncBlock Index (8 bytes on x64)**:
   - Used for `lock(obj)` synchronization (points to an entry in the global SyncBlock table).
   - Stores the object's default `GetHashCode()` when computed.
   - Stores GC pinning and bit flags.
2. **MethodTable Pointer (`MethodTable*`, 8 bytes on x64)**:
   - Points to the type's runtime metadata in CoreCLR memory.
   - Required for polymorphic method calls (`virtual`/`override`), interface dispatch, and type checking (`is`, `as`, `GetType()`).
3. **Instance Fields**:
   - The actual payload data (primitives, references, structs).
4. **Alignment & Padding**:
   - On 64-bit systems, all objects are padded to align on **8-byte boundaries**.
   - Minimum object size is **24 bytes** (16 bytes header + 8 bytes minimum payload/padding).

---

## 3. Array Object Memory Layout

Arrays in .NET are reference types with an extra **4-byte Length field**:

```
 ┌───────────────────────┬───────────────────────┬─────────────────┬───────────────────────┬───────────────────┐
 │    SyncBlock Index    │  MethodTable Pointer  │ Length (Int32)  │    Array Elements     │ Alignment Padding │
 │       (8 bytes)       │       (8 bytes)       │    (4 bytes)    │   (Length * sizeof(T))│   (0 - 7 bytes)   │
 └───────────────────────┴───────────────────────┴─────────────────┴───────────────────────┴───────────────────┘
```

For example, an empty array `new byte[0]`:
- SyncBlock (8B) + MethodTable (8B) + Length (4B) + Padding (4B) = **24 bytes minimum overhead**.

---

## 4. Value Types, Reference Types & Boxing Mechanics

```
┌───────────────────────────────────────────────────────────┐
│ Value Types (struct, int, double, bool, enum)             │
│ • Stored inline wherever declared (on Stack or inside     │
│   containing class on Heap).                              │
│ • No MethodTable pointer or SyncBlock overhead!           │
├───────────────────────────────────────────────────────────┤
│ Reference Types (class, string, object, array, delegate)  │
│ • Stack holds a pointer (8 bytes).                        │
│ • Actual payload resides on Heap with 16B header.         │
└───────────────────────────────────────────────────────────┘
```

### Boxing Behind the Scenes
When a value type is cast to `object` or an interface (e.g. `IComparable`), the runtime performs **Boxing**:
1. Allocates a new 24-byte object on the GC heap.
2. Writes the value type's `MethodTable*` and SyncBlock.
3. Copies the raw bytes of the value type into the heap object's payload.
4. Returns the 8-byte reference pointer to the stack.

```csharp
// ❌ Hidden Allocation via Boxing (Generates IL 'box')
int count = 42;
object boxed = count; // Allocates 24 bytes on Heap!

// ✅ Zero-Allocation Generic Constraints
void PrintValue<T>(T value) where T : struct // Avoids boxing!
{
    Console.WriteLine(value);
}
```

---

## 5. Managed Heap Segments: SOH, LOH & POH

```
                                  MANAGED MEMORY HEAP
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ 1. Small Object Heap (SOH)                                                              │
 │    ┌───────────────────────────┬───────────────────────────┬──────────────────────────┐ │
 │    │       Generation 0        │       Generation 1        │       Generation 2       │ │
 │    │ (New objects < 85,000 B)  │ (Survived 1 Gen 0 GC)     │ (Long-lived & survivors) │ │
 │    └───────────────────────────┴───────────────────────────┴──────────────────────────┘ │
 ├─────────────────────────────────────────────────────────────────────────────────────────┤
 │ 2. Large Object Heap (LOH)                                                              │
 │    - Objects $\ge$ 85,000 bytes (e.g. large arrays `new byte[100000]`, large strings).  │
 │    - Collected only during full Gen 2 GCs. Not compacted by default (uses Free Lists).  │
 ├─────────────────────────────────────────────────────────────────────────────────────────┤
 │ 3. Pinned Object Heap (POH - .NET 5+)                                                   │
 │    - Dedicated heap for objects pinned in memory for native P/Invoke.                   │
 │    - Eliminates memory fragmentation on the Small Object Heap!                          │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Allocating on POH in C#
```csharp
// Allocate directly on Pinned Object Heap (.NET 5+)
byte[] pinnedBuffer = GC.AllocateArray<byte>(length: 1024, pinned: true);

// Pass pointer to native C/C++ library without triggering GC fragmentation!
unsafe
{
    fixed (byte* ptr = pinnedBuffer)
    {
        NativeInterop.ProcessNativeBuffer((nint)ptr, pinnedBuffer.Length);
    }
}
```

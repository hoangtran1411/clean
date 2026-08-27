# 06 - Low-Level Pointer Magic: Unsafe, MemoryMarshal & Native Interop

For system-level programming, audio/graphics processing, high-speed serialization, or native C/C++ library interop, C# provides unmanaged pointers, compiler intrinsics (`Unsafe`), and source-generated P/Invoke.

---

## 1. The `Unsafe` Class Intrinsics

`System.Runtime.CompilerServices.Unsafe` provides raw IL-level memory operations that bypass C# type safety and bounds checks for maximum performance.

```csharp
using System.Runtime.CompilerServices;

public static class UnsafeTricks
{
    // 1. Reinterpret any reference or struct without copying
    public static ulong AsUInt64(double value)
    {
        return Unsafe.As<double, ulong>(ref value);
    }

    // 2. Unchecked array element address arithmetic
    public static ref T GetUncheckedElement<T>(T[] array, int index)
    {
        ref T start = ref MemoryMarshal.GetArrayDataReference(array);
        return ref Unsafe.Add(ref start, index); // Bypasses bounds check in tight loops!
    }

    // 3. Exact memory size of managed struct
    public static int GetStructSize<T>() where T : struct
    {
        return Unsafe.SizeOf<T>();
    }
}
```

---

## 2. Zero-Copy Span Reinterpretation with `MemoryMarshal`

`MemoryMarshal` allows casting a span of one type to another (e.g. interpreting a `byte[]` network buffer as a `ReadOnlySpan<Guid>` or `ReadOnlySpan<int>`) with **zero memory copies or allocations**:

```csharp
using System.Runtime.InteropServices;

public static void ReinterpretBytes()
{
    byte[] rawBytes = [0x01, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00];

    // Reinterpret 8 bytes as 2 32-bit Integers (1 and 2)
    ReadOnlySpan<int> integers = MemoryMarshal.Cast<byte, int>(rawBytes);

    Console.WriteLine($"Length: {integers.Length}"); // 2
    Console.WriteLine($"Item 0: {integers[0]}");     // 1
    Console.WriteLine($"Item 1: {integers[1]}");     // 2
}
```

---

## 3. Controlling Memory Layout: StructLayout & FieldOffset

By default, the C# compiler and runtime reorder struct fields to optimize alignment. For binary protocol serialization or C union compatibility, you can force explicit layout:

### C-Style Union in C#:

```csharp
[StructLayout(LayoutKind.Explicit)]
public struct ColorUnion
{
    [FieldOffset(0)] public uint RgbaValue; // 32-bit composite integer
    
    [FieldOffset(0)] public byte Red;
    [FieldOffset(1)] public byte Green;
    [FieldOffset(2)] public byte Blue;
    [FieldOffset(3)] public byte Alpha;
}

// Modifying .Red immediately updates .RgbaValue because they share the same memory offset!
```

---

## 4. Modern Source-Generated P/Invoke (`[LibraryImport]`)

In .NET 7+, `[LibraryImport]` replaced the legacy runtime-marshaled `[DllImport]`. It generates unmanaged marshalling code at compile time, eliminating runtime IL stub generation and enabling NativeAOT compatibility.

```csharp
using System.Runtime.InteropServices;

public static partial class NativeKernelMethods
{
    // Generates high-performance C# marshalling code at compile time
    [LibraryImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static partial bool QueryPerformanceCounter(out long lpPerformanceCount);

    [LibraryImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static partial bool QueryPerformanceFrequency(out long lpFrequency);
}
```

---

## 5. Memory Pinning & Pointer Interop

When passing managed memory pointers to native C APIs, the GC must be instructed not to move the object during heap compaction.

```csharp
public static unsafe void PinAndCallNative(byte[] buffer)
{
    // 'fixed' pins the object for the scope of the block
    fixed (byte* ptr = buffer)
    {
        NativeCFunctions.ProcessBuffer((nint)ptr, buffer.Length);
    } // Automatically unpins when exiting the block
}
```

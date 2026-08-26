# 04 - RyuJIT Compilation, Tiering & Dynamic PGO

RyuJIT is the state-of-the-art Just-In-Time (JIT) compiler in CoreCLR. It translates CIL bytecode into highly optimized native machine instructions tailored to the executing CPU architecture.

---

## 1. Compilation Models in Modern .NET

```
┌────────────────────────────┬────────────────────────────┬────────────────────────────┐
│ JIT (Just-In-Time)         │ NativeAOT (Ahead-of-Time)  │ ReadyToRun (R2R)           │
├────────────────────────────┼────────────────────────────┼────────────────────────────┤
│ • Compiles IL at runtime.  │ • Compiles C# directly to  │ • Hybrid model.            │
│ • Full Dynamic PGO & CPU   │   native machine code at   │ • Pre-compiled native code │
│   feature detection.       │   publish time. No JIT.    │   with fallback to JIT     │
│ • Best peak throughput.    │ • Instant startup & 0 RAM  │   for unoptimized methods. │
│                            │   JIT overhead.            │                            │
└────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

---

## 2. Tiered Compilation Architecture

To achieve both **blazing fast cold startup** and **maximum sustained throughput**, RyuJIT uses a two-tier compilation strategy:

```
     Method Invocation ──► Tier 0 (QuickJIT / MinOpts)
                                   │
                                   ├──► Executes immediately (No expensive optimizations)
                                   │    Injects execution counters & profiling probes
                                   │
                                   ▼ (Method called $\ge$ 30 times / Loop hits threshold)
                           Tier 1 (Optimized JIT + Dynamic PGO)
                                   │
                                   └──► Compiles in background thread:
                                        • Aggressive Inlining
                                        • Loop Unrolling & Vectorization (SIMD)
                                        • Interface Devirtualization
                                        • Bounds Check Elimination (BCE)
```

---

## 3. Dynamic PGO (Profile-Guided Optimization)

Introduced in .NET 7/8 and expanded in .NET 9/10, **Dynamic PGO** uses real-time runtime metrics gathered during Tier 0 execution to generate bespoke native machine code.

### Interface Devirtualization & Monomorphic Inlining
Virtual methods and interface dispatches normally require an indirect lookup through the `MethodTable` vtable (incurring branch prediction penalties).

Dynamic PGO observes which concrete types actually flow through the interface:

```csharp
public interface ICalculator { int Compute(int x); }
public class FastCalculator : ICalculator { public int Compute(int x) => x * 2; }

// Caller:
public int Process(ICalculator calc, int val) => calc.Compute(val);
```

#### What Dynamic PGO generates in native machine code:
```asm
; Dynamic PGO checks if 'calc' is FastCalculator (Type Test)
cmp [rcx], OFFSET FastCalculator_MethodTable
jne Standard_Interface_Call

; INLINED FAST PATH (0 vtable overhead, direct CPU arithmetic):
lea eax, [rdx + rdx]   ; eax = val * 2
ret

Standard_Interface_Call:
; Fallback to virtual dispatch if another type is encountered
```

---

## 4. Bounds Check Elimination (BCE)

When iterating through arrays and spans, C# guarantees safety by verifying that indices are within bounds. RyuJIT analyzes loop ranges to eliminate redundant bounds checks:

```csharp
public int SumArray(int[] items)
{
    int sum = 0;
    // RyuJIT proves loop bounds never exceed items.Length:
    // ➔ Eliminates array bounds check inside the loop entirely!
    for (int i = 0; i < items.Length; i++)
    {
        sum += items[i];
    }
    return sum;
}
```

---

## 5. Hardware Intrinsics & Vectorization (SIMD in C#)

Modern CPUs can perform arithmetic on multiple data values simultaneously (Single Instruction, Multiple Data - SIMD) using 128-bit (SSE/NEON), 256-bit (AVX2), or 512-bit (AVX-512) vector registers.

```csharp
using System.Runtime.Intrinsics;
using System.Runtime.Intrinsics.X86;

public static class VectorSumHelper
{
    public static int SumVectorized(ReadOnlySpan<int> numbers)
    {
        int sum = 0;
        int i = 0;

        // Process 8 integers (256 bits) per CPU cycle with AVX2
        if (Avx2.IsSupported && numbers.Length >= Vector256<int>.Count)
        {
            var accVector = Vector256<int>.Zero;
            int vectorSize = Vector256<int>.Count; // 8 integers

            fixed (int* ptr = numbers)
            {
                while (i <= numbers.Length - vectorSize)
                {
                    var data = Avx.LoadVector256(ptr + i);
                    accVector = Avx2.Add(accVector, data); // 8 additions in 1 clock cycle!
                    i += vectorSize;
                }
            }

            // Horizontal sum of vector elements
            for (int v = 0; v < Vector256<int>.Count; v++)
            {
                sum += accVector.GetElement(v);
            }
        }

        // Process remaining tail elements
        for (; i < numbers.Length; i++)
        {
            sum += numbers[i];
        }

        return sum;
    }
}
```

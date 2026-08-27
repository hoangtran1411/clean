# .NET Runtime (CoreCLR), Memory Internals & Low-Level Engineering - Learning Path

Welcome to the comprehensive **.NET Runtime & Low-Level Internals Curriculum** covering **CoreCLR Architecture & Execution Engine**, **Stack vs. Heap & Object Memory Layout**, **Garbage Collection (GC) Internals & Generational Model**, **RyuJIT Compilation, Tiering & Dynamic PGO**, **High-Performance Zero-Allocation (`Span<T>`, `Memory<T>`, `ref struct`, `ArrayPool`)**, **Pointer Manipulation & Native Interop (`Unsafe`, `MemoryMarshal`, `[LibraryImport]`)**, **ThreadPool & Synchronization Primitives**, **Async/Await State Machine Mechanics**, **Runtime Diagnostics & Memory Dump Analysis (SOS/WinDbg)**, and **Top 30 .NET Runtime Interview Questions**.

---

## ⚙️ .NET Runtime Step-by-Step Learning Modules

1. [**01 - CLR Architecture, Execution Engine & App Bootstrapping**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/01-clr-architecture-and-execution-engine.md)
   - CoreCLR Anatomy: Execution Engine (EE), Type System, Virtual Machine, Class Loader
   - Compilation Pipeline: C# ➔ Roslyn (IL + Metadata) ➔ RyuJIT ➔ Native Machine Code (x64 / ARM64)
   - Bootstrapping Lifecycle: `apphost` ➔ `hostfxr` ➔ `hostpolicy` ➔ `coreclr.dll` ➔ Managed `Main()`
   - Assembly Loading & Isolation with `AssemblyLoadContext` (ALC)

2. [**02 - Memory Management: Stack vs. Heap & Object Layout**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/02-memory-management-stack-heap-and-object-layout.md)
   - Stack Memory: Call frames, stack pointer (`RSP`), value types vs. reference types
   - Heap Segments: Small Object Heap (SOH - Gen 0, 1, 2), Large Object Heap (LOH - $\ge$ 85,000 bytes), Pinned Object Heap (POH)
   - 64-Bit Managed Object Anatomy: 8-byte SyncBlock Index + 8-byte `MethodTable*` + Fields + 8-byte Alignment Padding
   - Array Object Memory Layout & Boxing / Unboxing under the hood (IL `box` / `unbox`)

3. [**03 - Garbage Collection (GC) Internals & Generational Model**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/03-garbage-collection-internals-and-generational-model.md)
   - Generational Hypothesis: Gen 0 (ephemeral), Gen 1 (aging buffer), Gen 2 (tenured long-lived)
   - 4 GC Execution Phases: Mark (Root enumeration) ➔ Plan ➔ Sweep (Free lists) ➔ Compact (Relocation)
   - Workstation GC vs. Server GC (Dedicated per-core heaps & GC threads)
   - Non-Concurrent vs. Background GC (`BGC`) & `runtimeconfig.json` GC tuning parameters
   - Finalization Queue, F-Reachable Queue, and `GC.SuppressFinalize` mechanics

4. [**04 - RyuJIT Compilation, Tiering & Dynamic PGO**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/04-ryujit-compilation-tiering-and-dynamic-pgo.md)
   - JIT Models: Just-In-Time (JIT), NativeAOT (Ahead-of-Time), ReadyToRun (R2R)
   - Tiered Compilation: Tier 0 (QuickJIT / MinOpts) ➔ Tier 1 (Optimized JIT with loop unrolling & vectorization)
   - Dynamic Profile-Guided Optimization (Dynamic PGO): Monomorphic/Bimorphic interface devirtualization & inline caches
   - Bounds Check Elimination (BCE) & Hardware Intrinsics (AVX-512, Arm64 AdvSIMD, `Vector<T>`)

5. [**05 - High-Performance Zero-Allocation: Span, Memory, Ref Structs & ArrayPool**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/05-zero-allocation-span-memory-ref-structs-and-arraypool.md)
   - `Span<T>` and `ReadOnlySpan<T>` anatomy: `ref byte _reference` + `int _length`
   - `ref struct` stack-only rules and C# 13 `allows ref struct` anti-constraint
   - `Memory<T>`, `ReadOnlyMemory<T>`, `MemoryManager<T>`, and `IMemoryOwner<T>` for async pipelines
   - `ArrayPool<T>.Shared`: Buffer renting, bucket architecture, and memory return lifecycle
   - High-throughput streaming with `System.IO.Pipelines` (`PipeReader`, `PipeWriter`, `ReadOnlySequence<T>`)

6. [**06 - Low-Level Pointer Magic: Unsafe, MemoryMarshal & Native Interop**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/06-low-level-pointer-magic-unsafe-and-native-interop.md)
   - `Unsafe` class intrinsics: `Unsafe.AsPointer`, `Unsafe.AsRef`, `Unsafe.Add`, `Unsafe.SizeOf`
   - Zero-copy data reinterpretation with `MemoryMarshal.Cast<TFrom, TTo>` & `MemoryMarshal.CreateSpan`
   - Memory layout control: `[StructLayout(LayoutKind.Explicit)]`, `[FieldOffset]`, `[StructLayout(LayoutKind.Sequential, Pack = 1)]`
   - C# Source-Generated P/Invoke with `[LibraryImport]` vs. legacy `[DllImport]`
   - Memory pinning: `fixed`, `GCHandle.Alloc(Pinned)`, and zero-fragmentation `GC.AllocateArray<T>(pinned: true)`

7. [**07 - Threading, Synchronization Primitives & ThreadPool Architecture**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/07-threading-synchronization-and-threadpool-architecture.md)
   - OS Kernel Threads vs. Managed Threads vs. Tasks
   - .NET ThreadPool Internals: Global FIFO Queue vs. Per-Thread LIFO Work-Stealing Queues & Hill Climbing Algorithm
   - Synchronization Primitives:
     - User-Mode: `Interlocked` atomic operations, `SpinLock`, `SpinWait`
     - Hybrid: `Monitor` (`lock`), `ReaderWriterLockSlim`, `SemaphoreSlim`, `ManualResetEventSlim`
     - Kernel-Mode: `Mutex`, `Semaphore`, `EventWaitHandle`
   - CPU Memory Barriers, Volatile reads/writes (`Volatile.Read`/`Write`), and Instruction Reordering

8. [**08 - Async/Await State Machine & SynchronizationContext Mechanics**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/08-async-await-state-machine-and-synchronization-context.md)
   - Decompiling `async` / `await`: `IAsyncStateMachine`, `AsyncTaskMethodBuilder<T>`, `MoveNext()`
   - ValueType State Machine struct vs. Heap Boxed State Machine allocation triggers
   - `ValueTask<T>` vs. `Task<T>`: Eliminating heap allocations in synchronous fast-path returns
   - `SynchronizationContext` vs. `TaskScheduler` and `ConfigureAwait(false)` internals

9. [**09 - Runtime Diagnostics, Profiling & Memory Dump Analysis**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/09-runtime-diagnostics-profiling-and-memory-dump-analysis.md)
   - CLI Diagnostics Suite: `dotnet-trace`, `dotnet-dump`, `dotnet-gcdump`, `dotnet-counters`, `dotnet-stack`
   - EventPipe & DiagnosticSource diagnostic infrastructure
   - Analyzing Memory Leaks with WinDbg & SOS Extension: `!dumpheap -stat`, `!gcroot`, `!dumpobj`, `!objsize`
   - JIT Disassembly inspection using `DOTNET_JitDisasm` and viewing native x64/ARM64 machine code

10. [**10 - Top 30 .NET Runtime & Low-Level Internals Interview Questions**](file:///C:/Users/Hoang/Desktop/clean/docs-runtime/10-top-30-dotnet-runtime-interview-questions.md)
    - 30 In-depth runtime questions categorized into Easy, Medium, and Advanced levels with deep technical explanations, IL decompilations, and memory layout diagrams.

---

## 🔬 .NET Runtime Architecture Overview

```text
                                      C# SOURCE CODE (.cs)
                                                │
                                                ▼ (Roslyn Compiler: csc)
                                   MANAGED ASSEMBLY (.dll / .exe)
                                 [IL Bytecode + Metadata Tables]
                                                │
                                                ▼ (CoreCLR Host: hostfxr)
                              ┌───────────────────────────────────┐
                              │          CoreCLR RUNTIME          │
                              ├───────────────────────────────────┤
                              │ • Class Loader & Type System      │
                              │ • Virtual Machine & App Domains   │
                              │ • AssemblyLoadContext (ALC)       │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │       RyuJIT (JIT Compiler)       │
                              │  - Tier 0: QuickJIT / MinOpts     │
                              │  - Dynamic PGO & Devirtualization │
                              │  - Tier 1: Vectorized Machine Code│
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │    MANAGED MEMORY & GC ENGINE     │
                              │  - SOH (Gen 0, Gen 1, Gen 2)      │
                              │  - LOH (>= 85 KB)                 │
                              │  - POH (Pinned Object Heap)       │
                              │  - ThreadPool & Work-Stealing     │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                                    NATIVE HARDWARE / OS CPU
                                   [x64 / ARM64 Machine Code]
```

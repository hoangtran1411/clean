# 10 - Top 30 .NET Runtime & Low-Level Internals Interview Questions

A comprehensive technical collection of 30 .NET Runtime and low-level engineering interview questions split across **Easy**, **Medium**, and **Advanced** levels, complete with decompiled IL, memory layouts, and deep CoreCLR architectural explanations.

---

## 🟢 Easy Level (Questions 1 - 10)

### 1. What is the Common Language Runtime (CoreCLR)?
CoreCLR is the execution engine for modern .NET applications. It manages program execution, JIT compilation (via RyuJIT), memory allocation, garbage collection, type safety, thread pooling, and exception handling across platforms (Windows, Linux, macOS).

### 2. What is the difference between Managed and Unmanaged code?
- **Managed Code**: C# or F# code compiled into CIL bytecode and executed under the supervision of the CoreCLR runtime with automatic garbage collection and type safety.
- **Unmanaged Code**: Native machine code (C/C++, Rust, OS system APIs) executed directly by the CPU without CLR oversight or automatic memory management.

### 3. What is the difference between the Stack and the Managed Heap?
- **Stack**: Fast, thread-local memory with LIFO allocation/deallocation managed via CPU stack pointer registers. Stores value types, local variables, and object reference pointers.
- **Heap**: Shared, dynamic memory managed by the Garbage Collector. Stores reference types, boxed value types, and large arrays.

### 4. What is Boxing and Unboxing?
- **Boxing**: Converting a value type to an `object` or interface. Allocates a new 24-byte object on the GC heap, writes the `MethodTable*`, and copies the value.
- **Unboxing**: Explicitly extracting a pointer to the value type from a boxed heap object, followed by copying the value back to the stack.

### 5. What are the three Generations in the .NET Garbage Collector?
- **Generation 0**: Short-lived, newly allocated objects (ephemeral allocation budget).
- **Generation 1**: Short-lived aging buffer between Gen 0 and Gen 2.
- **Generation 2**: Long-lived objects (singletons, static references) and objects promoted from Gen 1.

### 6. What is the Large Object Heap (LOH)?
A specialized heap segment for objects with a size of **85,000 bytes or greater** (and large `double[]` arrays $\ge$ 8,000 elements). Allocations on LOH bypass Gen 0 and go directly to Gen 2 to prevent expensive compaction of large memory blocks.

### 7. What is the difference between `ValueType` (`struct`) and `ReferenceType` (`class`)?
- `struct` inherits from `System.ValueType`, is copied by value, and is stored inline wherever declared without object header overhead.
- `class` inherits from `System.Object`, is copied by reference (pointer), and is allocated on the managed heap with a 16-byte object header on 64-bit systems.

### 8. What does `GC.Collect()` do, and why should it generally be avoided?
`GC.Collect()` forces a synchronous garbage collection. It disrupts the GC's self-tuning heuristics, can cause unnecessary promotion of ephemeral objects to Gen 2, and triggers Stop-The-World thread pauses.

### 9. What is the purpose of `IDisposable` and `GC.SuppressFinalize()`?
`IDisposable` provides deterministic cleanup of unmanaged resources (file handles, database connections, sockets). `GC.SuppressFinalize(this)` instructs the GC that the object has already cleaned up its resources and does not need to be placed in the finalizer queue, preventing it from surviving an extra GC cycle.

### 10. What is `Span<T>`?
`Span<T>` is a stack-only `ref struct` representing a contiguous region of arbitrary memory (stack, heap array, or native memory) providing type-safe indexing and slicing with zero allocations.

---

## 🟡 Medium Level (Questions 11 - 20)

### 11. What is the physical memory layout of an object on the 64-bit managed heap?
Every object consists of:
1. **SyncBlock Index** (8 bytes) at Offset 0.
2. **MethodTable Pointer** (8 bytes) at Offset 8.
3. **Instance Fields** starting at Offset 16.
4. **Alignment Padding** to ensure the total object size is a multiple of 8 bytes (minimum object size is 24 bytes).

### 12. How does the Pinned Object Heap (POH) prevent heap fragmentation?
Prior to .NET 5, pinning an object (`GCHandleType.Pinned` or `fixed`) prevented the GC from compacting the Small Object Heap, creating fragmentation holes. The POH provides a dedicated heap segment specifically for pinned arrays, isolating pinned objects away from normal movable GC memory.

### 13. What is Workstation GC vs. Server GC?
- **Workstation GC**: Uses 1 managed heap and 1 GC thread. Optimized for client UI responsiveness and low RAM usage.
- **Server GC**: Spawns 1 dedicated GC heap and 1 dedicated GC thread **per logical CPU core**. Offers massive allocation throughput and parallel collections for server backends.

### 14. What is Tiered Compilation in RyuJIT?
RyuJIT compiles methods in two tiers:
- **Tier 0 (QuickJIT)**: Minimal optimizations to ensure fast application startup and instrument execution counters.
- **Tier 1 (Optimized JIT)**: When a method is called frequently ($\ge 30$ times), it is recompiled in the background with aggressive optimizations, loop unrolling, and inlining.

### 15. What is Dynamic PGO (Profile-Guided Optimization)?
Dynamic PGO collects runtime type profiles and branch frequency data during Tier 0 execution. When recompiling to Tier 1, it devirtualizes polymorphic interface calls (monomorphic/bimorphic inlining) and rearranges hot/cold basic blocks for optimal CPU instruction cache utilization.

### 16. What is the difference between `Span<T>` and `Memory<T>`?
- `Span<T>` is a `ref struct` that can only exist on the stack and cannot be used across `async` / `await` boundaries or in class fields.
- `Memory<T>` is a regular struct holding a reference to a heap array or memory manager, making it fully compatible with `async` methods and class fields.

### 17. How does the ThreadPool Work-Stealing algorithm work?
Each ThreadPool worker thread maintains a local work queue (LIFO for cache locality). If a worker thread empties its queue, it steals tasks from the tail of another busy worker's queue (FIFO), maximizing multi-core CPU utilization without global queue lock contention.

### 18. What is `ValueTask<T>` and when should you return it instead of `Task<T>`?
`ValueTask<T>` is a struct that avoids heap allocation when an asynchronous method completes synchronously (e.g. cache hit). It should be returned in high-throughput hot paths where $>90\%$ of calls complete without awaiting.

### 19. What is the purpose of `ArrayPool<T>.Shared`?
`ArrayPool<T>.Shared` allows renting and returning pre-allocated array buffers. This avoids allocating short-lived large arrays that create heavy GC pressure on the Small Object Heap or Large Object Heap.

### 20. What is `[LibraryImport]` and how does it differ from `[DllImport]`?
`[DllImport]` relies on the CLR generating native interop marshalling stubs at runtime via JIT. `[LibraryImport]` is a C# source generator that emits C# marshalling code at build time, improving execution speed and enabling full NativeAOT compatibility.

---

## 🔴 Advanced Level (Questions 21 - 30)

### 21. How does the Roslyn compiler transform an `async` method into an `IAsyncStateMachine`?
Roslyn generates a state machine struct containing an integer state (`<>1__state`), fields for local variables and parameters, an `AsyncTaskMethodBuilder<T>`, and a `MoveNext()` method. If an awaited task is not completed, it records continuation delegates, sets the state, and returns. Once completed, `MoveNext()` is resumed on a ThreadPool thread.

### 22. What causes thread starvation in the .NET ThreadPool and how do you diagnose it?
Thread starvation occurs when ThreadPool threads are blocked synchronously (e.g. calling `.Result`, `.Wait()`, or `Thread.Sleep()`). Because new threads are injected slowly by the Hill Climbing Algorithm (1-2 threads per second), request queues back up. It is diagnosed using `dotnet-counters` (monitoring `threadpool-queue-length`) or `dotnet-dump` (checking thread call stacks for `Task.Wait`).

### 23. What are CPU Memory Barriers and why are they required for lock-free programming?
Modern CPUs reorder read and write instructions and buffer them in L1/L2 caches. A memory barrier (enforced by `Interlocked`, `Volatile.Read/Write`, or `Thread.MemoryBarrier`) forces the CPU to flush write buffers and synchronize cache lines across all cores, ensuring memory visibility.

### 24. Explain Bounds Check Elimination (BCE) in RyuJIT.
When a loop iterates from `0` to `array.Length - 1`, RyuJIT's induction variable analysis mathematically proves that the array index can never exceed the bounds of the array. RyuJIT completely removes the bounds check instructions (`cmp` and `jae`) from the generated assembly loop.

### 25. What is the difference between Monomorphic, Bimorphic, and Megamorphic call sites?
- **Monomorphic**: A call site always invokes the exact same concrete type. Dynamic PGO devirtualizes and inlines it directly.
- **Bimorphic**: A call site encounters exactly two concrete types. Dynamic PGO generates a single branch condition (`if (type == A) ... else ...`).
- **Megamorphic**: A call site encounters three or more types. Must fall back to standard virtual table dispatch.

### 26. How do `ref struct` types guarantee memory safety in C#?
The CLR and Roslyn enforce that `ref struct` instances reside exclusively on the execution stack. They can never be captured in heap-allocated closures, cannot be boxed to `object`, cannot be fields of normal classes, and cannot cross `await` suspension points, preventing interior pointers from outliving their referenced stack frames.

### 27. What is the `MethodTable` and where does it reside in memory?
The `MethodTable` is an unmanaged C++ data structure created by the CoreCLR Class Loader in the Native Loader Heap. It contains the type's virtual method table, interface mapping dispatch tables, component size (for arrays/strings), and pointer to its `EEClass`.

### 28. How does `MemoryMarshal.Cast<TFrom, TTo>` work without violating type safety?
`MemoryMarshal.Cast` calculates the byte length of the source span (`length * sizeof(TFrom)`) and calculates the number of elements of the target type (`totalBytes / sizeof(TTo)`). It constructs a new `Span<TTo>` pointing to the exact same interior memory reference with zero allocations or data copying.

### 29. What is the difference between Background GC (`BGC`) and Non-Concurrent GC?
- **Non-Concurrent GC**: Pauses all application threads (Stop-The-World) for the entire duration of Mark, Sweep, and Compact phases.
- **Background GC**: Performs Gen 2 Mark and Sweep concurrently with running application threads, allowing ephemeral Gen 0/1 collections to execute in between.

### 30. How do you identify the root holding a leaked object in memory using SOS?
In `dotnet-dump analyze`, execute `!dumpheap -stat` to find types consuming high memory. Run `!dumpheap -mt <MethodTable>` to get specific object addresses, and then run `!gcroot <ObjectAddress>`. The output traces the reference chain back to the active GC Root (e.g. static event handler, ThreadStatic variable, or pinned GCHandle).

# 03 - Garbage Collection (GC) Internals & Generational Model

The .NET Garbage Collector is an automatic, generational, tracing garbage collector engineered for extreme throughput and low-latency pause times.

---

## 1. The Generational Hypothesis

The .NET GC is designed around two empirical observations:

1. **Most newly allocated objects have very short lifespans** (e.g. local method variables, HTTP request DTOs, string concatenations).
2. **Older objects tend to remain alive for a long time** (e.g. singletons, configuration caches, DB connection pools).

```text
                      GENERATIONAL SURVIVAL PROMOTION LIFECYCLE
                      
    Allocations ──► ┌──────────────────────────────────────────────┐
                    │  Generation 0 (Ephemeral Allocation Budget)  │ ──► [90%+ Die Here (Fastest GC)]
                    └──────────────────────┬───────────────────────┘
                                           │ (Survived Gen 0 GC)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │  Generation 1 (Short-lived Aging Buffer)     │ ──► [Buffer between Gen 0 & Gen 2]
                    └──────────────────────┬───────────────────────┘
                                           │ (Survived Gen 1 GC)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │  Generation 2 (Tenured Long-Lived Objects)   │ ──► [Expensive Full GC]
                    └──────────────────────────────────────────────┘
```

---

## 2. The 4 Phases of Garbage Collection

When a generation's allocation budget is exceeded, the GC executes the following four phases:

```text
 ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
 │  1. MARK PHASE  │ ───► │  2. PLAN PHASE  │ ───► │  3. SWEEP PHASE │ ───► │ 4. COMPACT PHASE │
 │ (Find live roots│      │ (Decide sweep   │      │ (Reclaim dead   │      │ (Relocate objects│
 │  via references)│      │  vs. compaction)│      │  memory to list)│      │  & fix pointers) │
 └─────────────────┘      └─────────────────┘      └─────────────────┘      └──────────────────┘
```

1. **Mark Phase (Root Enumeration)**:
   - Suspends managed threads (Stop-The-World pause in non-background phases).
   - Scans all **GC Roots**:
     - CPU Registers holding object references.
     - Stack variables in active stack frames.
     - Static fields of loaded classes.
     - `GCHandle` tables (pinned, normal, weak references).
     - Finalization Queue.
   - Follows object reference graphs recursively, setting the **Mark Bit** in the GC syncblock for all reachable objects.

2. **Plan Phase**:
   - Calculates the density of live objects. If live objects are scattered with holes, it schedules **Compaction**. If mostly contiguous, it chooses **Sweeping** (cheaper).

3. **Sweep Phase**:
   - Walks through dead (unmarked) memory blocks and stitches them into a **Free List** for future allocations.

4. **Compact Phase**:
   - Shifts surviving live objects towards the beginning of the heap segment to remove fragmentation.
   - Updates all references and pointers across the application to reflect the new object addresses.

---

## 3. Workstation GC vs. Server GC

```text
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ WORKSTATION GC                                              │ SERVER GC (Default for ASP.NET Core)                        │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • 1 Managed Heap & 1 GC thread.                             │ • 1 Dedicated Heap & GC thread **PER CPU CORE**.           │
│ • Optimized for client responsiveness and UI smoothness.    │ • Ultra-high allocation throughput across multi-core CPUs.  │
│ • Lower memory footprint baseline.                          │ • Consumes more baseline RAM (independent heap per core).   │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 4. Background GC (`BGC`)

In older .NET versions, full Gen 2 GCs paused all application threads for the entire collection duration. **Background GC** solves this:

- Gen 2 collections run concurrently on dedicated background threads alongside application execution.
- Ephemeral GCs (Gen 0 and Gen 1) can interrupt a running Background Gen 2 GC to keep short-lived allocations running smoothly.

---

## 5. GC Configuration & Tuning (`runtimeconfig.json`)

You can fine-tune CoreCLR GC behavior inside your project's `runtimeconfig.json` or `.csproj`:

```xml
<PropertyGroup>
  <!-- Enable high-throughput Server GC -->
  <ServerGarbageCollection>true</ServerGarbageCollection>

  <!-- Enable concurrent Background GC -->
  <ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>

  <!-- Restrict GC max heap memory in Container / Kubernetes environments -->
  <!-- 2GB Hard Limit: prevents Linux OOM (Out Of Memory) Killer -->
  <GCHeapHardLimit>0x80000000</GCHeapHardLimit>

  <!-- Dynamic POH allocation -->
  <GCLargeObjectHeapCompactionMode>1</GCLargeObjectHeapCompactionMode>
</PropertyGroup>
```

---

## 6. Finalization Queue, F-Reachable & `GC.SuppressFinalize`

```text
 [Object with Finalizer ~MyClass()] ──► Allocated on Heap & Registered in Finalization Queue
                                                       │
                                                       ▼ (Object dies during GC)
                           Moved from Finalization Queue ──► F-Reachable Queue
                                                       │ (Survives to Gen 1 / 2!)
                                                       ▼
                               Finalizer Thread executes ~MyClass()
                                                       │
                                                       ▼
                               Finally collected in NEXT GC cycle
```

> [!IMPORTANT]
> Objects with destructors/finalizers (`~MyClass()`) **always survive at least one extra GC collection**, delaying memory reclamation. Always implement the standard `Dispose` pattern and call `GC.SuppressFinalize(this)` to remove the object from the finalization queue!

```csharp
public class ManagedResourceHolder : IDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        Dispose(true);
        // Instructs GC not to move this instance to the F-Reachable queue!
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                // Free managed resources
            }
            // Free unmanaged resources
            _disposed = true;
        }
    }

    ~ManagedResourceHolder() => Dispose(false); // Safety fallback
}
```

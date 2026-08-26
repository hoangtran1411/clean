# 07 - Threading, Synchronization Primitives & ThreadPool Architecture

Concurrency in .NET is built upon OS kernel threads, the managed runtime ThreadPool, work-stealing scheduling algorithms, and hardware memory barriers.

---

## 1. ThreadPool Architecture & Work-Stealing Algorithm

The .NET ThreadPool manages a pool of worker threads, automatically scaling them based on workload demand using the **Hill Climbing Algorithm**.

```
                        ┌──────────────────────────────────────────────┐
                        │        GLOBAL FIFO TASK QUEUE                │
                        │ (Tasks queued from non-ThreadPool threads)   │
                        └──────────────────────┬───────────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
   ┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
   │  ThreadPool Worker 1  │       │  ThreadPool Worker 2  │       │  ThreadPool Worker 3  │
   ├───────────────────────┤       ├───────────────────────┤       ├───────────────────────┤
   │ Local LIFO Work Queue │       │ Local LIFO Work Queue │       │ Local LIFO Work Queue │
   │ [Task 3] ◄─ Push/Pop  │       │ [Task 6]              │       │ (Empty Queue)         │
   │ [Task 2]              │       │ [Task 5]              │       │                       │
   │ [Task 1]              │       │                       │       │  ⚡ WORK STEALING     │
   │                       │       │                       │       │  Steals [Task 1] from │
   │                       │       │                       │       │  Worker 1 tail (FIFO) │
   └───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

- **Local Queues (LIFO)**: When a ThreadPool thread schedules a task, it pushes it to its own local queue. Popping from the head preserves data in the CPU L1/L2 data cache!
- **Work-Stealing (FIFO)**: When a worker thread runs out of work, it steals tasks from the tail of another busy worker's queue, preventing idle CPU cores.

---

## 2. Hierarchy of Synchronization Primitives

```
┌────────────────────┬────────────────────┬────────────────────────────────────────────────────────┐
│ Primitive Type     │ Examples           │ Mechanism & Performance Characteristics                │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────┤
│ 1. User-Mode /     │ `Interlocked`      │ Uses CPU hardware atomic instructions (`LOCK CMPXCHG`).│
│    Atomic          │ `SpinWait`         │ Zero kernel context switch overhead (Fastest).         │
│                    │ `SpinLock`         │ Only use for ultra-short critical sections (< 50ns).   │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────┤
│ 2. Hybrid          │ `Monitor` (`lock`) │ Spins in user space for a few iterations; if contested,│
│                    │ `SemaphoreSlim`    │ transitions to an OS kernel event.                     │
│                    │ `ReaderWriterLock` │ Ideal for general application programming.             │
├────────────────────┼────────────────────┼────────────────────────────────────────────────────────┤
│ 3. Kernel-Mode     │ `Mutex`            │ Transitions to OS kernel on every call. Supports       │
│                    │ `Semaphore`        │ cross-process synchronization (Slowest - ~1000ns+).    │
└────────────────────┴────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. High-Performance Atomic Operations (`Interlocked`)

`Interlocked` provides atomic, hardware-enforced thread-safe operations without locking or blocking thread execution:

```csharp
using System.Threading;

public class HighSpeedMetrics
{
    private long _totalRequests;
    private int _activeConnections;

    public void RecordRequest()
    {
        // Atomic increment (translates to 'lock inc [rcx]')
        Interlocked.Increment(ref _totalRequests);
    }

    public bool TryAcquireSlot(int maxSlots)
    {
        int current;
        do
        {
            current = _activeConnections;
            if (current >= maxSlots) return false;
            // Compare and Swap: only updates if value hasn't changed since read
        } while (Interlocked.CompareExchange(ref _activeConnections, current + 1, current) != current);

        return true;
    }
}
```

---

## 4. CPU Memory Barriers & Volatile Access

Modern multi-core CPUs and JIT compilers aggressively reorder read/write instructions to optimize pipeline execution. When multiple threads access shared variables without barriers, CPU caches may read stale values.

```
       CPU Core 0 (L1 Cache)                         CPU Core 1 (L1 Cache)
                 │                                             │
      _flag = true (Cached in Core 0)               Reads _flag (Reads 0 from stale L1)
                 │                                             │
                 ▼                                             ▼
  Needs Memory Barrier / Volatile               Needs Volatile.Read to force
  to flush cache line to RAM!                   cache invalidation and read RAM!
```

### In C#:
```csharp
private int _flag;

// Guaranteed not to reorder instructions across barrier
public void SetFlag() => Volatile.Write(ref _flag, 1);
public bool IsSet() => Volatile.Read(ref _flag) == 1;
```

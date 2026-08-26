# 08 - Async/Await State Machine & SynchronizationContext Mechanics

The `async` / `await` keywords in C# are syntactic sugar. The Roslyn compiler transforms asynchronous methods into a sophisticated **State Machine Struct** that implements `IAsyncStateMachine`.

---

## 1. Decompiling the Async State Machine

Consider this simple async method:

```csharp
public async Task<int> FetchDataAsync(string url)
{
    var data = await _httpClient.GetStringAsync(url);
    return data.Length;
}
```

### What the Roslyn Compiler Generates Under the Hood:
```csharp
[StructLayout(LayoutKind.Auto)]
[CompilerGenerated]
private struct <FetchDataAsync>d__1 : IAsyncStateMachine
{
    public int <>1__state; // -1: Initial/Running, 0: Suspended awaiting, -2: Completed
    public AsyncTaskMethodBuilder<int> <>t__builder;
    public string url;
    public MyService <>4__this;

    private TaskAwaiter<string> <>u__1;

    public void MoveNext()
    {
        int num = <>1__state;
        int result;
        try
        {
            TaskAwaiter<string> awaiter;
            if (num != 0)
            {
                awaiter = <>4__this._httpClient.GetStringAsync(url).GetAwaiter();
                if (!awaiter.IsCompleted)
                {
                    <>1__state = 0; // Set state to suspended
                    <>u__1 = awaiter;
                    // Hook continuation into ThreadPool / Awaiter
                    <>t__builder.AwaitUnsafeOnCompleted(ref awaiter, ref this);
                    return; // Return immediately to unblock calling thread!
                }
            }
            else
            {
                awaiter = <>u__1;
                <>u__1 = default;
                <>1__state = -1;
            }

            string data = awaiter.GetResult();
            result = data.Length;
        }
        catch (Exception exception)
        {
            <>1__state = -2;
            <>t__builder.SetException(exception);
            return;
        }

        <>1__state = -2;
        <>t__builder.SetResult(result);
    }

    public void SetStateMachine(IAsyncStateMachine stateMachine) => <>t__builder.SetStateMachine(stateMachine);
}
```

---

## 2. Heap Allocation Triggers in Async Methods

1. **If the awaited Task completes synchronously (`awaiter.IsCompleted == true`)**:
   - The state machine struct remains entirely on the stack.
   - **0 heap allocations!**
2. **If the awaited Task is incomplete (asynchronous wait)**:
   - The state machine struct must be **boxed onto the GC heap** so its state survives after the current thread returns.
   - Allocates `AsyncTaskMethodBuilder` state and continuation delegates.

---

## 3. `ValueTask<T>` vs. `Task<T>`

`Task<T>` is a managed reference type (class) that always allocates on the heap when created. `ValueTask<T>` is a discriminated union struct (`struct`) containing either a direct result `T` or a `Task<T>`.

```
┌─────────────────────────────────────────────────────────────┐
│ WHEN TO USE ValueTask<T>                                    │
├─────────────────────────────────────────────────────────────┤
│ 1. High-frequency methods with high cache-hit ratios        │
│    (e.g., In-Memory Cache, Socket buffer reads).            │
│ 2. When 90%+ of invocations complete synchronously.         │
│ 3. Reduces GC Gen 0 churn to ZERO on fast paths!            │
└─────────────────────────────────────────────────────────────┘
```

```csharp
public ValueTask<Product?> GetProductAsync(int id)
{
    // Fast path: In-memory cache hit (0 Heap Allocations!)
    if (_cache.TryGetValue(id, out Product? product))
    {
        return new ValueTask<Product?>(product);
    }

    // Slow path: Async database query (allocates Task only when needed)
    return new ValueTask<Product?>(FetchFromDbAsync(id));
}
```

---

## 4. SynchronizationContext & `ConfigureAwait(false)`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SYNCHRONIZATION CONTEXT BEHAVIOR                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ UI Frameworks (WPF / WinForms / MAUI):                                      │
│ • Have a dedicated UI Thread `SynchronizationContext`.                      │
│ • Continuations after `await` MUST hop back to the UI thread.               │
├─────────────────────────────────────────────────────────────────────────────┤
│ ASP.NET Core (.NET Core ➔ .NET 10):                                         │
│ • **NO SynchronizationContext!**                                            │
│ • Continuations execute on ANY available ThreadPool thread.                 │
│ • `ConfigureAwait(false)` is redundant in ASP.NET Core apps, but still      │
│   good practice in reusable class libraries.                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

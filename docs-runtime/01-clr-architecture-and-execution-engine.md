# 01 - CLR Architecture, Execution Engine & App Bootstrapping

The Common Language Runtime (CoreCLR) is the high-performance execution engine that powers modern .NET (.NET 8, 9, 10). It provides managed services including memory management, garbage collection, type safety, exception handling, thread pool scheduling, and JIT compilation.

---

## 1. CoreCLR High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CoreCLR RUNTIME                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │   Execution Engine   │  │     Type System      │  │    Class Loader   │  │
│  │   (Virtual Machine)  │  │   (MethodTable, EE)  │  │ (ALC & Resolvers) │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
│             │                         │                        │            │
│  ┌──────────▼───────────┐  ┌──────────▼───────────┐  ┌─────────▼─────────┐  │
│  │      RyuJIT Engine   │  │  Garbage Collector   │  │    ThreadPool     │  │
│  │  (Tiering, PGO, BCE) │  │  (SOH, LOH, POH)     │  │  (Work-Stealing)  │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
│             │                         │                        │            │
│  ┌──────────▼───────────┐  ┌──────────▼───────────┐  ┌─────────▼─────────┐  │
│  │  Exception Handling  │  │   P/Invoke / Native  │  │ Profiling / SOS   │  │
│  │     (SEH / Two-Pass) │  │   (Native Interop)   │  │   (Diagnostics)   │  │
│  └──────────────────────┘  └──────────────────────┘  └───────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                        HARDWARE & OPERATING SYSTEM (OS)
```

---

## 2. Compilation Pipeline: From C# to Silicon

When you compile and run a C# application, execution proceeds through two distinct phases: **Build-Time Compilation** and **Runtime JIT Compilation**.

```
    [C# Source Files]
           │
           ▼ (Roslyn: csc.exe)
    [Managed Assembly (.dll)]  ───► Contains: (1) CIL Bytecode (Common Intermediate Language)
           │                                 (2) Metadata Tables (Types, Fields, Methods)
           │                                 (3) PE Header & Embedded Manifest
           ▼ (Runtime Launch)
    [CoreCLR Hostfxr]
           │
           ▼ (RyuJIT Compilation)
    [Native Machine Code (x64 / ARM64 Assembly)]
           │
           ▼ (Direct CPU Execution)
    [Silicon Registers & Cache]
```

### A. Common Intermediate Language (CIL / IL)
CIL is a stack-based, CPU-independent instruction set. For example, adding two integers:

```cil
// C# Code: int sum = a + b;
ldloc.0      // Push local variable 0 onto evaluation stack
ldloc.1      // Push local variable 1 onto evaluation stack
add          // Pop top two values, add them, push result
stloc.2      // Pop result from stack and store into local variable 2
```

### B. Metadata Tables
Assemblies contain structured binary tables describing everything in the binary:
- `TypeDef`: Declares classes, structs, interfaces.
- `MethodDef`: Declares methods, signatures, and IL offsets.
- `MemberRef`: References to external assemblies (e.g., `System.Console.WriteLine`).
- `Blob / Strings Heap`: Constant pool storing strings and binary signatures.

---

## 3. Application Bootstrapping Lifecycle

When you run `dotnet run` or launch an executable produced by .NET:

```
[OS creates Process] ──► [apphost (native .exe)] ──► [hostfxr.dll] ──► [hostpolicy.dll]
                                                                             │
                                                                             ▼
[Managed Entry Point (Main)] ◄── [Execute Assembly] ◄── [coreclr.dll Initialized]
```

1. **`apphost` (Native Executable)**: A small, lightweight native binary on Windows (`app.exe`) or Linux (`app`). Its sole purpose is to discover the .NET runtime.
2. **`hostfxr` (Host Framework Resolver)**: Resolves which .NET runtime version to use based on the application's `.runtimeconfig.json`.
3. **`hostpolicy`**: Resolves dependencies and assemblies listed in `.deps.json`.
4. **`coreclr.dll` (CoreCLR Library)**: The native C++ engine initializes memory heaps, ThreadPool, GC subsystems, and constructs the initial `AssemblyLoadContext`.
5. **Managed Transition**: CoreCLR calls `System.Private.CoreLib` to invoke the program's static `Main` method.

---

## 4. Assembly Loading & Isolation with `AssemblyLoadContext` (ALC)

In .NET Core and modern .NET, traditional `AppDomain` boundaries were replaced by **`AssemblyLoadContext` (ALC)**. ALC allows dynamic loading, unloading, and version isolation of assemblies within a single process.

```csharp
using System.Reflection;
using System.Runtime.Loader;

// Create an isolated, collectible AssemblyLoadContext (Plugin architecture)
var pluginAlc = new AssemblyLoadContext(name: "PluginContext", isCollectible: true);

// Load assembly into isolated context
var assemblyPath = Path.Combine(AppContext.BaseDirectory, "Plugins", "CustomCalculator.dll");
Assembly pluginAssembly;

using (var fs = File.OpenRead(assemblyPath))
{
    pluginAssembly = pluginAlc.LoadFromStream(fs);
}

// Execute plugin method via reflection or shared interface
var calcType = pluginAssembly.GetType("CustomCalculator.Calculator")!;
var calcInstance = Activator.CreateInstance(calcType);
var addMethod = calcType.GetMethod("Add")!;
var result = (int)addMethod.Invoke(calcInstance, [10, 25])!;

Console.WriteLine($"Plugin calculated result: {result}");

// 🧹 UNLOAD PLUGIN & FREE MEMORY:
pluginAlc.Unload();

// Trigger GC to collect loaded assembly types from memory
GC.Collect();
GC.WaitForPendingFinalizers();
```

---

## 5. Type System & Metadata Resolution: The `MethodTable`

Every loaded type in .NET is represented internally by a C++ struct called **`MethodTable`** in unmanaged CoreCLR memory:
- Points to the EEClass (describes fields, layout, attributes).
- Contains the Virtual Method Table (vtable) for polymorphic dispatch.
- Contains interface map pointers and type flags (ValueType vs ReferenceType, Sealed, Generic).

# 04 - TanStack Query v5 Mastery (Server State, Caching & Invalidation)

## 1. Why TanStack Query (React Query)?

In traditional React, developers used `useEffect` + `useState` to fetch data. This created massive boilerplate for handling loading spinners, error states, cache synchronization, race conditions, and refetching.

**TanStack Query** manages **Server State**:

- ⚡ **Zero-Boilerplate Data Fetching**: Declarative `useQuery` hooks.
- 💾 **Smart In-Memory Caching**: Avoids redundant network requests when components remount.
- 🔄 **Automatic Background Synchronization**: Refetches data when window regains focus or network reconnects.
- 🚀 **Declarative Mutations**: `useMutation` with automatic UI cache invalidation (`queryClient.invalidateQueries`).

---

## 2. Core Concepts

### A. The Query Client Configuration

In [App.tsx](file:///C:/Users/Hoang/Desktop/clean/client/src/App.tsx):

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // Data stays fresh for 2 minutes
      refetchOnWindowFocus: false, // Prevents aggressive refetching
      retry: 1, // Retries failed request once
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductsSection />
    </QueryClientProvider>
  )
}
```

### B. Fetching Data with `useQuery`

In [ProductsSection.tsx](file:///C:/Users/Hoang/Desktop/clean/client/src/features/products/ProductsSection.tsx):

```typescript
const { data, isLoading, isFetching, error, refetch } = useQuery({
  queryKey: ['products', cacheMode],
  queryFn: async () => {
    const res = await api.get('/api/products/output-cached')
    return res.data
  },
})
```

- `isLoading`: `true` during the initial query before any cached data is available.
- `isFetching`: `true` whenever any network request is in-flight (including background refetches).
- `queryKey`: Cache key dependency array. When `cacheMode` changes, TanStack Query automatically refetches!

### C. Mutations & Automatic Cache Invalidation with `useMutation`

When creating or updating an entity, invalidate the query key so all active components automatically refetch fresh data:

```typescript
const queryClient = useQueryClient()

const createMutation = useMutation({
  mutationFn: async (newProduct) => {
    const res = await api.post('/api/products', newProduct)
    return res.data
  },
  onSuccess: () => {
    // 🌟 Instantly triggers background refetch for all queries with key ['products']!
    queryClient.invalidateQueries({ queryKey: ['products'] })
  },
})
```

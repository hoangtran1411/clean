# 06 - Full-Stack Integration: Identity, Idempotency & EPPlus Excel in React

## 1. Downloading Binary Excel Spreadsheets (`.xlsx`) with Axios

When downloading generated binary files from ASP.NET Core:

1. Configure Axios with `responseType: 'blob'`.
2. Convert the byte stream into an Object URL with `window.URL.createObjectURL`.
3. Create a temporary `<a>` element to trigger the browser's native file download.

In [ProductsSection.tsx](file:///C:/Users/Hoang/Desktop/clean/client/src/features/products/ProductsSection.tsx):

```typescript
const handleExportExcel = async () => {
  const response = await api.get('/api/excel/export-products', {
    responseType: 'blob',
  })

  // Create temporary blob URL and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `Products_Export_${new Date().toISOString().slice(0, 10)}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
```

---

## 2. Multipart/Form-Data File Upload with Axios

To upload Excel files for bulk parsing:

```typescript
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post('/api/excel/import-products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  // Invalidate TanStack query cache to display newly imported products
  queryClient.invalidateQueries({ queryKey: ['products'] })
}
```

---

## 3. Handling Idempotent Payments in the Frontend

To prevent double billing:

1. Generate an `Idempotency-Key` (UUID).
2. Pass the key in the request header.
3. If network fails or user double clicks, retry with the **same** key. The backend returns the cached response without double charging!

In [IdempotencySection.tsx](file:///C:/Users/Hoang/Desktop/clean/client/src/features/payments/IdempotencySection.tsx):

```typescript
const response = await api.post(
  '/api/payments/charge',
  { amount: 99.99, currency: 'USD', orderReference: 'ORD-123' },
  { headers: { 'Idempotency-Key': idempotencyKey } }
)

const cacheStatus = response.headers['x-cache'] // 'IDEMPOTENT-MISS' or 'IDEMPOTENT-HIT'
```

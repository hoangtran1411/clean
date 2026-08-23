import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axiosClient'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package, Download, Upload, Plus, RefreshCw, Layers } from 'lucide-react'

interface Product {
  id: number
  name: string
  category: string
  price: number
  stockQuantity: number
  createdAtUtc: string
}

interface ProductsApiResponse {
  cacheMechanism: string
  queriedAtUtc?: string
  generatedAtUtc?: string
  data: Product[]
}

export const ProductsSection: React.FC = () => {
  const queryClient = useQueryClient()
  const [cacheMode, setCacheMode] = useState<'in-memory' | 'output-cache'>('output-cache')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Laptops')
  const [price, setPrice] = useState('1499.00')
  const [stockQuantity, setStockQuantity] = useState('10')
  const [statusMsg, setStatusMsg] = useState('')

  // 1. TanStack useQuery: Fetching Products
  const { data, isLoading, isFetching, refetch } = useQuery<ProductsApiResponse>({
    queryKey: ['products', cacheMode],
    queryFn: async () => {
      const endpoint =
        cacheMode === 'output-cache'
          ? '/api/products/output-cached'
          : '/api/products/in-memory-cached'
      const res = await api.get<ProductsApiResponse>(endpoint)
      return res.data
    },
  })

  // 2. TanStack useMutation: Create Product & Invalidate Queries
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/products', {
        name,
        category,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity, 10),
      })
      return res.data
    },
    onSuccess: () => {
      setStatusMsg(`Product "${name}" created! Caches evicted and UI refreshed.`)
      setName('')
      // Invalidate TanStack Query cache to trigger automatic background refetch!
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      setStatusMsg(`Error creating product: ${error.response?.data?.message || 'Failed'}`)
    },
  })

  // 3. EPPlus Excel Export
  const handleExportExcel = async () => {
    try {
      const response = await api.get('/api/excel/export-products', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Products_Export_${new Date().toISOString().slice(0, 10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setStatusMsg('Excel exported successfully via EPPlus!')
    } catch {
      setStatusMsg('Failed to export Excel file.')
    }
  }

  // 4. Download Import Template
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/api/excel/template', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Product_Import_Template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      setStatusMsg('Failed to download template.')
    }
  }

  // 5. EPPlus Excel Bulk Import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/api/excel/import-products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStatusMsg(`Import result: ${res.data?.message || 'Success'}`)
      queryClient.invalidateQueries({ queryKey: ['products'] })
    } catch {
      setStatusMsg('Failed to import Excel file.')
    }
  }

  return (
    <Card className="w-full shadow-md border-slate-200">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-emerald-600" />
              <CardTitle>Catalog Management (TanStack Query + EPPlus)</CardTitle>
            </div>
            <CardDescription>
              Demonstrating TanStack Query (Caching, Invalidation), Output Cache, and EPPlus Excel Import/Export
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={cacheMode === 'output-cache' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCacheMode('output-cache')}
            >
              <Layers className="h-4 w-4 mr-1" /> [OutputCache]
            </Button>
            <Button
              variant={cacheMode === 'in-memory' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCacheMode('in-memory')}
            >
              IMemoryCache
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} /> Refetch
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Create Product Form */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
          <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-blue-600" /> Add New Product (Triggers Automatic Cache Eviction)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <Input
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price ($)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Stock Quantity"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !name}
            >
              {createMutation.isPending ? 'Creating...' : 'Save Product'}
            </Button>
          </div>
        </div>

        {/* Excel Integration Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2">
            <Button variant="success" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-1" /> Export Styled Excel (.xlsx)
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              Download Import Template
            </Button>
          </div>

          <label className="inline-flex items-center cursor-pointer">
            <input type="file" accept=".xlsx" className="hidden" onChange={handleFileUpload} />
            <span className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-slate-50 text-slate-700">
              <Upload className="h-3.5 w-3.5 mr-1" /> Import Excel
            </span>
          </label>
        </div>

        {/* Cache Info Banner */}
        {data && (
          <div className="flex items-center justify-between text-xs bg-slate-100 px-3 py-2 rounded text-slate-600">
            <span>
              <strong>Active Cache:</strong> {data.cacheMechanism}
            </span>
            <span>
              <strong>Generated:</strong>{' '}
              {new Date(data.generatedAtUtc || data.queriedAtUtc || '').toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Products Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Product Name</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Price</th>
                <th className="px-4 py-3 text-right font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{product.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          product.stockQuantity < 10 ? 'text-red-600' : 'text-slate-700'
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No products found. Add one above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {statusMsg && (
          <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded border border-emerald-200">
            {statusMsg}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

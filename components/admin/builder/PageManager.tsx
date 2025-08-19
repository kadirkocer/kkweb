'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { BlockCanvas } from './BlockCanvas'
import { BlockInspector } from './BlockInspector'
import type { Page, PageBlock } from '@/components/admin/builder/BlockRegistry'
import { Plus, Edit, Trash2, Eye, Globe, FileText, Calendar, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

const pageFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']),
})

type PageFormData = z.infer<typeof pageFormSchema>

interface PageManagerProps {
  className?: string
}

export function PageManager({ className }: PageManagerProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)

  const form = useForm<PageFormData>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      status: 'draft' as const,
    },
  })

  // Load pages
  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/pages')
      if (response.ok) {
        const pagesData = await response.json()
        setPages(pagesData)
      } else {
        console.error('Failed to load pages:', await response.text())
      }
    } catch (error) {
      console.error('Failed to load pages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPage = async (data: PageFormData) => {
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const newPage = await response.json()
        setPages(prev => [newPage, ...prev])
        setSelectedPage(newPage)
        setIsDialogOpen(false)
        form.reset()
      } else {
        const error = await response.json()
        console.error('Failed to create page:', error)
      }
    } catch (error) {
      console.error('Failed to create page:', error)
    }
  }

  const updatePage = async (page: Page) => {
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      })

      if (response.ok) {
        const updatedPage = await response.json()
        setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p))
        if (selectedPage?.id === updatedPage.id) {
          setSelectedPage(updatedPage)
        }
      } else {
        const error = await response.json()
        console.error('Failed to update page:', error)
      }
    } catch (error) {
      console.error('Failed to update page:', error)
    }
  }

  const deletePage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/admin/pages?id=${pageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPages(prev => prev.filter(p => p.id !== pageId))
        if (selectedPage?.id === pageId) {
          setSelectedPage(null)
        }
      } else {
        console.error('Failed to delete page')
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  }

  const handleBlocksChange = (blocks: PageBlock[]) => {
    if (!selectedPage) return

    const updatedPage = {
      ...selectedPage,
      blocks,
      updatedAt: new Date().toISOString(),
    }

    setSelectedPage(updatedPage)
    updatePage(updatedPage)
  }

  const handleBlockChange = (updatedBlock: PageBlock) => {
    if (!selectedPage) return

    const updatedBlocks = selectedPage.blocks.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    )

    handleBlocksChange(updatedBlocks)
  }

  const handleStatusChange = async (page: Page, newStatus: 'draft' | 'published') => {
    const updatedPage = {
      ...page,
      status: newStatus,
      publishedAt: newStatus === 'published' && !page.publishedAt ? new Date().toISOString() : page.publishedAt,
      version: newStatus === 'published' && page.status === 'draft' ? page.version + 1 : page.version,
    }

    await updatePage(updatedPage)
  }

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const watchedTitle = form.watch('title')
  useEffect(() => {
    if (watchedTitle && !editingPage) {
      form.setValue('slug', generateSlug(watchedTitle))
    }
  }, [watchedTitle, form, editingPage])

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading pages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {!selectedPage ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Pages</h2>
              <p className="text-muted-foreground">Manage your site pages</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Page
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Page</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(createPage)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="Page title"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      {...form.register('slug')}
                      placeholder="page-slug"
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.slug.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Page description for SEO"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Page</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pages List */}
          {pages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No pages yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create your first page to start building your site with the block editor.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Page
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pages.map(page => (
                <Card key={page.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                      </div>
                      
                      <Badge 
                        variant={page.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {page.status}
                      </Badge>
                    </div>
                    
                    {page.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {page.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </span>
                      <span>{page.blocks.length} blocks</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPage(page)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      
                      {page.status === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-2"
                        >
                          <a href={`/${page.slug}`} target="_blank">
                            <Eye className="h-3 w-3" />
                            View
                          </a>
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Page</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{page.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePage(page.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Page Editor */}
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedPage(null)
                  setSelectedBlockId(undefined)
                }}
                className="mb-2"
              >
                ← Back to Pages
              </Button>
              <h2 className="text-2xl font-bold">{selectedPage.title}</h2>
              <p className="text-muted-foreground">/{selectedPage.slug}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={selectedPage.status === 'published' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {selectedPage.status} {selectedPage.version > 1 && `v${selectedPage.version}`}
              </Badge>
              
              {selectedPage.status === 'published' && (
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <a href={`/${selectedPage.slug}`} target="_blank">
                    <Globe className="h-3 w-3" />
                    View Live
                  </a>
                </Button>
              )}
              
              <Button
                variant={selectedPage.status === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(
                  selectedPage, 
                  selectedPage.status === 'draft' ? 'published' : 'draft'
                )}
                className="gap-2"
              >
                <Save className="h-3 w-3" />
                {selectedPage.status === 'draft' ? 'Publish' : 'Unpublish'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Block Canvas */}
            <div className="lg:col-span-3">
              <BlockCanvas
                blocks={selectedPage.blocks}
                onBlocksChange={handleBlocksChange}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
              />
            </div>
            
            {/* Block Inspector */}
            <div className="lg:col-span-1">
              <BlockInspector
                block={selectedPage.blocks.find(b => b.id === selectedBlockId)}
                onBlockChange={handleBlockChange}
                onClose={() => setSelectedBlockId(undefined)}
                className="sticky top-6"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
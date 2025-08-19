'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { blockRegistry, type PageBlock } from '@/components/admin/builder/BlockRegistry'
import { Settings, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockInspectorProps {
  block?: PageBlock
  onBlockChange: (block: PageBlock) => void
  onClose: () => void
  className?: string
}

export function BlockInspector({ block, onBlockChange, onClose, className }: BlockInspectorProps) {
  if (!block) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Block Inspector
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Select a block to edit its properties
          </p>
        </CardContent>
      </Card>
    )
  }

  const blockDef = blockRegistry[block.type]
  
  if (!blockDef) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Block Inspector
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Unknown block type: {block.type}</p>
        </CardContent>
      </Card>
    )
  }

  const form = useForm({
    defaultValues: block.props,
  })

  // Update form when block changes
  useEffect(() => {
    form.reset(block.props)
  }, [block.id, block.props, form])

  const onSubmit = (data: any) => {
    onBlockChange({
      ...block,
      props: data
    })
  }

  const renderField = (fieldName: string, value: any) => {
    // Simple field rendering based on value type
    if (typeof value === 'boolean') {
      return (
        <div key={fieldName} className="flex items-center justify-between">
          <Label className="text-sm font-medium capitalize">
            {fieldName.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Switch
            checked={value}
            onCheckedChange={(checked) => form.setValue(fieldName as any, checked)}
          />
        </div>
      )
    }

    if (typeof value === 'number') {
      return (
        <div key={fieldName} className="space-y-2">
          <Label className="text-sm font-medium capitalize">
            {fieldName.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Input
            type="number"
            {...form.register(fieldName as any, { valueAsNumber: true })}
          />
        </div>
      )
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div key={fieldName} className="space-y-3">
          <Label className="text-sm font-medium capitalize">
            {fieldName.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Card className="p-3 space-y-3">
            {Object.entries(value).map(([subKey, subValue]) => 
              renderField(`${fieldName}.${subKey}`, subValue)
            )}
          </Card>
        </div>
      )
    }

    // Default to string input
    const isLongText = fieldName.toLowerCase().includes('content') || 
                      fieldName.toLowerCase().includes('description')

    return (
      <div key={fieldName} className="space-y-2">
        <Label className="text-sm font-medium capitalize">
          {fieldName.replace(/([A-Z])/g, ' $1').trim()}
        </Label>
        {isLongText ? (
          <Textarea
            {...form.register(fieldName as any)}
            placeholder={`Enter ${fieldName.toLowerCase()}...`}
            rows={4}
          />
        ) : (
          <Input
            {...form.register(fieldName as any)}
            placeholder={`Enter ${fieldName.toLowerCase()}...`}
          />
        )}
      </div>
    )
  }

  const formErrors = form.formState.errors

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Edit {blockDef.name}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {blockDef.category}
          </Badge>
          <span className="text-xs text-muted-foreground">ID: {block.id.slice(0, 8)}</span>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {Object.entries(block.props).map(([key, value]) => renderField(key, value))}

          {Object.keys(formErrors).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800 mb-2">Validation Errors:</p>
              {Object.entries(formErrors).map(([key, error]) => (
                <p key={key} className="text-xs text-red-600">
                  {key}: {error?.message as string}
                </p>
              ))}
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" size="sm">
              Update Block
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
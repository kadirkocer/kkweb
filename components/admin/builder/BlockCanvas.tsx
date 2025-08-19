'use client'

import { useState, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { blockRegistry, type PageBlock, validateBlockProps } from '@/components/admin/builder/BlockRegistry'
import { Plus, GripVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockCanvasProps {
  blocks: PageBlock[]
  onBlocksChange: (blocks: PageBlock[]) => void
  selectedBlockId?: string
  onSelectBlock: (blockId: string | undefined) => void
  className?: string
}

export function BlockCanvas({
  blocks,
  onBlocksChange,
  selectedBlockId,
  onSelectBlock,
  className
}: BlockCanvasProps) {
  const [previewMode, setPreviewMode] = useState(false)

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return

    const newBlocks = Array.from(blocks)
    const [reorderedBlock] = newBlocks.splice(result.source.index, 1)
    newBlocks.splice(result.destination.index, 0, reorderedBlock)

    // Update order property
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }))

    onBlocksChange(updatedBlocks)
  }, [blocks, onBlocksChange])

  const addBlock = useCallback((blockType: string) => {
    const blockDef = blockRegistry[blockType]
    if (!blockDef) return

    const newBlock: PageBlock = {
      id: crypto.randomUUID(),
      type: blockType,
      props: { ...blockDef.defaultProps },
      order: blocks.length
    }

    onBlocksChange([...blocks, newBlock])
    onSelectBlock(newBlock.id)
  }, [blocks, onBlocksChange, onSelectBlock])

  const deleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks
      .filter(block => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }))
    
    onBlocksChange(newBlocks)
    
    if (selectedBlockId === blockId) {
      onSelectBlock(undefined)
    }
  }, [blocks, onBlocksChange, selectedBlockId, onSelectBlock])

  const renderBlock = useCallback((block: PageBlock, isDragging: boolean) => {
    const blockDef = blockRegistry[block.type]
    if (!blockDef) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">Unknown block type: {block.type}</p>
        </div>
      )
    }

    // Validate props
    const validation = validateBlockProps(block.type, block.props)
    const hasErrors = !validation.success

    if (previewMode && validation.success) {
      try {
        const BlockComponent = blockDef.component
        return (
          <div className="border-2 border-dashed border-transparent hover:border-primary/30 transition-colors">
            <BlockComponent data={validation.data} preview />
          </div>
        )
      } catch (error) {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">Render error: {String(error)}</p>
          </div>
        )
      }
    }

    return (
      <Card className={cn(
        'p-4 transition-all duration-200',
        selectedBlockId === block.id && 'ring-2 ring-primary',
        isDragging && 'rotate-2 scale-105 shadow-lg',
        hasErrors && 'border-red-200 bg-red-50'
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <span className="font-medium">{blockDef.name}</span>
            <Badge variant="outline" className="text-xs">
              {blockDef.category}
            </Badge>
            {hasErrors && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectBlock(selectedBlockId === block.id ? undefined : block.id)}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteBlock(block.id)}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {blockDef.description}
        </div>
        
        {hasErrors && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-600">
            {validation.error}
          </div>
        )}
      </Card>
    )
  }, [previewMode, selectedBlockId, onSelectBlock, deleteBlock])

  const availableBlocks = Object.values(blockRegistry)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? 'outline' : 'default'}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
        </div>
      </div>

      {/* Block Canvas */}
      <div className="min-h-[200px] space-y-3">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground text-lg mb-4">No blocks yet</p>
            <p className="text-sm text-muted-foreground/80 mb-6 text-center max-w-md">
              Add your first block by clicking the + button below or choosing from the available blocks.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {blocks.map((block, index) => (
                    <Draggable
                      key={block.id}
                      draggableId={block.id}
                      index={index}
                      isDragDisabled={previewMode}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {renderBlock(block, snapshot.isDragging)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Add Block Buttons */}
      {!previewMode && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
            Add Blocks
          </h4>
          
          {['content', 'media', 'layout', 'interactive'].map(category => {
            const categoryBlocks = availableBlocks.filter(block => block.category === category)
            if (categoryBlocks.length === 0) return null
            
            return (
              <div key={category}>
                <h5 className="font-medium text-sm mb-2 capitalize">{category}</h5>
                <div className="grid grid-cols-2 gap-2">
                  {categoryBlocks.map(block => (
                    <Button
                      key={block.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addBlock(block.id)}
                      className="justify-start gap-2 h-auto p-3 flex-col items-start"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Plus className="h-3 w-3" />
                        <span className="font-medium text-xs">{block.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground text-left">
                        {block.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
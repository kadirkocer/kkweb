'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { History, RotateCcw, Eye, Calendar, FileText, Plus, Minus, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Page, PageBlock } from './BlockRegistry'

interface PageVersion {
  id: string
  pageId: string
  version: number
  title: string
  blocks: PageBlock[]
  createdAt: string
  publishedAt?: string
  author?: string
}

interface VersionHistoryProps {
  pageId: string
  currentVersion?: number
  onRestore?: (version: PageVersion) => void
  trigger?: React.ReactNode
}

interface BlockDiff {
  type: 'added' | 'removed' | 'modified' | 'unchanged'
  block: PageBlock
  changes?: string[]
}

export function VersionHistory({ pageId, currentVersion, onRestore, trigger }: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [versions, setVersions] = useState<PageVersion[]>([])
  const [selectedVersions, setSelectedVersions] = useState<[PageVersion | null, PageVersion | null]>([null, null])
  const [diff, setDiff] = useState<BlockDiff[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [versionToRestore, setVersionToRestore] = useState<PageVersion | null>(null)

  // Load versions when dialog opens
  useEffect(() => {
    if (isOpen && pageId) {
      loadVersions()
    }
  }, [isOpen, pageId])

  const loadVersions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/versions?pageId=${pageId}`)
      if (response.ok) {
        const versionsData = await response.json()
        setVersions(versionsData)
      }
    } catch (error) {
      console.error('Failed to load versions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate diff between two versions
  const generateDiff = (versionA: PageVersion, versionB: PageVersion): BlockDiff[] => {
    const blocksA = new Map(versionA.blocks.map(b => [b.id, b]))
    const blocksB = new Map(versionB.blocks.map(b => [b.id, b]))
    const allBlockIds = new Set([...blocksA.keys(), ...blocksB.keys()])
    const diff: BlockDiff[] = []

    for (const blockId of allBlockIds) {
      const blockA = blocksA.get(blockId)
      const blockB = blocksB.get(blockId)

      if (blockA && !blockB) {
        diff.push({ type: 'removed', block: blockA })
      } else if (!blockA && blockB) {
        diff.push({ type: 'added', block: blockB })
      } else if (blockA && blockB) {
        const changes = findBlockChanges(blockA, blockB)
        diff.push({ 
          type: changes.length > 0 ? 'modified' : 'unchanged', 
          block: blockB, 
          changes 
        })
      }
    }

    return diff
  }

  const findBlockChanges = (blockA: PageBlock, blockB: PageBlock): string[] => {
    const changes: string[] = []
    
    if (blockA.type !== blockB.type) {
      changes.push(`Type: ${blockA.type} → ${blockB.type}`)
    }
    
    if (blockA.order !== blockB.order) {
      changes.push(`Order: ${blockA.order} → ${blockB.order}`)
    }
    
    // Deep compare props
    const propsA = JSON.stringify(blockA.props, null, 2)
    const propsB = JSON.stringify(blockB.props, null, 2)
    if (propsA !== propsB) {
      changes.push('Properties modified')
    }
    
    return changes
  }

  const handleCompareVersions = (versionA: PageVersion, versionB: PageVersion) => {
    setSelectedVersions([versionA, versionB])
    setDiff(generateDiff(versionA, versionB))
  }

  const handleRestoreVersion = async (version: PageVersion) => {
    if (!onRestore) return

    setIsRestoring(true)
    try {
      // Call the parent handler to restore the version
      onRestore(version)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to restore version:', error)
    } finally {
      setIsRestoring(false)
      setShowRestoreConfirm(false)
      setVersionToRestore(null)
    }
  }

  const getDiffIcon = (type: BlockDiff['type']) => {
    switch (type) {
      case 'added': return <Plus className="w-3 h-3 text-green-500" />
      case 'removed': return <Minus className="w-3 h-3 text-red-500" />
      case 'modified': return <MoreHorizontal className="w-3 h-3 text-orange-500" />
      default: return null
    }
  }

  const getDiffColor = (type: BlockDiff['type']) => {
    switch (type) {
      case 'added': return 'border-l-green-500 bg-green-50'
      case 'removed': return 'border-l-red-500 bg-red-50'
      case 'modified': return 'border-l-orange-500 bg-orange-50'
      default: return 'border-l-gray-200 bg-gray-50'
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {trigger && (
          <div onClick={() => setIsOpen(true)}>
            {trigger}
          </div>
        )}
        
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Version History
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading versions...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[60vh]">
              {/* Versions List */}
              <div className="space-y-3">
                <h3 className="font-medium">Versions</h3>
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-2">
                    {versions.map((version, index) => {
                      const isLatest = index === 0
                      const isCurrent = version.version === currentVersion
                      
                      return (
                        <Card 
                          key={version.id} 
                          className={cn(
                            'cursor-pointer transition-colors hover:bg-muted/50',
                            isCurrent && 'ring-2 ring-primary',
                            selectedVersions.includes(version) && 'bg-primary/10'
                          )}
                          onClick={() => {
                            const [first] = selectedVersions
                            if (!first) {
                              setSelectedVersions([version, null])
                            } else if (first.id !== version.id) {
                              setSelectedVersions([first, version])
                              handleCompareVersions(first, version)
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={isLatest ? 'default' : 'secondary'} className="text-xs">
                                  v{version.version}
                                </Badge>
                                {isCurrent && <Badge variant="outline" className="text-xs">Current</Badge>}
                                {isLatest && <Badge variant="secondary" className="text-xs">Latest</Badge>}
                              </div>
                              
                              {!isCurrent && onRestore && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setVersionToRestore(version)
                                    setShowRestoreConfirm(true)
                                  }}
                                  className="text-xs gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Restore
                                </Button>
                              )}
                            </div>
                            
                            <div className="text-sm font-medium mb-1">{version.title}</div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(version.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {version.blocks.length} blocks
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Diff View */}
              <div className="space-y-3">
                <h3 className="font-medium">
                  {selectedVersions[0] && selectedVersions[1] 
                    ? `Comparing v${selectedVersions[0].version} → v${selectedVersions[1].version}` 
                    : 'Select two versions to compare'
                  }
                </h3>
                
                {diff ? (
                  <ScrollArea className="h-full pr-4">
                    <div className="space-y-2">
                      {diff.filter(d => d.type !== 'unchanged').map((diffItem, index) => (
                        <div
                          key={index}
                          className={cn(
                            'p-3 rounded-lg border-l-4',
                            getDiffColor(diffItem.type)
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getDiffIcon(diffItem.type)}
                            <span className="font-medium text-sm">
                              {diffItem.block.type} block
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {diffItem.type}
                            </Badge>
                          </div>
                          
                          {diffItem.changes && diffItem.changes.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <div>Changes:</div>
                              <ul className="list-disc list-inside mt-1">
                                {diffItem.changes.map((change, i) => (
                                  <li key={i}>{change}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {diff.every(d => d.type === 'unchanged') && (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No differences found between selected versions</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Select two versions to see the differences</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore to version {versionToRestore?.version}? 
              This will restore "{versionToRestore?.title}" into your current draft. 
              You will need to publish again to make it live.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => versionToRestore && handleRestoreVersion(versionToRestore)}
              disabled={isRestoring}
              className="gap-2"
            >
              {isRestoring && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
              Restore Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
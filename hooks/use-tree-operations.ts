import { useMemo, useCallback, useState } from 'react'

export interface TreeItem {
  id: string
  parent_id?: string | null
  order_index?: number
  [key: string]: any
}

export type TreeNode<T extends TreeItem> = T & {
  children: TreeNode<T>[]
  depth: number
  path: string[]
  hasChildren: boolean
  isExpanded?: boolean
}

export interface TreeOperationsConfig<T extends TreeItem> {
  items: T[]
  expandedNodes?: Set<string>
  onExpandedChange?: (expandedNodes: Set<string>) => void
}

export interface TreeOperationsState<T extends TreeItem> {
  tree: TreeNode<T>[]
  flatTree: TreeNode<T>[]
  expandedNodes: Set<string>
  totalNodes: number
  visibleNodes: TreeNode<T>[]
}

export interface TreeOperationsActions<T extends TreeItem> {
  toggleNode: (nodeId: string) => void
  expandNode: (nodeId: string) => void
  collapseNode: (nodeId: string) => void
  expandAll: () => void
  collapseAll: () => void
  expandToLevel: (level: number) => void
  findNode: (nodeId: string) => TreeNode<T> | null
  getNodePath: (nodeId: string) => TreeNode<T>[]
  getNodeChildren: (nodeId: string) => TreeNode<T>[]
  getNodeDescendants: (nodeId: string) => TreeNode<T>[]
  getNodeAncestors: (nodeId: string) => TreeNode<T>[]
  isNodeExpanded: (nodeId: string) => boolean
  isNodeVisible: (nodeId: string) => boolean
  moveNode: (nodeId: string, newParentId: string | null, newIndex?: number) => T[]
}

// Build tree structure from flat array
function buildTreeStructure<T extends TreeItem>(items: T[]): TreeNode<T>[] {
  const itemsMap = new Map<string, TreeNode<T>>()
  const rootNodes: TreeNode<T>[] = []

  // Sort items by order_index if available
  const sortedItems = [...items].sort((a, b) => {
    const aOrder = a.order_index ?? 0
    const bOrder = b.order_index ?? 0
    return aOrder - bOrder
  })

  // Create nodes map
  sortedItems.forEach(item => {
    const node: TreeNode<T> = {
      ...item,
      children: [],
      depth: 0,
      path: [],
      hasChildren: false,
    }
    itemsMap.set(item.id, node)
  })

  // Build hierarchy and calculate depth/path
  sortedItems.forEach(item => {
    const node = itemsMap.get(item.id)!
    
    if (item.parent_id) {
      const parent = itemsMap.get(item.parent_id)
      if (parent) {
        parent.children.push(node)
        parent.hasChildren = true
        node.depth = parent.depth + 1
        node.path = [...parent.path, parent.id]
      }
    } else {
      rootNodes.push(node)
      node.path = []
    }
  })

  return rootNodes
}

// Flatten tree structure
function flattenTreeStructure<T extends TreeItem>(tree: TreeNode<T>[]): TreeNode<T>[] {
  const result: TreeNode<T>[] = []
  
  function traverse(nodes: TreeNode<T>[]) {
    nodes.forEach(node => {
      result.push(node)
      if (node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  
  traverse(tree)
  return result
}

// Get visible nodes based on expansion state
function getVisibleNodes<T extends TreeItem>(
  tree: TreeNode<T>[], 
  expandedNodes: Set<string>
): TreeNode<T>[] {
  const result: TreeNode<T>[] = []
  
  function traverse(nodes: TreeNode<T>[], parentExpanded = true) {
    nodes.forEach(node => {
      if (parentExpanded) {
        result.push({
          ...node,
          isExpanded: expandedNodes.has(node.id)
        })
      }
      
      if (node.children.length > 0 && expandedNodes.has(node.id)) {
        traverse(node.children, parentExpanded)
      }
    })
  }
  
  traverse(tree)
  return result
}

export function useTreeOperations<T extends TreeItem>(
  config: TreeOperationsConfig<T>
): TreeOperationsState<T> & TreeOperationsActions<T> {
  const { items, expandedNodes: externalExpanded, onExpandedChange } = config
  
  // Use external expansion state if provided, otherwise internal state
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(new Set())
  const expandedNodes = externalExpanded || internalExpanded
  const setExpandedNodes = onExpandedChange || setInternalExpanded

  // Memoized tree structure
  const tree = useMemo(() => buildTreeStructure(items), [items])
  const flatTree = useMemo(() => flattenTreeStructure(tree), [tree])
  const visibleNodes = useMemo(() => getVisibleNodes(tree, expandedNodes), [tree, expandedNodes])

  // Actions
  const toggleNode = useCallback((nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }, [expandedNodes, setExpandedNodes])

  const expandNode = useCallback((nodeId: string) => {
    if (!expandedNodes.has(nodeId)) {
      const newExpanded = new Set(expandedNodes)
      newExpanded.add(nodeId)
      setExpandedNodes(newExpanded)
    }
  }, [expandedNodes, setExpandedNodes])

  const collapseNode = useCallback((nodeId: string) => {
    if (expandedNodes.has(nodeId)) {
      const newExpanded = new Set(expandedNodes)
      newExpanded.delete(nodeId)
      setExpandedNodes(newExpanded)
    }
  }, [expandedNodes, setExpandedNodes])

  const expandAll = useCallback(() => {
    const allNodeIds = flatTree.filter(node => node.hasChildren).map(node => node.id)
    setExpandedNodes(new Set(allNodeIds))
  }, [flatTree, setExpandedNodes])

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set())
  }, [setExpandedNodes])

  const expandToLevel = useCallback((level: number) => {
    const nodeIds = flatTree
      .filter(node => node.hasChildren && node.depth < level)
      .map(node => node.id)
    setExpandedNodes(new Set(nodeIds))
  }, [flatTree, setExpandedNodes])

  const findNode = useCallback((nodeId: string): TreeNode<T> | null => {
    return flatTree.find(node => node.id === nodeId) || null
  }, [flatTree])

  const getNodePath = useCallback((nodeId: string): TreeNode<T>[] => {
    const node = findNode(nodeId)
    if (!node) return []
    
    const path: TreeNode<T>[] = []
    node.path.forEach(ancestorId => {
      const ancestor = findNode(ancestorId)
      if (ancestor) path.push(ancestor)
    })
    path.push(node)
    
    return path
  }, [findNode])

  const getNodeChildren = useCallback((nodeId: string): TreeNode<T>[] => {
    const node = findNode(nodeId)
    return node ? node.children : []
  }, [findNode])

  const getNodeDescendants = useCallback((nodeId: string): TreeNode<T>[] => {
    const node = findNode(nodeId)
    if (!node) return []
    
    const descendants: TreeNode<T>[] = []
    
    function collectDescendants(nodes: TreeNode<T>[]) {
      nodes.forEach(child => {
        descendants.push(child)
        if (child.children.length > 0) {
          collectDescendants(child.children)
        }
      })
    }
    
    collectDescendants(node.children)
    return descendants
  }, [findNode])

  const getNodeAncestors = useCallback((nodeId: string): TreeNode<T>[] => {
    const node = findNode(nodeId)
    if (!node) return []
    
    const ancestors: TreeNode<T>[] = []
    node.path.forEach(ancestorId => {
      const ancestor = findNode(ancestorId)
      if (ancestor) ancestors.push(ancestor)
    })
    
    return ancestors
  }, [findNode])

  const isNodeExpanded = useCallback((nodeId: string): boolean => {
    return expandedNodes.has(nodeId)
  }, [expandedNodes])

  const isNodeVisible = useCallback((nodeId: string): boolean => {
    return visibleNodes.some(node => node.id === nodeId)
  }, [visibleNodes])

  const moveNode = useCallback((
    nodeId: string, 
    newParentId: string | null, 
    newIndex?: number
  ): T[] => {
    const updatedItems = [...items]
    const nodeIndex = updatedItems.findIndex(item => item.id === nodeId)
    
    if (nodeIndex === -1) return items
    
    const node = { ...updatedItems[nodeIndex] }
    
    // Update parent
    node.parent_id = newParentId
    
    // Update order index
    if (newIndex !== undefined) {
      node.order_index = newIndex
      
      // Reorder siblings
      const siblings = updatedItems
        .filter(item => item.parent_id === newParentId && item.id !== nodeId)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      
      siblings.forEach((sibling, index) => {
        const adjustedIndex = index >= newIndex ? index + 1 : index
        const siblingIndex = updatedItems.findIndex(item => item.id === sibling.id)
        if (siblingIndex !== -1) {
          updatedItems[siblingIndex] = {
            ...updatedItems[siblingIndex],
            order_index: adjustedIndex
          }
        }
      })
    }
    
    updatedItems[nodeIndex] = node as T
    return updatedItems
  }, [items])

  return {
    // State
    tree,
    flatTree,
    expandedNodes,
    totalNodes: flatTree.length,
    visibleNodes,
    
    // Actions
    toggleNode,
    expandNode,
    collapseNode,
    expandAll,
    collapseAll,
    expandToLevel,
    findNode,
    getNodePath,
    getNodeChildren,
    getNodeDescendants,
    getNodeAncestors,
    isNodeExpanded,
    isNodeVisible,
    moveNode,
  }
}

// Tree utility functions
export const treeUtils = {
  // Find all leaf nodes (nodes without children)
  getLeafNodes: <T extends TreeItem>(tree: TreeNode<T>[]): TreeNode<T>[] => {
    const leaves: TreeNode<T>[] = []
    
    function traverse(nodes: TreeNode<T>[]) {
      nodes.forEach(node => {
        if (node.children.length === 0) {
          leaves.push(node)
        } else {
          traverse(node.children)
        }
      })
    }
    
    traverse(tree)
    return leaves
  },

  // Get nodes at a specific level
  getNodesAtLevel: <T extends TreeItem>(tree: TreeNode<T>[], level: number): TreeNode<T>[] => {
    const result: TreeNode<T>[] = []
    
    function traverse(nodes: TreeNode<T>[]) {
      nodes.forEach(node => {
        if (node.depth === level) {
          result.push(node)
        }
        if (node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    
    traverse(tree)
    return result
  },

  // Get maximum depth of tree
  getMaxDepth: <T extends TreeItem>(tree: TreeNode<T>[]): number => {
    let maxDepth = 0
    
    function traverse(nodes: TreeNode<T>[]) {
      nodes.forEach(node => {
        maxDepth = Math.max(maxDepth, node.depth)
        if (node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    
    traverse(tree)
    return maxDepth
  },

  // Check if node is ancestor of another node
  isAncestor: <T extends TreeItem>(
    potentialAncestor: TreeNode<T>, 
    node: TreeNode<T>
  ): boolean => {
    return node.path.includes(potentialAncestor.id)
  },

  // Check if node is descendant of another node
  isDescendant: <T extends TreeItem>(
    potentialDescendant: TreeNode<T>, 
    node: TreeNode<T>
  ): boolean => {
    return potentialDescendant.path.includes(node.id)
  },
}
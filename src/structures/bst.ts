export interface BSTNode {
  id: string
  value: number
  left: string | null
  right: string | null
}

export interface BSTState {
  root: string | null
  nodes: Record<string, BSTNode>
  size: number
}

export interface BSTOperation {
  state: BSTState
  steps: string[]
  visited: string[]
  found: boolean
  depth: number
}

export type TraversalOrder = 'inorder' | 'preorder' | 'postorder'

let counter = 0

function makeNode(value: number): BSTNode {
  counter += 1
  return { id: `bst-${counter}`, value, left: null, right: null }
}

export function emptyBST(): BSTState {
  return { root: null, nodes: {}, size: 0 }
}

export function insertBST(state: BSTState, value: number): BSTOperation {
  if (state.root === null) {
    const node = makeNode(value)
    return {
      state: { root: node.id, nodes: { [node.id]: node }, size: 1 },
      steps: ['Tree is empty. The new value becomes the root.'],
      visited: [node.id],
      found: false,
      depth: 0,
    }
  }

  const nodes = { ...state.nodes }
  const steps: string[] = []
  const visited: string[] = []
  let current: string | null = state.root
  let depth = 0

  while (current) {
    const node: BSTNode = nodes[current]
    visited.push(current)
    if (value === node.value) {
      steps.push(`Value ${value} already exists at depth ${depth}. This lab treats duplicates as a no-op.`)
      return { state, steps, visited, found: false, depth }
    }
    if (value < node.value) {
      steps.push(`Compare ${value} with ${node.value} → smaller, go left.`)
      if (!node.left) {
        const created = makeNode(value)
        nodes[created.id] = created
        nodes[current] = { ...node, left: created.id }
        steps.push(`No left child. Attach ${value} as the left child of ${node.value}.`)
        return {
          state: { root: state.root, nodes, size: state.size + 1 },
          steps,
          visited: [...visited, created.id],
          found: false,
          depth: depth + 1,
        }
      }
      current = node.left
    } else {
      steps.push(`Compare ${value} with ${node.value} → larger, go right.`)
      if (!node.right) {
        const created = makeNode(value)
        nodes[created.id] = created
        nodes[current] = { ...node, right: created.id }
        steps.push(`No right child. Attach ${value} as the right child of ${node.value}.`)
        return {
          state: { root: state.root, nodes, size: state.size + 1 },
          steps,
          visited: [...visited, created.id],
          found: false,
          depth: depth + 1,
        }
      }
      current = node.right
    }
    depth += 1
  }

  return { state, steps, visited, found: false, depth }
}

export function searchBST(state: BSTState, value: number): BSTOperation {
  const steps: string[] = []
  const visited: string[] = []
  let current = state.root
  let depth = 0

  while (current) {
    const node: BSTNode = state.nodes[current]
    visited.push(current)
    if (value === node.value) {
      steps.push(`Compare ${value} with ${node.value} → match at depth ${depth}.`)
      return { state, steps, visited, found: true, depth }
    }
    if (value < node.value) {
      steps.push(`Compare ${value} with ${node.value} → go left.`)
      current = node.left
    } else {
      steps.push(`Compare ${value} with ${node.value} → go right.`)
      current = node.right
    }
    depth += 1
  }

  steps.push(`Reached a null child after ${depth} comparisons. ${value} is not in the tree.`)
  return { state, steps, visited, found: false, depth }
}

export function deleteBST(state: BSTState, value: number): BSTOperation {
  const steps: string[] = []
  const visited: string[] = []
  const nodes = { ...state.nodes }

  let current: string | null = state.root
  let target: string | null = null
  let parent: string | null = null
  let depth = 0

  while (current) {
    const node: BSTNode = nodes[current]
    visited.push(current)
    if (value === node.value) {
      target = current
      break
    }
    steps.push(
      value < node.value
        ? `Compare ${value} with ${node.value} → go left.`
        : `Compare ${value} with ${node.value} → go right.`,
    )
    parent = current
    current = value < node.value ? node.left : node.right
    depth += 1
  }

  if (!target) {
    steps.push(`${value} is not in the tree. Nothing is deleted.`)
    return { state, steps, visited, found: false, depth }
  }

  const node = nodes[target]

  const detach = (parentId: string | null, targetId: string, replacement: string | null): string | null => {
    if (!parentId) return replacement
    const parentNode = nodes[parentId]
    if (!parentNode) return state.root
    if (parentNode.left === targetId) {
      nodes[parentId] = { ...parentNode, left: replacement }
    } else if (parentNode.right === targetId) {
      nodes[parentId] = { ...parentNode, right: replacement }
    }
    return state.root
  }

  if (!node.left && !node.right) {
    steps.push(`${value} is a leaf. Remove it and clear its parent's pointer.`)
    delete nodes[target]
    const nextRoot = detach(parent, target, null)
    return {
      state: { root: nextRoot, nodes, size: Math.max(0, state.size - 1) },
      steps,
      visited,
      found: true,
      depth,
    }
  }

  if (!node.left || !node.right) {
    const child = node.left ?? node.right
    steps.push(`${value} has one child. Promote that child into its place.`)
    delete nodes[target]
    const nextRoot = detach(parent, target, child)
    return {
      state: { root: nextRoot, nodes, size: Math.max(0, state.size - 1) },
      steps,
      visited,
      found: true,
      depth,
    }
  }

  // Two children: copy the in-order successor's value, then remove the successor.
  let successorParent = target
  let successor = node.right
  steps.push(`${value} has two children. Find the smallest value in its right subtree.`)
  while (true) {
    const successorNode: BSTNode = nodes[successor]
    if (!successorNode.left) break
    successorParent = successor
    successor = successorNode.left
    steps.push(`Walk left to ${nodes[successor].value}; it is smaller.`)
  }

  const successorValue = nodes[successor].value
  const successorRight = nodes[successor].right
  steps.push(`Replace ${value} with successor ${successorValue}.`)
  nodes[target] = { ...nodes[target], value: successorValue }

  if (successorParent === target) {
    nodes[target] = { ...nodes[target], right: successorRight }
  } else {
    nodes[successorParent] = { ...nodes[successorParent], left: successorRight }
  }
  delete nodes[successor]

  return {
    state: { root: state.root, nodes, size: state.size - 1 },
    steps,
    visited: [...visited, successor],
    found: true,
    depth,
  }
}

export function traverseBST(
  state: BSTState,
  order: TraversalOrder,
): { values: number[]; steps: string[]; visited: string[] } {
  const values: number[] = []
  const steps: string[] = []
  const visited: string[] = []

  const walk = (id: string | null): void => {
    if (!id) return
    const node = state.nodes[id]
    if (!node) return
    if (order === 'preorder') {
      values.push(node.value)
      visited.push(id)
      steps.push(`Visit ${node.value} before its children (root → left → right).`)
    }
    walk(node.left)
    if (order === 'inorder') {
      values.push(node.value)
      visited.push(id)
      steps.push(`Visit ${node.value} between its left and right subtrees (left → root → right).`)
    }
    walk(node.right)
    if (order === 'postorder') {
      values.push(node.value)
      visited.push(id)
      steps.push(`Visit ${node.value} after its children (left → right → root).`)
    }
  }

  walk(state.root)
  steps.push(`Traversal complete: ${values.join(' → ') || 'empty tree'}.`)
  return { values, steps, visited }
}

export function bstHeight(state: BSTState): number {
  const walk = (id: string | null): number => {
    if (!id) return 0
    const node = state.nodes[id]
    if (!node) return 0
    return 1 + Math.max(walk(node.left), walk(node.right))
  }
  return walk(state.root)
}

export interface ListNode {
  id: string
  value: number
  next: string | null
}

export interface LinkedListState {
  head: string | null
  nodes: Record<string, ListNode>
  size: number
}

export interface ListOperation<T> {
  state: T
  steps: string[]
  visited: string[]
}

let nodeCounter = 0

function makeNode(value: number): ListNode {
  nodeCounter += 1
  return { id: `node-${nodeCounter}`, value, next: null }
}

export function emptyList(): LinkedListState {
  return { head: null, nodes: {}, size: 0 }
}

export function listValues(state: LinkedListState): number[] {
  const values: number[] = []
  let current = state.head
  let guard = 0
  while (current && state.nodes[current] && guard < state.size + 2) {
    values.push(state.nodes[current].value)
    current = state.nodes[current].next
    guard += 1
  }
  return values
}

export function insertAtHead(state: LinkedListState, value: number): ListOperation<LinkedListState> {
  const node = makeNode(value)
  const nodes = { ...state.nodes, [node.id]: { ...node, next: state.head } }
  return {
    state: { head: node.id, nodes, size: state.size + 1 },
    steps: [
      `Create node ${value}.`,
      state.head ? `Point its next link at the old head (${state.nodes[state.head]?.value ?? '-'}).` : 'The list was empty, so its next link is null.',
      'Move head to the new node.',
    ],
    visited: [node.id],
  }
}

export function insertAtTail(state: LinkedListState, value: number): ListOperation<LinkedListState> {
  const node = makeNode(value)
  const steps = ['Create the new node.']
  if (!state.head) {
    steps.push('List is empty: head now points to the new node.')
    return {
      state: { head: node.id, nodes: { ...state.nodes, [node.id]: node }, size: 1 },
      steps,
      visited: [node.id],
    }
  }

  const nodes = { ...state.nodes }
  let current: string | null = state.head
  const visited: string[] = []
  while (current) {
    visited.push(current)
    const next: string | null = nodes[current].next
    if (!next) break
    current = next
  }
  if (!current) {
    return { state, steps: ['Traversal failed; the list links are inconsistent.'], visited: [] }
  }
  steps.push(`Walk to the last node (${nodes[current].value}).`)
  nodes[current] = { ...nodes[current], next: node.id }
  nodes[node.id] = node
  steps.push('Point the last node at the new node.', 'The new node becomes the tail.')
  return {
    state: { ...state, nodes, size: state.size + 1 },
    steps,
    visited: [...visited, node.id],
  }
}

export function deleteHead(state: LinkedListState): ListOperation<LinkedListState> {
  if (!state.head) return { state, steps: ['The list is empty; nothing to delete.'], visited: [] }
  const removed = state.nodes[state.head]
  const nodes = { ...state.nodes }
  delete nodes[state.head]
  return {
    state: { head: removed.next, nodes, size: state.size - 1 },
    steps: [
      `Head holds ${removed.value}.`,
      'Move head to the next node.',
      'Unlink and discard the old head node.',
    ],
    visited: [removed.id],
  }
}

export function deleteByValue(state: LinkedListState, value: number): ListOperation<LinkedListState> {
  if (!state.head) return { state, steps: ['The list is empty; nothing to delete.'], visited: [] }
  const visited: string[] = []
  const steps: string[] = []
  let current: string | null = state.head
  let previous: string | null = null

  while (current) {
    visited.push(current)
    const node: ListNode = state.nodes[current]
    steps.push(`Compare ${node.value} with ${value}.`)
    if (node.value === value) {
      const nodes = { ...state.nodes }
      const next = node.next
      if (previous) nodes[previous] = { ...nodes[previous], next }
      else {
        // Removing the head: no pointer to rewrite on a predecessor.
      }
      delete nodes[current]
      steps.push(previous ? 'Link the previous node to the next node.' : 'The removed node was the head; move head forward.')
      return {
        state: {
          head: previous ? state.head : next,
          nodes,
          size: state.size - 1,
        },
        steps,
        visited,
      }
    }
    previous = current
    current = node.next
  }

  steps.push(`${value} was not found. The list is unchanged.`)
  return { state, steps, visited }
}

export function searchList(state: LinkedListState, value: number): { found: boolean; index: number; steps: string[]; visited: string[] } {
  const steps: string[] = []
  const visited: string[] = []
  let current = state.head
  let index = 0
  while (current && state.nodes[current]) {
    visited.push(current)
    const node: ListNode = state.nodes[current]
    steps.push(`Node ${index}: ${node.value} ${node.value === value ? '= target. Found it.' : '≠ target. Follow next.'}`)
    if (node.value === value) return { found: true, index, steps, visited }
    current = node.next
    index += 1
  }
  steps.push('Reached null. The value is not in the list.')
  return { found: false, index: -1, steps, visited }
}

export function traverseList(state: LinkedListState): { values: number[]; steps: string[]; visited: string[] } {
  const values: number[] = []
  const steps: string[] = []
  const visited: string[] = []
  let current = state.head
  let guard = 0
  while (current && state.nodes[current] && guard < state.size + 2) {
    const node: ListNode = state.nodes[current]
    visited.push(current)
    values.push(node.value)
    steps.push(`Visit node ${guard}: ${node.value}. Follow next → ${node.next ? 'another node' : 'null (end)'}.`)
    current = node.next
    guard += 1
  }
  steps.push('Traversal complete. Reached null without cycles.')
  return { values, steps, visited }
}

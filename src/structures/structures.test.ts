import { describe, expect, it } from 'vitest'
import {
  deleteArray,
  dequeue,
  enqueue,
  insertArray,
  peekQueue,
  peekStack,
  popStack,
  pushStack,
  searchArray,
  updateArray,
} from './linearStructures'
import {
  deleteByValue,
  deleteHead,
  emptyList,
  insertAtHead,
  insertAtTail,
  listValues,
  searchList,
  traverseList,
} from './linkedList'
import {
  bstHeight,
  deleteBST,
  emptyBST,
  insertBST,
  searchBST,
  traverseBST,
} from './bst'
import {
  bucketIndex,
  createHashTable,
  hashDelete,
  hashInsert,
  hashLookup,
} from './hashTable'

describe('array operations', () => {
  it('inserts at the head, middle, and end', () => {
    expect(insertArray([3, 5], 0, 1).values).toEqual([1, 3, 5])
    expect(insertArray([3, 5], 1, 4).values).toEqual([3, 4, 5])
    expect(insertArray([3, 5], 2, 7).values).toEqual([3, 5, 7])
  })

  it('rejects invalid insertion and deletion indices', () => {
    expect(insertArray([1, 2], -1, 9).ok).toBe(false)
    expect(insertArray([1, 2], 3, 9).ok).toBe(false)
    expect(deleteArray([1, 2], 2).ok).toBe(false)
    expect(deleteArray([], 0).ok).toBe(false)
  })

  it('deletes and updates existing elements', () => {
    expect(deleteArray([1, 2, 3], 1).values).toEqual([1, 3])
    expect(updateArray([1, 2, 3], 2, 9).values).toEqual([1, 2, 9])
    expect(updateArray([1, 2], 5, 9).ok).toBe(false)
  })

  it('searches linearly and reports a miss', () => {
    expect(searchArray([4, 7, 9], 7).index).toBe(1)
    expect(searchArray([4, 7, 9], 7).ok).toBe(true)
    expect(searchArray([4, 7, 9], 8).ok).toBe(false)
    expect(searchArray([], 1).ok).toBe(false)
  })
})

describe('stack and queue operations', () => {
  it('pushes, pops, and peeks in LIFO order', () => {
    const pushed = pushStack([], 4)
    const twice = pushStack(pushed.items, 7)
    expect(twice.items).toEqual([4, 7])
    expect(peekStack(twice.items).peek).toBe(7)
    const popped = popStack(twice.items)
    expect(popped.removed).toBe(7)
    expect(popped.items).toEqual([4])
  })

  it('handles an empty stack without mutating it', () => {
    const empty: number[] = []
    expect(popStack(empty).ok).toBe(false)
    expect(peekStack(empty).ok).toBe(false)
    expect(empty).toEqual([])
  })

  it('enqueues and dequeues in FIFO order', () => {
    const first = enqueue([], 2)
    const second = enqueue(first.items, 5)
    expect(peekQueue(second.items).peek).toBe(2)
    const dequeued = dequeue(second.items)
    expect(dequeued.removed).toBe(2)
    expect(dequeued.items).toEqual([5])
  })

  it('handles an empty queue', () => {
    expect(dequeue([]).ok).toBe(false)
    expect(peekQueue([]).ok).toBe(false)
  })
})

describe('linked list operations', () => {
  it('inserts at the head and tail while preserving order', () => {
    let state = emptyList()
    state = insertAtTail(state, 2).state
    state = insertAtTail(state, 3).state
    state = insertAtHead(state, 1).state
    expect(listValues(state)).toEqual([1, 2, 3])
    expect(state.size).toBe(3)
  })

  it('deletes the head and by value', () => {
    let state = emptyList()
    for (const value of [1, 2, 3, 4]) state = insertAtTail(state, value).state

    state = deleteHead(state).state
    expect(listValues(state)).toEqual([2, 3, 4])

    state = deleteByValue(state, 3).state
    expect(listValues(state)).toEqual([2, 4])

    state = deleteByValue(state, 2).state
    expect(listValues(state)).toEqual([4])

    const unchanged = deleteByValue(state, 99)
    expect(listValues(unchanged.state)).toEqual([4])
    expect(unchanged.state.size).toBe(state.size)
  })

  it('handles an empty list safely', () => {
    const state = emptyList()
    expect(listValues(state)).toEqual([])
    expect(deleteHead(state).state).toBe(state)
    expect(deleteByValue(state, 1).state).toBe(state)
    expect(searchList(state, 1).found).toBe(false)
    expect(traverseList(state).values).toEqual([])
  })

  it('searches and traverses with correct indices', () => {
    let state = emptyList()
    for (const value of [5, 9, 12]) state = insertAtTail(state, value).state
    expect(searchList(state, 9).found).toBe(true)
    expect(searchList(state, 9).index).toBe(1)
    expect(searchList(state, 7).found).toBe(false)
    expect(traverseList(state).values).toEqual([5, 9, 12])
  })
})

describe('binary search tree operations', () => {
  function sampleTree() {
    let state = emptyBST()
    for (const value of [8, 3, 10, 1, 6, 14, 4, 7, 13]) {
      state = insertBST(state, value).state
    }
    return state
  }

  it('inserts values and keeps in-order traversal sorted', () => {
    const state = sampleTree()
    expect(state.size).toBe(9)
    expect(traverseBST(state, 'inorder').values).toEqual([1, 3, 4, 6, 7, 8, 10, 13, 14])
    expect(traverseBST(state, 'preorder').values).toEqual([8, 3, 1, 6, 4, 7, 10, 14, 13])
    expect(traverseBST(state, 'postorder').values).toEqual([1, 4, 7, 6, 3, 13, 14, 10, 8])
  })

  it('ignores duplicate insertions', () => {
    const state = sampleTree()
    const duplicate = insertBST(state, 6)
    expect(duplicate.state.size).toBe(state.size)
    expect(traverseBST(duplicate.state, 'inorder').values).toEqual(traverseBST(state, 'inorder').values)
  })

  it('searches existing and missing values', () => {
    const state = sampleTree()
    expect(searchBST(state, 7).found).toBe(true)
    expect(searchBST(state, 13).found).toBe(true)
    expect(searchBST(state, 99).found).toBe(false)
    expect(searchBST(emptyBST(), 1).found).toBe(false)
  })

  it('deletes a leaf, a one-child node, and a two-child node', () => {
    let state = sampleTree()

    state = deleteBST(state, 4).state
    expect(traverseBST(state, 'inorder').values).toEqual([1, 3, 6, 7, 8, 10, 13, 14])

    state = deleteBST(state, 10).state
    expect(traverseBST(state, 'inorder').values).toEqual([1, 3, 6, 7, 8, 13, 14])

    state = deleteBST(state, 3).state
    expect(traverseBST(state, 'inorder').values).toEqual([1, 6, 7, 8, 13, 14])
    expect(searchBST(state, 3).found).toBe(false)
  })

  it('deletes the root with two children without losing nodes', () => {
    let state = sampleTree()
    state = deleteBST(state, 8).state
    expect(traverseBST(state, 'inorder').values).toEqual([1, 3, 4, 6, 7, 10, 13, 14])
    expect(state.size).toBe(8)
    expect(bstHeight(state)).toBeGreaterThan(0)
  })

  it('handles deletion from an empty tree', () => {
    const state = emptyBST()
    expect(deleteBST(state, 1).found).toBe(false)
    expect(state.size).toBe(0)
  })
})

describe('hash table operations', () => {
  it('inserts, looks up, updates, and deletes a key', () => {
    let state = createHashTable(7)
    const inserted = hashInsert(state, 'ada', '1815')
    state = inserted.state
    expect(inserted.collisions).toBe(0)
    expect(hashLookup(state, 'ada').found).toBe(true)
    expect(hashLookup(state, 'ada').steps.at(-1)).toContain('1815')

    const updated = hashInsert(state, 'ada', '1843')
    state = updated.state
    expect(state.size).toBe(1)
    expect(hashLookup(state, 'ada').steps.at(-1)).toContain('1843')

    const deleted = hashDelete(state, 'ada')
    expect(deleted.found).toBe(true)
    expect(deleted.state.size).toBe(0)
    expect(hashLookup(deleted.state, 'ada').found).toBe(false)
  })

  it('puts colliding keys in the same chain and finds them there', () => {
    const capacity = 7
    const firstKey = 'ada'
    const firstBucket = bucketIndex(firstKey, capacity)
    let collisionKey = ''
    for (let code = 97; code <= 122; code += 1) {
      const candidate = String.fromCharCode(code)
      if (candidate !== firstKey && bucketIndex(candidate, capacity) === firstBucket) {
        collisionKey = candidate
        break
      }
    }
    expect(collisionKey).not.toBe('')

    let state = createHashTable(capacity)
    state = hashInsert(state, firstKey, 'one').state
    const collision = hashInsert(state, collisionKey, 'two')
    state = collision.state

    expect(collision.collisions).toBe(1)
    expect(state.size).toBe(2)
    expect(state.buckets[firstBucket]).toHaveLength(2)
    expect(hashLookup(state, firstKey).found).toBe(true)
    expect(hashLookup(state, collisionKey).found).toBe(true)
  })

  it('reports absent lookups and deletes without changing the table', () => {
    const state = createHashTable(7)
    const lookup = hashLookup(state, 'missing')
    expect(lookup.found).toBe(false)
    expect(lookup.state.size).toBe(0)

    const deleted = hashDelete(state, 'missing')
    expect(deleted.found).toBe(false)
    expect(deleted.state.size).toBe(0)
  })
})

import type { LucideIcon } from 'lucide-react'
import {
  Boxes,
  Link2,
  ListOrdered,
  Network,
  Rows3,
  Table2,
} from 'lucide-react'

export interface StructureOperation {
  name: string
  complexity: string
  note: string
}

export interface StructureInfo {
  slug: string
  name: string
  shortName: string
  tagline: string
  description: string
  icon: LucideIcon
  operations: StructureOperation[]
  notes: string[]
  useCases: string
}

export const STRUCTURES: StructureInfo[] = [
  {
    slug: 'array',
    name: 'Arrays',
    shortName: 'Array',
    tagline: 'Contiguous cells with constant-time indexing.',
    description:
      'An array stores values in consecutive slots. Reading or writing a slot by index is immediate because the address is computed from the base address and index. Inserting or deleting in the middle forces later values to shift.',
    icon: Rows3,
    operations: [
      { name: 'Access by index', complexity: 'O(1)', note: 'Direct address calculation; no traversal.' },
      { name: 'Search value', complexity: 'O(n)', note: 'Unsorted arrays need a linear scan.' },
      { name: 'Insert at index', complexity: 'O(n)', note: 'Later values shift right to open a gap.' },
      { name: 'Delete at index', complexity: 'O(n)', note: 'Later values shift left to close the gap.' },
    ],
    notes: ['Access is constant time.', 'Insert and delete in the middle are linear.'],
    useCases: 'Lookup-heavy work, numeric data, and buffers where order matters.',
  },
  {
    slug: 'linked-list',
    name: 'Linked lists',
    shortName: 'Linked list',
    tagline: 'Nodes scattered in memory, joined by pointers.',
    description:
      'A linked list stores each value in a node with a pointer to the next node. There is no index math: reaching position k means following k links. Adding or removing at the head is constant time because only the head pointer changes.',
    icon: Link2,
    operations: [
      { name: 'Insert at head', complexity: 'O(1)', note: 'Create a node and repoint head.' },
      { name: 'Insert at tail', complexity: 'O(n)', note: 'Without a tail pointer, walk to the end first.' },
      { name: 'Delete head', complexity: 'O(1)', note: 'Move head to the next node.' },
      { name: 'Search / traverse', complexity: 'O(n)', note: 'Follow next links one at a time.' },
    ],
    notes: ['No random access.', 'Great when insertion at the front dominates.'],
    useCases: 'Stacks, queues, adjacency lists, and data that changes at its front.',
  },
  {
    slug: 'stack',
    name: 'Stacks',
    shortName: 'Stack',
    tagline: 'Last in, first out.',
    description:
      'A stack exposes only its top. Push adds a value to the top; pop removes the most recently added value. This LIFO discipline is exactly what powers function calls, undo history, and depth-first search.',
    icon: ListOrdered,
    operations: [
      { name: 'Push', complexity: 'O(1)', note: 'Add to the top.' },
      { name: 'Pop', complexity: 'O(1)', note: 'Remove and return the top.' },
      { name: 'Peek', complexity: 'O(1)', note: 'Read the top without removing it.' },
    ],
    notes: ['Only the top is accessible.', 'Empty pop is an error or a no-op.'],
    useCases: 'Call stacks, expression evaluation, undo stacks, and DFS frontiers.',
  },
  {
    slug: 'queue',
    name: 'Queues',
    shortName: 'Queue',
    tagline: 'First in, first out.',
    description:
      'A queue adds at the back and removes from the front. The oldest waiting value is served first, which makes queues the natural model for breadth-first search, schedulers, and message buffers.',
    icon: Boxes,
    operations: [
      { name: 'Enqueue', complexity: 'O(1)', note: 'Add to the back.' },
      { name: 'Dequeue', complexity: 'O(1)', note: 'Remove and return the front.' },
      { name: 'Peek', complexity: 'O(1)', note: 'Read the front without removing it.' },
    ],
    notes: ['Order is preserved.', 'Naive array queues can make dequeue O(n).'],
    useCases: 'BFS, task scheduling, buffering streams, and rate limiting.',
  },
  {
    slug: 'bst',
    name: 'Binary search trees',
    shortName: 'BST',
    tagline: 'Ordered branching: smaller left, larger right.',
    description:
      'In a binary search tree every node has at most two children, and the left subtree holds smaller values while the right subtree holds larger ones. Searching follows one path from root to leaf, so height determines cost. Traversals reveal different orderings of the same values.',
    icon: Network,
    operations: [
      { name: 'Search', complexity: 'O(h)', note: 'One comparison per level.' },
      { name: 'Insert', complexity: 'O(h)', note: 'Follow comparisons to a null child.' },
      { name: 'Delete', complexity: 'O(h)', note: 'Two-child delete copies the successor value.' },
      { name: 'In-order traversal', complexity: 'O(n)', note: 'Visits values in ascending order.' },
    ],
    notes: ['Duplicates are ignored in this lab.', 'Worst-case height can be n, which makes search O(n).'],
    useCases: 'Ordered data with frequent lookups and insertions; the basis of balanced trees.',
  },
  {
    slug: 'hash-table',
    name: 'Hash tables',
    shortName: 'Hash table',
    tagline: 'Hash a key, jump to a bucket, resolve collisions.',
    description:
      'A hash table maps keys to buckets with a hash function, so lookup does not scan the values. Different keys can land in the same bucket; this is a collision. Chaining stores colliding entries in a short list inside the bucket, which is what this lab visualizes.',
    icon: Table2,
    operations: [
      { name: 'Insert', complexity: 'O(1) average', note: 'Hash, then append to the bucket chain.' },
      { name: 'Lookup', complexity: 'O(1) average', note: 'Hash, then scan only that chain.' },
      { name: 'Delete', complexity: 'O(1) average', note: 'Unlink from the bucket chain.' },
    ],
    notes: ['Average constant-time operations.', 'Many collisions degrade toward O(n).'],
    useCases: 'Caches, dictionaries, symbol tables, and deduplication.',
  },
]

export function findStructure(slug: string | undefined): StructureInfo | undefined {
  return STRUCTURES.find((structure) => structure.slug === slug)
}

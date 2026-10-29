export interface HashEntry {
  key: string
  value: string
}

export interface HashTableState {
  buckets: HashEntry[][]
  size: number
  capacity: number
}

export function hashString(key: string): number {
  let hash = 5381
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 33) ^ key.charCodeAt(i)
  }
  return hash >>> 0
}

export function bucketIndex(key: string, capacity: number): number {
  return hashString(key) % capacity
}

export function createHashTable(capacity = 7): HashTableState {
  return {
    buckets: Array.from({ length: capacity }, () => []),
    size: 0,
    capacity,
  }
}

export interface HashOperation {
  state: HashTableState
  steps: string[]
  index: number
  collisions: number
  found: boolean
}

function cloneBuckets(state: HashTableState): HashEntry[][] {
  return state.buckets.map((bucket) => bucket.slice())
}

export function hashInsert(state: HashTableState, key: string, value: string): HashOperation {
  const index = bucketIndex(key, state.capacity)
  const buckets = cloneBuckets(state)
  const bucket = buckets[index]
  const steps: string[] = [`Hash "${key}" → bucket ${index} (hash ${hashString(key)} mod ${state.capacity}).`]

  const existing = bucket.findIndex((entry) => entry.key === key)
  if (existing >= 0) {
    bucket[existing] = { key, value }
    steps.push('The key already exists. Replace its value in the chain; no new entry.')
    return { state: { ...state, buckets }, steps, index, collisions: 0, found: true }
  }

  if (bucket.length > 0) {
    steps.push(`Bucket ${index} is occupied. Collision: append "${key}" to the chain.`)
  } else {
    steps.push(`Bucket ${index} is empty. Place "${key}" at the front of its chain.`)
  }

  bucket.push({ key, value })
  steps.push(`Store ${key} → ${value}. Chain length is now ${bucket.length}.`)

  return {
    state: { buckets, size: state.size + 1, capacity: state.capacity },
    steps,
    index,
    collisions: bucket.length - 1,
    found: false,
  }
}

export function hashLookup(state: HashTableState, key: string): HashOperation {
  const index = bucketIndex(key, state.capacity)
  const bucket = state.buckets[index]
  const steps: string[] = [`Hash "${key}" → bucket ${index}.`]

  for (let i = 0; i < bucket.length; i += 1) {
    steps.push(`Compare "${bucket[i].key}" with "${key}" at chain position ${i}.`)
    if (bucket[i].key === key) {
      steps.push(`Found ${key} → ${bucket[i].value} after ${i + 1} chain ${i === 0 ? 'check' : 'checks'}.`)
      return {
        state,
        steps,
        index,
        collisions: i,
        found: true,
      }
    }
  }

  steps.push(`Scanned the entire chain of length ${bucket.length}. "${key}" is not stored.`)
  return { state, steps, index, collisions: bucket.length, found: false }
}

export function hashDelete(state: HashTableState, key: string): HashOperation {
  const index = bucketIndex(key, state.capacity)
  const buckets = cloneBuckets(state)
  const bucket = buckets[index]
  const steps: string[] = [`Hash "${key}" → bucket ${index}.`]

  const position = bucket.findIndex((entry) => entry.key === key)
  if (position < 0) {
    steps.push(`"${key}" is not in this chain. Nothing to delete.`)
    return { state, steps, index, collisions: bucket.length, found: false }
  }

  steps.push(`Walk ${position} ${position === 1 ? 'link' : 'links'} into the chain.`)
  const [removed] = bucket.splice(position, 1)
  steps.push(`Unlink "${removed.key}" from bucket ${index}.`)

  return {
    state: { ...state, buckets, size: Math.max(0, state.size - 1) },
    steps,
    index,
    collisions: bucket.length,
    found: true,
  }
}

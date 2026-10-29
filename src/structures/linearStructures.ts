export interface LinearOperation {
  items: number[]
  steps: string[]
  removed?: number
  peek?: number
  ok: boolean
}

export function pushStack(items: number[], value: number): LinearOperation {
  return {
    items: [...items, value],
    steps: [`Push ${value} onto the top of the stack.`, 'The newest value is now the only one accessible.'],
    ok: true,
  }
}

export function popStack(items: number[]): LinearOperation {
  if (items.length === 0) {
    return { items, steps: ['The stack is empty. Pop has no value to remove.'], ok: false }
  }
  const removed = items[items.length - 1]
  return {
    items: items.slice(0, -1),
    steps: [`Pop ${removed} from the top.`, items.length === 1 ? 'The stack is now empty.' : `${items.length - 1} values remain.`],
    removed,
    ok: true,
  }
}

export function peekStack(items: number[]): LinearOperation {
  if (items.length === 0) {
    return { items, steps: ['The stack is empty. There is nothing to peek at.'], ok: false }
  }
  return {
    items,
    steps: [`Peek returns ${items[items.length - 1]} without removing it.`, 'Only the top is visible in a stack.'],
    peek: items[items.length - 1],
    ok: true,
  }
}

export function enqueue(items: number[], value: number): LinearOperation {
  return {
    items: [...items, value],
    steps: [`Enqueue ${value} at the back of the queue.`, 'Earlier values keep their place at the front.'],
    ok: true,
  }
}

export function dequeue(items: number[]): LinearOperation {
  if (items.length === 0) {
    return { items, steps: ['The queue is empty. Dequeue has no value to remove.'], ok: false }
  }
  const removed = items[0]
  return {
    items: items.slice(1),
    steps: [`Dequeue ${removed} from the front.`, items.length === 1 ? 'The queue is now empty.' : `${items.length - 1} values remain.`],
    removed,
    ok: true,
  }
}

export function peekQueue(items: number[]): LinearOperation {
  if (items.length === 0) {
    return { items, steps: ['The queue is empty. There is nothing at the front.'], ok: false }
  }
  return {
    items,
    steps: [`Peek returns the front value ${items[0]}.`, 'The value stays in the queue.'],
    peek: items[0],
    ok: true,
  }
}

export interface ArrayOp {
  values: number[]
  steps: string[]
  ok: boolean
  index?: number
}

export function insertArray(values: number[], index: number, value: number): ArrayOp {
  if (!Number.isInteger(index) || index < 0 || index > values.length) {
    return {
      values,
      steps: [`Index ${index} is outside 0..${values.length}. Insert needs a gap to open.`],
      ok: false,
    }
  }
  const next = [...values]
  next.splice(index, 0, value)
  return {
    values: next,
    steps: [
      `Open a gap at index ${index}.`,
      `Write ${value} into the gap.`,
      index < values.length ? `Shift ${values.length - index} later values right.` : 'Appended to the end; no shifting needed.',
    ],
    ok: true,
    index,
  }
}

export function deleteArray(values: number[], index: number): ArrayOp {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) {
    return {
      values,
      steps: [`Index ${index} is outside 0..${values.length - 1}. Nothing to remove.`],
      ok: false,
    }
  }
  const next = [...values]
  const removed = next.splice(index, 1)[0]
  return {
    values: next,
    steps: [
      `Remove ${removed} from index ${index}.`,
      index < values.length - 1 ? 'Shift every later value one index left.' : 'The last element was removed; no shifting needed.',
    ],
    ok: true,
    index,
  }
}

export function updateArray(values: number[], index: number, value: number): ArrayOp {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) {
    return {
      values,
      steps: [`Index ${index} is outside 0..${values.length - 1}. Nothing to update.`],
      ok: false,
    }
  }
  const next = [...values]
  const previous = next[index]
  next[index] = value
  return {
    values: next,
    steps: [`Overwrite a[${index}]: ${previous} → ${value}.`, 'An array update is a direct write at a known address.'],
    ok: true,
    index,
  }
}

export function searchArray(values: number[], target: number): ArrayOp {
  const steps: string[] = []
  for (let i = 0; i < values.length; i += 1) {
    steps.push(`Compare a[${i}] = ${values[i]} with ${target}.`)
    if (values[i] === target) {
      steps.push(`Found ${target} at index ${i}.`)
      return { values, steps, ok: true, index: i }
    }
  }
  steps.push(`${target} is not in the array.`)
  return { values, steps, ok: false, index: -1 }
}

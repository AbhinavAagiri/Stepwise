import {
  Counter,
  type MergeAux,
  type SortFrame,
  type SortFrameKind,
} from '../../engine/types'

interface FramePatch {
  line: string
  note: string
  kind: SortFrameKind
  compare?: [number, number] | null
  pivot?: number | null
  min?: number | null
  key?: number | null
  keyValue?: number | null
  write?: number | null
  range?: [number, number] | null
  mid?: number | null
  heapSize?: number | null
  aux?: MergeAux | null
}

export class SortRecorder {
  readonly array: number[]
  readonly sorted: boolean[]
  readonly frames: SortFrame[] = []
  readonly stats = new Counter()

  constructor(input: readonly number[]) {
    this.array = input.slice()
    this.sorted = new Array(input.length).fill(false)
  }

  push(patch: FramePatch): void {
    this.frames.push({
      array: this.array.slice(),
      compare: patch.compare ?? null,
      pivot: patch.pivot ?? null,
      min: patch.min ?? null,
      key: patch.key ?? null,
      keyValue: patch.keyValue ?? null,
      write: patch.write ?? null,
      range: patch.range ?? null,
      mid: patch.mid ?? null,
      sorted: this.sorted.slice(),
      heapSize: patch.heapSize ?? null,
      aux: patch.aux ?? null,
      kind: patch.kind,
      line: patch.line,
      note: patch.note,
      stats: this.stats.snapshot(),
    })
  }

  finalize(note: string): void {
    this.sorted.fill(true)
    this.push({ kind: 'done', line: 'ret', note })
  }
}

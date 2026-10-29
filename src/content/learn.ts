export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

export interface LearnTopic {
  slug: string
  title: string
  group: 'Sorting' | 'Searching' | 'Pathfinding' | 'Data structures' | 'Recursion'
  summary: string
  readMinutes: number
  relatedPath: string
  relatedLabel: string
  what: string
  how: string[]
  when: string
  complexity: Array<{ label: string; value: string }>
  pros: string[]
  cons: string[]
  example: string
  quiz: QuizQuestion[]
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    slug: 'sorting-basics',
    title: 'Quadratic sorting, explained',
    group: 'Sorting',
    summary: 'Bubble, selection, and insertion sort all compare pairs, but they spend their work differently.',
    readMinutes: 4,
    relatedPath: '/sorting/insertion-sort',
    relatedLabel: 'Open insertion sort',
    what: 'Bubble, selection, and insertion sort are comparison sorts with O(n²) worst-case time. They reorder the array in place and need no extra buffer. What separates them is where the work goes: swaps, comparisons, or shifting.',
    how: [
      'Bubble sort compares neighbours and swaps out-of-order pairs. The largest unsorted value reaches the end of each pass.',
      'Selection sort scans for the minimum and performs at most one swap per pass, so swaps are rare but comparisons are never skipped.',
      'Insertion sort grows a sorted prefix and shifts larger values right to open a gap for each new key.',
      'Bubble and insertion sort can finish early on already-sorted data. Selection sort cannot.',
    ],
    when: 'Use insertion sort for small arrays or data that is already nearly ordered; its overhead is tiny and its behaviour on nearly sorted input is close to linear. Selection sort is useful when writes are expensive and you want at most n − 1 swaps. Avoid all three for large, randomly ordered collections.',
    complexity: [
      { label: 'Bubble best / worst', value: 'O(n) / O(n²)' },
      { label: 'Selection best / worst', value: 'O(n²) / O(n²)' },
      { label: 'Insertion best / worst', value: 'O(n) / O(n²)' },
      { label: 'Extra space', value: 'O(1)' },
    ],
    pros: ['Simple to implement and verify', 'In-place with no allocation', 'Insertion sort is adaptive and stable'],
    cons: ['Impractical for large arrays', 'Selection sort is not stable', 'Bubble sort performs many writes'],
    example:
      'Sorting [5, 2, 4, 1] with insertion sort: lift 2, shift 5 right, place 2 → [2, 5, 4, 1]. Lift 4, shift 5 right, place 4 → [2, 4, 5, 1]. Lift 1, shift all three right, place 1 → [1, 2, 4, 5]. Every step is local, which is why the technique works well on nearly sorted data.',
    quiz: [
      {
        id: 'almost-sorted',
        prompt: 'Which sorting algorithm is generally most efficient when the input is already almost sorted?',
        options: ['Selection sort', 'Insertion sort', 'Heap sort', 'Merge sort'],
        answer: 1,
        explanation:
          'Insertion sort only shifts values that are out of place. On nearly sorted input those shifts are few, so its running time approaches O(n). Selection sort always scans the full remaining array.',
      },
      {
        id: 'stable',
        prompt: 'Which of these quadratic sorts is stable?',
        options: ['Selection sort', 'Bubble sort', 'Neither is stable', 'Both are stable'],
        answer: 1,
        explanation:
          'Bubble sort only swaps adjacent values that are strictly out of order, so equal values keep their relative order. Selection sort can move a distant minimum past an equal value and break stability.',
      },
    ],
  },
  {
    slug: 'divide-and-conquer',
    title: 'Divide and conquer sorting',
    group: 'Sorting',
    summary: 'Merge sort and quick sort trade space and pivot luck for n log n performance.',
    readMinutes: 4,
    relatedPath: '/sorting/merge-sort',
    relatedLabel: 'Open merge sort',
    what: 'Merge sort and quick sort both split the problem, solve smaller pieces, and combine the results. Merge sort splits by position and merges sorted halves. Quick sort partitions around a pivot and recurses on the two sides. Both average O(n log n).',
    how: [
      'Merge sort splits ranges in half until each is a single element, then merges sorted runs in linear time.',
      'Merging compares the fronts of two buffers and writes the smaller value back, preserving stability.',
      'Quick sort chooses a pivot, moves smaller values to its left, and fixes the pivot in its final position.',
      'The pivot split is not guaranteed to be even, which is where quick sort’s worst case comes from.',
    ],
    when: 'Merge sort is a strong default when predictable O(n log n) time and stability matter more than memory. Quick sort is often the fastest in-memory choice for arrays because its partitions have good cache locality; use a good pivot strategy if the input might be sorted or adversarial.',
    complexity: [
      { label: 'Merge best / worst', value: 'O(n log n) / O(n log n)' },
      { label: 'Quick best / average / worst', value: 'O(n log n) / O(n log n) / O(n²)' },
      { label: 'Merge extra space', value: 'O(n)' },
      { label: 'Quick extra space', value: 'O(log n) stack' },
    ],
    pros: ['Both scale to large inputs', 'Merge sort is stable', 'Quick sort is in-place and cache-friendly'],
    cons: ['Merge sort needs a buffer', 'Quick sort can degrade to O(n²)', 'Neither is ideal for tiny arrays without a cutoff'],
    example:
      'Merge sort on [3, 8, 1, 4] splits into [3, 8] and [1, 4]. Each pair is sorted to [3, 8] and [1, 4]. The final merge compares 3 and 1, takes 1, then compares 3 and 4, takes 3, then copies 4 and 8. Every level touches n values, and there are log₂ n levels.',
    quiz: [
      {
        id: 'merge-space',
        prompt: 'Why does the merge sort shown in this lab use O(n) extra space?',
        options: [
          'It clones the whole tree of recursive calls',
          'It copies each pair of halves into buffers before merging',
          'It sorts using a hash table',
          'It uses a fixed array of 100 slots',
        ],
        answer: 1,
        explanation:
          'Each merge copies the two sorted halves into temporary buffers so their front values can be compared while the original range is overwritten. The largest buffers together are linear in n.',
      },
      {
        id: 'quick-worst',
        prompt: 'When does last-element quick sort hit its O(n²) worst case?',
        options: [
          'When the pivot always splits the range into two roughly equal halves',
          'When the input is already sorted, so every pivot is the extreme value',
          'When the array contains duplicate values',
          'When the array length is a power of two',
        ],
        answer: 1,
        explanation:
          'With the last element as pivot on sorted input, the pivot is the largest remaining value. One partition is empty each time, so the recursion depth becomes n instead of log n.',
      },
    ],
  },
  {
    slug: 'binary-search',
    title: 'Why binary search needs order',
    group: 'Searching',
    summary: 'One comparison can only discard half the candidates if the array is sorted.',
    readMinutes: 3,
    relatedPath: '/searching/binary-search',
    relatedLabel: 'Open binary search',
    what: 'Binary search maintains a low and high boundary around the only possible location of a target. It inspects the midpoint and throws away the half that cannot contain the target. Each probe halves the range, so about log₂ n probes are enough.',
    how: [
      'Require the values to be in non-decreasing order.',
      'Compute mid = floor((low + high) / 2) and compare a[mid] with the target.',
      'If a[mid] is smaller, the answer is to the right of mid; move low past mid.',
      'If a[mid] is larger, the answer is to the left; move high before mid. Stop when low > high.',
    ],
    when: 'Use binary search for a static or infrequently changed sorted collection, or when a search is repeated often enough to justify sorting once. If the data changes constantly or is unsorted, a linear scan or a hash-based index is likely better.',
    complexity: [
      { label: 'Best case', value: 'O(1)' },
      { label: 'Average / worst', value: 'O(log n)' },
      { label: 'Extra space', value: 'O(1) iteratively' },
      { label: 'Recursive stack', value: 'O(log n)' },
    ],
    pros: ['Extremely few comparisons', 'Works in place', 'Predictable logarithmic bounds'],
    cons: ['Requires sorted input', 'Random access is required, so not suitable for linked lists', 'Insertion into a sorted array is still O(n)'],
    example:
      'Search 7 in [1, 3, 4, 7, 9, 12, 15]. The midpoint is 7 at index 3, so it matches immediately. Search 12: midpoint 7 is too small, so the range becomes indices 4-6; midpoint 12 matches. A linear scan would have checked eight values in the second case.',
    quiz: [
      {
        id: 'why-sorted',
        prompt: 'What exactly breaks if binary search runs on an unsorted array?',
        options: [
          'The midpoint calculation divides by zero',
          'Discarding half is no longer safe, because the target might be in the discarded side',
          'The array length must be a power of two',
          'Nothing breaks; it just uses more comparisons',
        ],
        answer: 1,
        explanation:
          'Binary search relies on order to know that every value to the left of a too-small midpoint is also too small. Without that guarantee, a discarded half can contain the target.',
      },
    ],
  },
  {
    slug: 'graph-search',
    title: 'BFS and DFS are two ways to look',
    group: 'Pathfinding',
    summary: 'A queue explores in rings; a stack follows one corridor. Same graph, different paths.',
    readMinutes: 3,
    relatedPath: '/pathfinding?algo=bfs',
    relatedLabel: 'Open BFS on the grid',
    what: 'Breadth-first search and depth-first search visit every reachable node, but in different orders. BFS uses a queue and explores in layers of increasing distance. DFS uses a stack and dives as deep as possible before backtracking.',
    how: [
      'BFS starts with the start node in a queue, then repeatedly removes the front and appends unvisited neighbours.',
      'Because nodes are discovered in distance order, the first time BFS reaches the destination it has the fewest-step path.',
      'DFS removes the most recently added node, so it follows a single route until it dead-ends.',
      'DFS’s first path is valid but often much longer than the shortest path.',
    ],
    when: 'Use BFS when every step costs the same and you need the shortest path, or when you want to explore nearby state first. DFS is useful for exhaustively exploring possibilities, cycle detection, topological ordering, and search spaces where memory matters more than shortest paths.',
    complexity: [
      { label: 'BFS time', value: 'O(V + E)' },
      { label: 'DFS time', value: 'O(V + E)' },
      { label: 'Space', value: 'O(V)' },
      { label: 'Shortest path', value: 'BFS: yes · DFS: no' },
    ],
    pros: ['Both are simple and complete on finite graphs', 'BFS gives shortest unweighted paths', 'DFS uses only a stack'],
    cons: ['BFS can hold a wide frontier in memory', 'DFS can wander into very long paths', 'Neither handles weighted costs'],
    example:
      'On the default grid, BFS expands a diamond-shaped ring around the start, touching every cell within a given step count before moving farther out. DFS commits to one direction, runs along the boundary of a wall, and may snake around the board before finding a route.',
    quiz: [
      {
        id: 'bfs-guarantee',
        prompt: 'Which guarantee belongs to BFS but not DFS?',
        options: [
          'It always terminates',
          'It finds the path with the fewest edges',
          'It can handle walls',
          'It visits every reachable cell',
        ],
        answer: 1,
        explanation:
          'BFS processes nodes in order of distance, so the first time it reaches the destination it has used the fewest possible steps. DFS finds a path if one exists but not necessarily a short one.',
      },
    ],
  },
  {
    slug: 'weighted-paths',
    title: 'Costs, Dijkstra, and A*',
    group: 'Pathfinding',
    summary: 'When steps have different prices, counting edges is not enough.',
    readMinutes: 4,
    relatedPath: '/pathfinding?algo=dijkstra',
    relatedLabel: 'Open Dijkstra',
    what: 'Dijkstra’s algorithm finds the least-cost route on a graph with non-negative edge weights. It settles the cheapest unfinalised node first, then relaxes its neighbours. A* adds a heuristic estimate of the remaining cost to focus the same search toward the destination.',
    how: [
      'Keep a best-known cost from the start to every cell, initially infinity except the start at zero.',
      'Repeatedly pop the unsettled cell with the smallest cost and settle it.',
      'For each neighbour, add the cost of entering it; keep the cheaper of the old and new cost.',
      'A* orders by cost so far plus a heuristic. Manhattan distance is admissible here, so its answer stays optimal.',
    ],
    when: 'Use Dijkstra when every direction is equally plausible or you need distances to many destinations. Use A* when you have one destination and a reliable heuristic; on large grids it can settle far fewer cells. Both require non-negative costs, or the settling argument fails.',
    complexity: [
      { label: 'Dijkstra', value: 'O((V + E) log V)' },
      { label: 'A* average', value: 'O(E log V)' },
      { label: 'A* best', value: 'O(E)' },
      { label: 'Space', value: 'O(V)' },
    ],
    pros: ['Optimal routes with weighted terrain', 'A* often explores much less than Dijkstra', 'Costs can model real constraints'],
    cons: ['Negative weights break Dijkstra', 'A* depends on an admissible heuristic', 'Priority queues add implementation complexity'],
    example:
      'A path across three open cells costs 3. A detour of five rough cells costs 25. BFS, counting steps, may prefer a two-step route through rough terrain (cost 10) over a three-step open route (cost 3) because it ignores terrain. Dijkstra and A* evaluate the actual entry costs and choose the cheaper route.',
    quiz: [
      {
        id: 'astar-heuristic',
        prompt: 'What happens to A* if its heuristic badly overestimates the remaining cost?',
        options: [
          'It becomes Dijkstra',
          'It may return a non-optimal path',
          'It can no longer terminate',
          'It always explores more cells',
        ],
        answer: 1,
        explanation:
          'An admissible heuristic never overestimates. If it does, A* can settle the destination before the true cheapest route is discovered, so the first path returned might not be optimal.',
      },
    ],
  },
  {
    slug: 'linked-lists',
    title: 'Linked lists and pointer surgery',
    group: 'Data structures',
    summary: 'Lose random access, gain constant-time changes at the head.',
    readMinutes: 3,
    relatedPath: '/structures/linked-list',
    relatedLabel: 'Open the linked list',
    what: 'A linked list stores values in separate nodes. Each node holds a next pointer, and the list is reached through a head pointer. There is no contiguous block and no index arithmetic, so reaching a position means walking the links.',
    how: [
      'Insert at the head: create a node whose next is the current head, then move head to it.',
      'Insert at the tail: walk to the last node and point its next at the new node.',
      'Delete: find the node before the target and point it past the target.',
      'Search and traverse: follow next links until the value is found or null is reached.',
    ],
    when: 'Linked lists shine when you frequently add or remove at the front, or when you already hold a reference to a node that must be unlinked. They are a poor fit for index-based access, binary search, or workloads where cache locality matters.',
    complexity: [
      { label: 'Access index k', value: 'O(k)' },
      { label: 'Insert / delete at head', value: 'O(1)' },
      { label: 'Insert at tail', value: 'O(n) without tail pointer' },
      { label: 'Search', value: 'O(n)' },
    ],
    pros: ['Constant-time head operations', 'No capacity or resize requirements', 'Pointers can splice lists cheaply'],
    cons: ['No random access', 'Pointer overhead per value', 'Poor cache locality compared with arrays'],
    example:
      'Inserting 7 at the head of 3 → 5 → 9 requires one new node and one head change: 7 → 3 → 5 → 9. Inserting 7 at index 2 instead requires walking to 3 and 5, then rewiring two pointers. The cost is the traversal, not the wire change.',
    quiz: [
      {
        id: 'list-access',
        prompt: 'Why is accessing the 100th element of a singly linked list O(n) rather than O(1)?',
        options: [
          'The list must be sorted first',
          'Each node’s location is only known by following the previous node’s next pointer',
          'The values are stored in a hash table',
          'Linked lists cannot store more than 99 elements',
        ],
        answer: 1,
        explanation:
          'There is no base address plus index arithmetic. A singly linked list only exposes its head, so position 100 requires following 100 links.',
      },
    ],
  },
  {
    slug: 'stacks-and-queues',
    title: 'LIFO, FIFO, and the shape of a search',
    group: 'Data structures',
    summary: 'Two tiny rules about ordering decide whether a search goes wide or deep.',
    readMinutes: 2,
    relatedPath: '/structures/stack',
    relatedLabel: 'Open stacks and queues',
    what: 'A stack removes the most recently added value (last in, first out). A queue removes the oldest waiting value (first in, first out). Both restrict access to one end of the collection, which makes their operations constant time and their behaviour predictable.',
    how: [
      'Stack: push adds to the top, pop removes the top, peek reads the top.',
      'Queue: enqueue adds at the back, dequeue removes the front, peek reads the front.',
      'Function calls use a stack: the most recent call must finish first.',
      'BFS uses a queue, which is exactly why it explores in widening rings.',
    ],
    when: 'Use a stack for undo history, expression parsing, backtracking, and DFS. Use a queue for fair scheduling, buffering, rate limiting, and BFS. If you need random access or removal from arbitrary positions, neither abstraction fits.',
    complexity: [
      { label: 'Stack push / pop / peek', value: 'O(1)' },
      { label: 'Queue enqueue / dequeue / peek', value: 'O(1)' },
      { label: 'Search', value: 'O(n)' },
      { label: 'Space', value: 'O(n)' },
    ],
    pros: ['Tiny, predictable interfaces', 'Constant-time core operations', 'Directly model real processes'],
    cons: ['No access to the middle', 'Easy to confuse LIFO and FIFO under pressure', 'A naive array queue makes dequeue O(n)'],
    example:
      'Pushing 4, 7, 9 onto a stack gives a top of 9. Popping twice returns 9, then 7. Enqueuing the same values gives a front of 4; dequeuing twice returns 4, then 7. Same values, opposite service order.',
    quiz: [
      {
        id: 'bfs-queue',
        prompt: 'Which structure drives breadth-first search’s ring-by-ring exploration?',
        options: ['A stack', 'A priority queue ordered by value', 'A queue', 'A binary search tree'],
        answer: 2,
        explanation:
          'BFS adds newly discovered nodes to the back and removes from the front. That FIFO order ensures all nodes at distance d are processed before any at distance d + 1.',
      },
    ],
  },
  {
    slug: 'binary-search-trees',
    title: 'Binary search trees, without the magic',
    group: 'Data structures',
    summary: 'A sorted invariant at every node turns search into a single root-to-leaf walk.',
    readMinutes: 3,
    relatedPath: '/structures/bst',
    relatedLabel: 'Open the BST lab',
    what: 'A binary search tree stores smaller values in the left subtree and larger values in the right. Searching, inserting, and deleting all follow one path, comparing once per level. The height of that path - not the number of nodes - determines the cost.',
    how: [
      'Search: compare at the root, then go left or right and repeat.',
      'Insert: follow comparisons until a null child is found; attach the new value there.',
      'Delete: a leaf disappears; one child is promoted; two children copy the in-order successor’s value and remove that successor.',
      'In-order traversal (left, node, right) visits every value in ascending order.',
    ],
    when: 'Use a BST when you need ordered operations - successor, predecessor, range queries - alongside fast lookup. An unbalanced BST built from sorted input degenerates into a linked list, so production systems use balanced variants such as red-black or AVL trees.',
    complexity: [
      { label: 'Search / insert / delete', value: 'O(h)' },
      { label: 'Balanced height', value: 'O(log n)' },
      { label: 'Worst-case height', value: 'O(n)' },
      { label: 'In-order traversal', value: 'O(n)' },
    ],
    pros: ['Maintains sorted order', 'Supports range and neighbour queries', 'Traversals are simple and useful'],
    cons: ['Can become unbalanced', 'Deletion has several cases', 'No constant-time indexing'],
    example:
      'Insert 8, 3, 10, 1, 6. The root is 8; 3 goes left, 10 goes right, 1 goes left of 3, and 6 goes right of 3. Searching 6 compares with 8 (left), 3 (right), then 6 - three comparisons. Inserting the values in sorted order would instead create a chain of height five.',
    quiz: [
      {
        id: 'bst-traversal',
        prompt: 'Which traversal of a binary search tree returns its values in ascending order?',
        options: ['Pre-order', 'Post-order', 'Breadth-first', 'In-order'],
        answer: 3,
        explanation:
          'In-order visits the entire left subtree before the node, then the right subtree. Because every left value is smaller and every right value is larger, this produces sorted output.',
      },
    ],
  },
  {
    slug: 'hash-tables',
    title: 'Hashing and collisions',
    group: 'Data structures',
    summary: 'Turn a key into a bucket index, then handle the unavoidable overlaps.',
    readMinutes: 3,
    relatedPath: '/structures/hash-table',
    relatedLabel: 'Open the hash table',
    what: 'A hash table applies a hash function to a key and uses the result modulo the bucket count to choose a bucket. Lookup does not scan the whole collection - it scans only the bucket. Different keys can map to the same bucket, which is a collision.',
    how: [
      'Hash the key to an integer and reduce it to a bucket index.',
      'Insert: place the key-value pair in that bucket, appending if the bucket is occupied.',
      'Lookup: recompute the index and compare only the keys in that bucket chain.',
      'Collision handling with chaining keeps colliding entries in a short list; open addressing would probe for another slot instead.',
    ],
    when: 'Use hash tables for membership tests, dictionaries, caches, and deduplication where average-case speed matters and iteration order does not. They are a poor fit for ordered range queries, and a bad hash function or undersized table can collapse performance toward linear scans.',
    complexity: [
      { label: 'Insert / lookup / delete', value: 'O(1) average' },
      { label: 'Worst case', value: 'O(n)' },
      { label: 'Space', value: 'O(n)' },
      { label: 'Ordered operations', value: 'Not supported cheaply' },
    ],
    pros: ['Average constant-time operations', 'Simple key-value model', 'Excellent for membership and caching'],
    cons: ['No ordering', 'Collisions can degrade performance', 'Hash quality and load factor matter'],
    example:
      'With 7 buckets, the keys "ada", "grace", and "alan" may all hash to bucket 2. Chaining stores all three in that bucket. A lookup for "grace" hashes to bucket 2 and compares the chain entries until it finds the key - faster than scanning every stored key, slower than an empty bucket.',
    quiz: [
      {
        id: 'collision',
        prompt: 'What is a hash collision?',
        options: [
          'Two keys produce the same bucket index',
          'A hash table runs out of memory',
          'A key is deleted twice',
          'A bucket contains more values than the table size',
        ],
        answer: 0,
        explanation:
          'A collision happens when distinct keys hash to the same bucket. Collision resolution, such as chaining or probing, decides what happens next.',
      },
    ],
  },
  {
    slug: 'recursion-and-the-stack',
    title: 'Recursion is a stack you can watch',
    group: 'Recursion',
    summary: 'Every pending call keeps its own arguments and its place in the code.',
    readMinutes: 3,
    relatedPath: '/recursion/factorial',
    relatedLabel: 'Open factorial',
    what: 'A recursive function solves a problem by calling itself on a smaller input. Each call gets its own frame containing arguments, local variables, and a return address. Frames accumulate until a base case returns, then unwind in reverse order.',
    how: [
      'A base case must return without recursing; without it, the stack grows until it overflows.',
      'Each recursive call should move toward the base case.',
      'The caller pauses at the call site until the callee returns.',
      'On unwinding, each frame resumes with the returned value and finishes its own work.',
    ],
    when: 'Recursion is a natural fit for trees, divide-and-conquer, backtracking, and grammars. It is a poor fit when depth could be very large, since each frame consumes stack space. Naive Fibonacci shows the other risk: overlapping subproblems can make a short recursive definition exponentially expensive.',
    complexity: [
      { label: 'Factorial', value: 'O(n) time · O(n) stack' },
      { label: 'Naive Fibonacci', value: 'O(2ⁿ) time · O(n) stack' },
      { label: 'Tower of Hanoi', value: 'O(2ⁿ) moves · O(n) stack' },
      { label: 'Recursive binary search', value: 'O(log n) stack' },
    ],
    pros: ['Matches the structure of trees and divide-and-conquer', 'Removes explicit stack bookkeeping', 'Base cases make termination auditable'],
    cons: ['Stack depth is a real limit', 'Overlapping calls can waste work', 'Debugging across frames is harder'],
    example:
      'factorial(4) calls factorial(3), which calls factorial(2), then factorial(1). Four frames are alive before any value returns. factorial(1) returns 1, so factorial(2) computes 2 × 1, factorial(3) computes 3 × 2, and factorial(4) computes 4 × 6 = 24. The visualizer shows exactly this growth and collapse.',
    quiz: [
      {
        id: 'base-case',
        prompt: 'What happens if a recursive function has no reachable base case?',
        options: [
          'It automatically returns null',
          'It keeps making calls until the call stack overflows',
          'The compiler inserts a base case',
          'It becomes iterative',
        ],
        answer: 1,
        explanation:
          'Each call adds a frame and none of them return. Eventually the runtime exhausts the call stack and throws a stack overflow error.',
      },
      {
        id: 'fib-repeat',
        prompt: 'Why is naive recursive Fibonacci exponential despite needing only n distinct values?',
        options: [
          'It sorts the call tree at every step',
          'The same subproblems are recomputed in different branches',
          'It uses a hash table with too many buckets',
          'It allocates an array of size 2ⁿ',
        ],
        answer: 1,
        explanation:
          'fib(n − 2) is recomputed inside the fib(n − 1) branch, and that duplication compounds at every level. Memoizing results collapses the tree to linear work.',
      },
    ],
  },
]

export function findLearnTopic(slug: string | undefined): LearnTopic | undefined {
  return LEARN_TOPICS.find((topic) => topic.slug === slug)
}

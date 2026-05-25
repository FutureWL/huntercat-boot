import type { Todo } from "@pjd/shared" // 引入共享的 Todo 类型（packages/shared）

type TodoStore = {
  nextId: number // 下一个自增 id（示例用）
  items: Todo[] // Todo 列表（内存存储）
} // 内存存储结构

const STORE_KEY = Symbol.for("pjd.vcn.todoStore") // 全局唯一 key，用于把 store 挂到 globalThis（热更新不易丢）

function getStore(): TodoStore {
  const g = globalThis as unknown as Record<PropertyKey, unknown> // 获取全局对象（以便跨模块/热更新复用同一份数据）
  const existing = g[STORE_KEY] as TodoStore | undefined // 尝试读取已存在的 store

  if (existing) return existing // 如果已有 store，直接复用

  const created: TodoStore = { nextId: 1, items: [] } // 初始化 store
  g[STORE_KEY] = created // 写入 globalThis（保证后续请求可复用）
  return created // 返回新建 store
}

export function listTodos(): Todo[] {
  return getStore().items // 返回全部 Todo
}

export function getTodo(id: string): Todo | undefined {
  return getStore().items.find((t) => t.id === id) // 按 id 查找 Todo（找不到则 undefined）
}

export function createTodo(title: string): Todo {
  const store = getStore() // 获取 store
  const now = new Date().toISOString() // 生成当前时间（ISO）

  const todo: Todo = {
    id: String(store.nextId++), // 分配 id 并自增
    title, // 写入标题
    completed: false, // 默认未完成
    createdAt: now, // 创建时间
    updatedAt: now, // 更新时间（创建时=创建时间）
  }

  store.items.push(todo) // 写入列表
  return todo // 返回创建结果
}

export function updateTodo(
  id: string, // 目标 Todo id
  patch: Partial<Pick<Todo, "title" | "completed">>, // 要更新的字段（允许部分更新）
): Todo | undefined {
  const store = getStore() // 获取 store
  const idx = store.items.findIndex((t) => t.id === id) // 查找索引位置
  if (idx < 0) return undefined // 找不到则返回 undefined

  const current = store.items[idx]! // idx >= 0 时必定存在
  const updated: Todo = {
    ...current, // 先复制旧值
    ...patch, // 再覆盖更新字段
    updatedAt: new Date().toISOString(), // 更新更新时间
  }

  store.items[idx] = updated // 回写到列表
  return updated // 返回更新结果
}

export function deleteTodo(id: string): boolean {
  const store = getStore() // 获取 store
  const before = store.items.length // 删除前长度
  store.items = store.items.filter((t) => t.id !== id) // 过滤掉目标 id
  return store.items.length !== before // 若长度变化则说明删除成功
}

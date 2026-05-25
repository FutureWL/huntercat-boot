export type Todo = { // Todo 资源的数据结构（前后端共享）
  id: string // 唯一标识（示例中用递增字符串）
  title: string // 标题
  completed: boolean // 是否完成
  createdAt: string // 创建时间（ISO 字符串）
  updatedAt: string // 更新时间（ISO 字符串）
} // Todo

export type CreateTodoRequest = { // 创建 Todo 的请求体
  title: string // 标题
} // CreateTodoRequest

export type UpdateTodoRequest = Partial<Pick<Todo, "title" | "completed">> // 更新 Todo 的请求体（PATCH，字段可选）

export type TodoListResponse = { // Todo 列表响应
  items: Todo[] // 列表数据
} // TodoListResponse

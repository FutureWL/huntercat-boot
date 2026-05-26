import type { Response } from "express" // 引入 Express Response 类型（用于设置状态码）
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common" // 引入 NestJS 装饰器（声明路由与参数注入）

import type {
  ApiResponse, // 统一响应结构类型
  CreateTodoRequest, // 创建 Todo 请求 DTO
  Todo, // Todo 实体类型
  TodoListResponse, // Todo 列表响应 DTO
  UpdateTodoRequest, // 更新 Todo 请求 DTO
} from "@pjd/shared"
import { fail, ok } from "../../common/api-response" // 引入统一成功/失败响应封装
import { SessionGuard, type AuthedRequest } from "../auth/session.guard" // 引入会话守卫与已认证请求类型
import { TodoRepository } from "./todo.repository" // 引入 Todo 仓储（MySQL CRUD）

@UseGuards(SessionGuard) // Todo 相关接口全部需要登录
@Controller("todos") // 声明 Todo 控制器：路由前缀 /v1/todos
export class TodoController {
  constructor(private readonly todos: TodoRepository) {} // 注入 Todo 仓储（数据访问层）

  @Get() // 获取 Todo 列表：GET /v1/todos
  async list(@Req() req: AuthedRequest): Promise<ApiResponse<TodoListResponse>> { // 列表接口实现（需要 SessionGuard 注入 userId）
    const items = await this.todos.listTodos(req.userId!) // 按 userId 查询当前用户的 Todo 列表
    return ok<TodoListResponse>({ items }) // 返回统一成功结构
  }

  @Post() // 创建 Todo：POST /v1/todos
  async create( // 创建接口实现
    @Req() req: AuthedRequest, // 注入已认证请求（包含 userId）
    @Body() payload: CreateTodoRequest, // 读取创建请求体
    @Res({ passthrough: true }) res: Response, // 注入响应对象（用于设置状态码）
  ): Promise<ApiResponse<Todo>> { // 返回统一 ApiResponse<Todo>
    if (!payload || typeof payload.title !== "string") { // 基础校验：title 必须为字符串
      res.status(400) // 设置 HTTP 状态码：参数错误
      return fail("BAD_REQUEST_VALIDATION", "Invalid title.") // 返回统一错误结构
    } // 结束基础校验

    const title = payload.title.trim() // 规范化标题：去除首尾空白
    if (!title) { // 校验标题不能为空
      res.status(400) // 设置 HTTP 状态码：参数错误
      return fail("BAD_REQUEST_VALIDATION", "Invalid title.") // 返回统一错误结构
    } // 结束空标题校验

    const created = await this.todos.createTodo(req.userId!, title) // 写入数据库创建 Todo（按 userId 隔离）
    res.status(201) // 设置 HTTP 状态码：创建成功
    return ok<Todo>(created) // 返回创建后的 Todo
  }

  @Get(":id") // 获取单个 Todo：GET /v1/todos/:id
  async get(@Req() req: AuthedRequest, @Param("id") id: string, @Res({ passthrough: true }) res: Response) { // 获取单条接口实现
    const todo = await this.todos.getTodo(req.userId!, id) // 查询指定 id 的 Todo（按 userId 隔离）
    if (!todo) { // 未找到：返回 404
      res.status(404) // 设置 HTTP 状态码：资源不存在
      return fail("TODO_NOT_FOUND", "Todo not found.") // 返回统一错误结构
    } // 结束 not found 分支
    return ok<Todo>(todo) // 返回查询到的 Todo
  }

  @Patch(":id") // 更新 Todo：PATCH /v1/todos/:id
  async patch( // 更新接口实现
    @Req() req: AuthedRequest, // 注入已认证请求（包含 userId）
    @Param("id") id: string, // 从路径参数读取 Todo id
    @Body() payload: UpdateTodoRequest, // 读取更新请求体（部分字段可选）
    @Res({ passthrough: true }) res: Response, // 注入响应对象（用于设置状态码）
  ) { // 开始处理更新逻辑
    if (!payload || typeof payload !== "object") { // 基础校验：请求体必须为对象
      res.status(400) // 设置 HTTP 状态码：参数错误
      return fail("BAD_REQUEST_VALIDATION", "Invalid request body.") // 返回统一错误结构
    } // 结束基础校验

    const patch: UpdateTodoRequest = {} // 构造安全的 patch 对象（仅写入通过校验的字段）

    if ("title" in payload) { // 如果请求体包含 title 字段，则进行 title 校验与写入
      if ((payload as { title?: unknown }).title !== undefined && typeof (payload as { title?: unknown }).title !== "string") { // title 非空但不是字符串：拒绝
        res.status(400) // 设置 HTTP 状态码：参数错误
        return fail("BAD_REQUEST_VALIDATION", "Invalid title.") // 返回统一错误结构
      } // 结束 title 类型校验分支
      if (typeof (payload as { title?: unknown }).title === "string") { // title 为字符串：进行 trim 与非空校验
        const title = (payload as { title: string }).title.trim() // 规范化标题：去除首尾空白
        if (!title) { // title trim 后为空：拒绝
          res.status(400) // 设置 HTTP 状态码：参数错误
          return fail("BAD_REQUEST_VALIDATION", "Invalid title.") // 返回统一错误结构
        } // 结束 title 为空校验分支
        patch.title = title // 写入更新字段：title
      } // 结束 title 写入分支
    } // 结束 title 字段处理

    if ("completed" in payload) { // 如果请求体包含 completed 字段，则进行 completed 校验与写入
      if (
        (payload as { completed?: unknown }).completed !== undefined &&
        typeof (payload as { completed?: unknown }).completed !== "boolean"
      ) { // completed 非空但不是 boolean：拒绝
        res.status(400) // 设置 HTTP 状态码：参数错误
        return fail("BAD_REQUEST_VALIDATION", "Invalid completed value.") // 返回统一错误结构
      } // 结束 completed 类型校验分支
      if (typeof (payload as { completed?: unknown }).completed === "boolean") { // completed 为 boolean：写入 patch
        patch.completed = (payload as { completed: boolean }).completed // 写入更新字段：completed
      } // 结束 completed 写入分支
    } // 结束 completed 字段处理

    const updated = await this.todos.updateTodo(req.userId!, id, patch) // 执行更新（按 userId 隔离）
    if (!updated) { // 未找到：返回 404
      res.status(404) // 设置 HTTP 状态码：资源不存在
      return fail("TODO_NOT_FOUND", "Todo not found.") // 返回统一错误结构
    } // 结束 not found 分支
    return ok<Todo>(updated) // 返回更新后的 Todo
  }

  @Delete(":id") // 删除 Todo：DELETE /v1/todos/:id
  async remove(@Req() req: AuthedRequest, @Param("id") id: string, @Res({ passthrough: true }) res: Response) { // 删除接口实现
    const deleted = await this.todos.deleteTodo(req.userId!, id) // 执行删除（按 userId 隔离）
    if (!deleted) { // 未找到：返回 404
      res.status(404) // 设置 HTTP 状态码：资源不存在
      return fail("TODO_NOT_FOUND", "Todo not found.") // 返回统一错误结构
    } // 结束 not found 分支
    return ok<{ id: string }>({ id }) // 返回删除成功（返回 id 便于前端同步）
  }
}

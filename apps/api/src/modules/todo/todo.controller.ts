import type { Response } from "express"
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common"

import type {
  ApiResponse,
  CreateTodoRequest,
  Todo,
  TodoListResponse,
  UpdateTodoRequest,
} from "@pjd/shared"
import { fail, ok } from "../../common/api-response"
import { SessionGuard, type AuthedRequest } from "../auth/session.guard"
import { TodoRepository } from "./todo.repository"

@UseGuards(SessionGuard)
@Controller("todos")
export class TodoController {
  constructor(private readonly todos: TodoRepository) {}

  @Get()
  async list(@Req() req: AuthedRequest): Promise<ApiResponse<TodoListResponse>> {
    const items = await this.todos.listTodos(req.userId!)
    return ok<TodoListResponse>({ items })
  }

  @Post()
  async create(
    @Req() req: AuthedRequest,
    @Body() payload: CreateTodoRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<Todo>> {
    if (!payload || typeof payload.title !== "string") {
      res.status(400)
      return fail("BAD_REQUEST_VALIDATION", "Invalid title.")
    }

    const title = payload.title.trim()
    if (!title) {
      res.status(400)
      return fail("BAD_REQUEST_VALIDATION", "Invalid title.")
    }

    const created = await this.todos.createTodo(req.userId!, title)
    res.status(201)
    return ok<Todo>(created)
  }

  @Get(":id")
  async get(@Req() req: AuthedRequest, @Param("id") id: string, @Res({ passthrough: true }) res: Response) {
    const todo = await this.todos.getTodo(req.userId!, id)
    if (!todo) {
      res.status(404)
      return fail("TODO_NOT_FOUND", "Todo not found.")
    }
    return ok<Todo>(todo)
  }

  @Patch(":id")
  async patch(
    @Req() req: AuthedRequest,
    @Param("id") id: string,
    @Body() payload: UpdateTodoRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!payload || typeof payload !== "object") {
      res.status(400)
      return fail("BAD_REQUEST_VALIDATION", "Invalid request body.")
    }

    const patch: UpdateTodoRequest = {}

    if ("title" in payload) {
      if ((payload as { title?: unknown }).title !== undefined && typeof (payload as { title?: unknown }).title !== "string") {
        res.status(400)
        return fail("BAD_REQUEST_VALIDATION", "Invalid title.")
      }
      if (typeof (payload as { title?: unknown }).title === "string") {
        const title = (payload as { title: string }).title.trim()
        if (!title) {
          res.status(400)
          return fail("BAD_REQUEST_VALIDATION", "Invalid title.")
        }
        patch.title = title
      }
    }

    if ("completed" in payload) {
      if (
        (payload as { completed?: unknown }).completed !== undefined &&
        typeof (payload as { completed?: unknown }).completed !== "boolean"
      ) {
        res.status(400)
        return fail("BAD_REQUEST_VALIDATION", "Invalid completed value.")
      }
      if (typeof (payload as { completed?: unknown }).completed === "boolean") {
        patch.completed = (payload as { completed: boolean }).completed
      }
    }

    const updated = await this.todos.updateTodo(req.userId!, id, patch)
    if (!updated) {
      res.status(404)
      return fail("TODO_NOT_FOUND", "Todo not found.")
    }
    return ok<Todo>(updated)
  }

  @Delete(":id")
  async remove(@Req() req: AuthedRequest, @Param("id") id: string, @Res({ passthrough: true }) res: Response) {
    const deleted = await this.todos.deleteTodo(req.userId!, id)
    if (!deleted) {
      res.status(404)
      return fail("TODO_NOT_FOUND", "Todo not found.")
    }
    return ok<{ id: string }>({ id })
  }
}


import { z } from "zod"

import {
  CLEAR_COMPLETED_INTENT,
  CREATE_TODO_INTENT,
  DELETE_TODO_INTENT,
  EDIT_TODO_INTENT,
  TOGGLE_TODO_INTENT,
} from "../domain/todos-constants"

export const createTodoSchema = z.object({
  description: z.string().trim().default(""),
  intent: z.literal(CREATE_TODO_INTENT),
  title: z.string().trim().default(""),
})

export const toggleTodoSchema = z.object({
  id: z.string().min(1),
  intent: z.literal(TOGGLE_TODO_INTENT),
})

export const deleteTodoSchema = z.object({
  id: z.string().min(1),
  intent: z.literal(DELETE_TODO_INTENT),
})

export const clearCompletedSchema = z.object({
  intent: z.literal(CLEAR_COMPLETED_INTENT),
})

export const editTodoSchema = z.object({
  description: z.string().trim().default(""),
  id: z.string().min(1),
  intent: z.literal(EDIT_TODO_INTENT),
  title: z.string().trim().default(""),
})

export const todoActionSchema = z.discriminatedUnion("intent", [
  clearCompletedSchema,
  createTodoSchema,
  deleteTodoSchema,
  editTodoSchema,
  toggleTodoSchema,
])

export type ClearCompletedSchema = z.infer<typeof clearCompletedSchema>
export type CreateTodoSchema = z.infer<typeof createTodoSchema>
export type DeleteTodoSchema = z.infer<typeof deleteTodoSchema>
export type EditTodoSchema = z.infer<typeof editTodoSchema>
export type ToggleTodoSchema = z.infer<typeof toggleTodoSchema>
export type TodoActionSchema = z.infer<typeof todoActionSchema>

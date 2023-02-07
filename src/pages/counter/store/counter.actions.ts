import { createAction } from "@reduxjs/toolkit";

export const increment = createAction<number>('counter/increment')
export const decrement = createAction<number>('counter/decrement')
export const reset = createAction('counter/reset')
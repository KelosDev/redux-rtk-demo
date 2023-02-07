import { createReducer } from "@reduxjs/toolkit";
import { decrement, increment, reset } from './counter.actions'

export const counterReducer = createReducer(0, builder =>
    builder
        .addCase(increment, (state, action) => state + action.payload)
        .addCase(decrement, (state, action) => state - action.payload)
        .addCase(reset, () => 0)
)
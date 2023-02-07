import React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import * as CounterActions from './store/counter.actions';
import { selectCounter } from './store/counter.selectors';

const CounterPage = () => {

    const dispatch = useDispatch()
    const counter = useSelector(selectCounter)

    return (
        <>
            <h1>{counter}</h1>
            <button onClick={() => dispatch(CounterActions.decrement(10))}>-</button>
            <button onClick={() => dispatch(CounterActions.increment(5))}>+</button>
            <button onClick={() => dispatch(CounterActions.reset())}>reset</button>
        </>
    );
};

export default CounterPage;

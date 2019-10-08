
import { Action, Dispatch, AnyAction } from 'redux'

declare module 'react-redux'
{

    // tslint:disable:no-unnecessary-generics

    /**
     * A hook to access the redux `dispatch` function.
     *
     * Note for `redux-thunk` users: the return type of the returned `dispatch` functions for thunks is incorrect.
     * However, it is possible to get a correctly typed `dispatch` function by creating your own custom hook typed
     * from the store's dispatch function like this: `const useThunkDispatch = () => useDispatch<typeof store.dispatch>();`
     *
     * @returns redux store's `dispatch` function
     *
     * @example
     *
     * import React, { useCallback } from 'react'
     * import { useDispatch } from 'react-redux'
     *
     * export const CounterComponent = ({ value }) => {
     *   const dispatch = useDispatch()
     *   return (
     *     <div>
     *       <span>{value}</span>
     *       <button onClick={() => dispatch({ type: 'increase-counter' })}>
     *         Increase counter
     *       </button>
     *     </div>
     *   )
     * }
     */
    // NOTE: the first overload below and note above can be removed if redux-thunk typings add an overload for
    // the Dispatch function (see also this PR: https://github.com/reduxjs/redux-thunk/pull/247)
    export function useDispatch<TDispatch = Dispatch<any>>(): TDispatch;
    export function useDispatch<A extends Action = AnyAction>(): Dispatch<A>;

    /**
     * A hook to access the redux store's state. This hook takes a selector function
     * as an argument. The selector is called with the store state.
     *
     * @param selector the selector function
     *
     * @returns the selected state
     *
     * @example
     *
     * import React from 'react'
     * import { useSelector } from 'react-redux'
     * import { RootState } from './store'
     *
     * export const CounterComponent = () => {
     *   const counter = useSelector((state: RootState) => state.counter)
     *   return <div>{counter}</div>
     * }
     */
    export function useSelector<TState, TSelected>(selector: (state: TState) => TSelected): TSelected;

    /**
     * A hook to access the redux store.
     *
     * @returns the redux store
     *
     * @example
     *
     * import React from 'react'
     * import { useStore } from 'react-redux'
     *
     * export const ExampleComponent = () => {
     *   const store = useStore()
     *   return <div>{store.getState()}</div>
     * }
     */
    export function useStore<S = any, A extends Action = AnyAction>(): Store<S, A>;

    // tslint:enable:no-unnecessary-generics
}
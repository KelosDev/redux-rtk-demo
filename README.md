# REDUX-TOOLKIT

1) creare progetto react con TS
```
npx create-react-app redux-rtk-demo --template typescript
```

2) Installare redux redux-toolkit nella cartella del progetto

```
npm i react-redux @types/react-redux @reduxjs/toolkit
```

---

Nel file [`index.tsx`](./src/index.tsx)

```ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

const rootReducer = combineReducers({
  todos: () => [1, 2, 3],
  counter: () => 123
})

export const store = configureStore({
  reducer: rootReducer
})

export type RootState = ReturnType<typeof rootReducer>

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();

```

Lo **store** è un insieme di funzioni.

**combineReducer** è un costrutto che mi permette di scrivere più reducer insieme e al suo interno posso definire una **chiave** e una **funzione** che restituisce un valore che è associato a quella chiave. Nel nostro caso: 

```ts
const rootReducer = combineReducers({
  todos: () => [1, 2, 3],
  counter: () => 123
})
```
Il vantaggio di separare rootReducer dal configureStore è che adesso posso creare un type che rappresenta la struttura del nostro store semplicemente con ReturnType e il typeof dei rootReducer. 

```ts
export type RootState = ReturnType<typeof rootReducer>
```

Infine per rendere accessibile il nostro store a tutta l'applicazione, wrapperemo l'intere App con **Provider** store e gli passiamo la reference del nostro store.
```ts
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```
Grazie a questo, i componenti figli di App, cioè tutta l'applicazione potranno accedere alle funzionalità di Redux.

---

All'interno della cartella 'pages' vado a creare una cartella chiamata '**store**' con al suo interno un file chiamato [`counter.actions.ts`](./src/pages/counter/store/counter.actions.ts)

Vedremo ora alcuni modi di scrivere le azioni che non sono più in uso

1) azioni dispatchate dalla UI. In questo caso un azione **increment** che accetta un **value**. L'azione è una funzione che restituisce un oggetto con **type**: 'increment' (stringa che identifica quell'azione in modo univoco) ed eventualmente un **payload**: value ovvero i parametri passati insieme all'azione. 
```ts
export function incrementOLD(value: number) {
    return {type: 'increment', payload: value}
}
```
Con Redux-Toolkit il codice si è molto semplificato: MODO (1)

In questo modo posso definire direttamente il nome dell'azione come parametro e anche definendo un namespace -> counter/**increment**

Inoltre nei generics possiamo definire qual'è il tipo di payload in questo caso un number. createAction farà il lavoro sporco per noi creando l'oggetto type con il payload.

```ts
export const increment = createAction<number>('counter/increment')
export const decrement = createAction<number>('counter/decrement')
export const reset = createAction('counter/reset')
```

Ora voglio emettere con un dispatch quest'azione. Vado quindi su [`CounterPage.tsx`](./src/pages/counter/CounterPage.tsx)

Per emettere un azione posso usare un hook di react -> **useDispatch**

```ts
import React from 'react';
import { useDispatch } from 'react-redux';
import * as CounterActions from './store/counter.actions';

const CounterPage = () => {

    const dispatch = useDispatch()

    return (
        <>
            <button onClick={() => dispatch(CounterActions.decrement(10))}>-</button>
            <button onClick={() => dispatch(CounterActions.increment(5))}>+</button>
            <button onClick={() => dispatch(CounterActions.reset())}>reset</button>
        </>
    );
};

export default CounterPage;
```

N.B l'azione da sola non modifica lo stato!!!

Per poter modificare lo stato bisogna creare un **reducer** che è una semplice funzione che inizializzerà questa piccola porzione di store (ovvero il nostro counter) e lo modificherà sulla base di un'azione.

Nel file [`counter.reducer.ts`](./src/pages/counter/store/counter.reducer.ts):

```ts
export function counterReducer() {
    return 0
}
```
Posso quindi ora andare a sostituirla nel file index.tsx

```ts
const rootReducer = combineReducers({
  todos: () => [1, 2, 3],
  counter: counterReducer
})
```

Un reducer viene invocato ad ogni dispatch. Possiamo verificarlo inserendo un console.log() nel file [`counter.reducer.ts`](./src/pages/counter/store/counter.reducer.ts) in questo modo:

```ts
export function counterReducer() {
    console.log('reducer')
    return 0
}
```
A ogni refresh della pagina avremo 3 console.log() iniziali. Il perchè lo vedremo in seguito.

Se infatti noi passiamo alla funzione counterReducer 2 parametri: state e action e facciamo il console.log() di questi vedremo che:

```ts
export function counterReducer(state = 0 , action: any) {
  console.log(state, action)
  return state;
}
```
in console, all'avvio del componente avremo 3 azioni di inizializzazione con lo stato definito a 0 perchè impostato da noi come valore iniziale, altrimenti sarebbe 'undefined'
```
0 -> {type: '@@redux/INIT5.j.i.e.0.j'}
0 -> {type: '@@redux/PROBE_UNKNOWN_ACTIONi.y.m.e.s.p'}
0 -> {type: '@@INIT'}
```
Tuttavia anche quando clicchiamo sui bottoni +/-/reset (invocando quindi un'azione) lo stato rimane sempre 0 perchè viene restituito sempre il valore di default!

Nella vecchia maniera si utilizzava uno switch per analizzare tutti i diversi casi. Es:

```ts
export function counterReducer(state = 0, action : any){
  switch (action.type) {
    case increment.type :
      return state + action.payload
    case decrement.type :
      return state - action.payload
    case reset.type :
      return 0
  }
  return state
}
```

Con redux-toolkit posso utilizzare la funzionalità 'createReducer()' alla quale passo come primo parametro il valore di inizializzazione dello stato (in questo caso 0) e come secondo parametro un oggetto di configurazione in cui abbiamo una chiave che è il nostro tipo di azione e il valore è la funzione che verrà invocata quando viene dispatchata quell'azione. Inoltre quì la action la posso tipizzare definendo che il payload sarà un number.

```ts
import { createReducer, PayloadAction } from "@reduxjs/toolkit";
import { decrement, increment, reset } from './counter.actions'

export const counterReducer = createReducer(0, {
    [increment.type]: (state: number, action: PayloadAction<number>) => state + action.payload,
    [decrement.type]: (state: number, action: PayloadAction<number>) => state - action.payload,
    [reset.type]: (state: number, action: PayloadAction<number>) => 0
})
```

POSSIAMO FARE DI MEGLIO

Creo nuovamente un reducer con primo parametro sempre valore dello stato, ma stavolta come secondo parametro avremo una funzione dalla quale otteniamo un oggetto builder che ci permette tramite degli addCase di definire qual'è l'azione che dobbiamo intercettare e invocare la funzione di aggiornamento che riceve direttamente state e action con la differenza che rispetto a prima che questi sono già tipizzati grazie all'inference. Infatti lo state è un number e l'azione ha un payload di tipo number. In codice:

```ts
import { createReducer } from "@reduxjs/toolkit";
import { decrement, increment, reset } from './counter.actions'

export const counterReducer = createReducer(0, builder =>
    builder
        .addCase(increment, (state, action) => state + action.payload)
        .addCase(decrement, (state, action) => state - action.payload)
        .addCase(reset, () => 0)
)
```
Finora abbiamo scritto solo lo stato. Non lo abbiamo però ancora recuperato dalla UI. Per farlo utilizzeremo un apposito hook chiamato **useSelector** che accetterà una funzione che riceve il nostro state he tipizziamo  a RootState importandolo da index.tsx (il famoso type RootState che avevamo creato con ReturnType recuperando automaticamente la struttura dei dati del nostro combineReducer)

Possiamo quindi in questo modo recuperare qualsiasi valore del nostro stato (come counter) e visualizzarlo nel nostro template jsx

Nel file [`CounterPage.tsx`](./src/pages/counter/CounterPage.tsx) :

```ts
import React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { RootState } from '../../index';
import * as CounterActions from './store/counter.actions';

const CounterPage = () => {

    const dispatch = useDispatch()
    const counter = useSelector((state: RootState) => state.counter)

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
```

Vedremo quindi che il nostro layout è sempre in sync con lo store!

Una buona pratica sarebbe anche quella di spostare il selettore che abbiamo definito nello useSelector in un file esterno in modo che sia anche importabile da altri file.

Creo quindi un file chiamato [`counter.selectors.ts`](./src/pages/counter/store/counter.selectors.ts)
```ts
import { RootState } from "../../../index";

export const selectCounter = (state: RootState) => state.counter
```

Torniamo nel file [`CounterPage.tsx`](./src/pages/counter/CounterPage.tsx)

```ts
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
```





 







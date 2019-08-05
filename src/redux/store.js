import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import combineReducers from './reducers.js';

const store = createStore(combineReducers, composeWithDevTools(applyMiddleware(thunkMiddleware))); // The second parameter is the thunk middleware action that handles the function type.

export default store;

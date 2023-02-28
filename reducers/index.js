import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';
import user from './user';
import post from './post';

const initialState = {
  user: {
  },
  post: {

  },
}; // 기본 스테이트

// ( 이전상태, 액션 ) => 다음상태 reducer의 역할
// combineReducers가 알아서 user initial, post initial 가져와줌 !!!
const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log('HYDRATE', action);
      return action.payload;
    default: {
      const combinedReducer = combineReducers({
        user,
        post,
      });
      return combinedReducer(state, action);
    }
  }
};

export default rootReducer;

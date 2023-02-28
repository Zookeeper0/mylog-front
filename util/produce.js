import { enableES5, produce } from 'immer';

// IE 에러방지
export default (...args) => {
  enableES5();
  return produce(...args);
};

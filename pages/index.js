import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { END } from 'redux-saga';

import axios from 'axios';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import AppLayout from '../components/AppLayout';
import { LOAD_POSTS_REQUEST } from '../reducers/post';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user';
import wrapper from '../store/configureStore';

const Home = () => {
  const dispatch = useDispatch();
  const { me } = useSelector((state) => state.user);
  // eslint-disable-next-line max-len
  const { mainPosts, hasMorePosts, loadPostsLoading, retweetError } = useSelector((state) => state.post);
  const [ref, inView] = useInView();
  console.log(mainPosts);
  useEffect(() => {
    if (retweetError) {
      alert(retweetError);
    }
  }, [retweetError]);

  // SSR Use delete
  // useEffect(() => {
  //   dispatch({
  //     type: LOAD_MY_INFO_REQUEST,
  //   });
  //   dispatch({
  //     type: LOAD_POSTS_REQUEST,
  //
  //   });
  // }, []);

  // react-virtualized 사용해보기!! 무한스크롤
  useEffect(
    () => {
      if (inView && hasMorePosts && !loadPostsLoading
          && document.documentElement.clientHeight < document.documentElement.scrollHeight) {
        const lastId = mainPosts[mainPosts.length - 1]?.id;
        dispatch({
          type: LOAD_POSTS_REQUEST,
          lastId,
        });
      }
    },
    [inView, hasMorePosts, loadPostsLoading, mainPosts],
  );

  return (
    <AppLayout>
      {me && <PostForm />}
      {mainPosts.map((post) => <PostCard key={post.id} post={post} />)}
      <div ref={hasMorePosts && !loadPostsLoading ? ref : undefined} />
    </AppLayout>
  );
};

// 이부분은 프로트서버 -> 백엔드로 넘어가기때문에 브라우저 개입조차 못함, 쿠키 크리덴셜 문제발생!
export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  console.log(context.req.headers);
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = ''; // 누군가 쿠키 안써서 요청할때 서버에서 공유중인 쿠키 제거
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie; // 쿠키를 가지고 요청을 보낼때만 쿠키를 넣어주고
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch({
    type: LOAD_POSTS_REQUEST,
  });
  context.store.dispatch(END); // REQUEST가 SUCCESS로 바뀌기까지 기다렸다가 넘겨줌
  await context.store.sagaTask.toPromise(); // SSR을 구현하기 위한 문서 사용법
});

export default Home;

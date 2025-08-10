import { gql } from "@apollo/client";

export const GET_POSTS_PAGINATED = gql`
  query GetPostsPaginated($page: Int!, $pageSize: Int!) {
    postsPaginated(page: $page, pageSize: $pageSize) {
      page
      pageSize
      totalPages
      totalCount
      items {
        postId
        title
        imageUrl
        content
        createdAt
        viewsCount
        isTop
      }
    }
  }
`;

export const GET_TOP_POSTS = gql`
  query GetTopPosts($limit: Int!) {
    topPosts(limit: $limit) {
      postId
      title
      imageUrl
      createdAt
      viewsCount
      isTop
    }
  }
`;

export const GET_TOP_POSTS_PAGINATED = gql`
  query GetTopPostsPaginated($page: Int!, $pageSize: Int!) {
    topPostsPaginated(page: $page, pageSize: $pageSize) {
      page
      pageSize
      totalPages
      totalCount
      items {
        postId
        title
        imageUrl
        content
        createdAt
        viewsCount
        isTop
      }
    }
  }
`;

export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    posts {
      postId
      title
      imageUrl
      createdAt
      viewsCount
      isTop
    }
  }
`;

export const GET_SINGLE_POST = gql`
  query GetPost($id: Int!) {
    post(id: $id) {
      postId
      title
      imageUrl
      content
      createdAt
      viewsCount
      isTop
    }
  }
`;

/** 🔎 Search API (works with your backend filter) */
export const SEARCH_POSTS = gql`
  query SearchPosts($filter: FilterPostsInput) {
    searchPosts(filter: $filter) {
      postId
      title
      imageUrl
      content
      createdAt
      viewsCount
      isTop
      tags
    }
  }
`;

/** ℹ️ Did you mean API */
export const DID_YOU_MEAN = gql`
  query DidYouMean($query: String!) {
    didYouMean(query: $query)
  }
`;

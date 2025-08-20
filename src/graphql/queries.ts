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
        servedLanguage
        imageUrl
        createdAt
        viewsCount
        isTop
        contentResolved {
          language
          title
          content
          tags
        }
        title
        content
        tags
      }
    }
  }
`;

export const GET_TOP_POSTS = gql`
  query GetTopPosts($limit: Int!, $language: LanguageCode) {
    topPosts(limit: $limit, language: $language) {
      postId
      servedLanguage
      imageUrl
      createdAt
      viewsCount
      isTop
      contentResolved {
        language
        title
        content
        tags
      }
      title
      content
      tags
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
        servedLanguage
        imageUrl
        createdAt
        viewsCount
        isTop
        contentResolved {
          language
          title
          content
          tags
        }
        title
        content
        tags
      }
    }
  }
`;

export const POSTS_IN_LANG_PAGINATED = gql`
  query PostsInLangPaginated(
    $page: Int!
    $pageSize: Int!
    $language: LanguageCode
  ) {
    postsInLangPaginated(
      page: $page
      pageSize: $pageSize
      language: $language
    ) {
      page
      pageSize
      totalPages
      totalCount
      items {
        postId
        servedLanguage
        imageUrl
        isTop
        createdAt
        viewsCount
        contentResolved {
          language
          title
          content
          tags
        }
        title
        content
        tags
      }
    }
  }
`;

export const POSTS_IN_LANG_LIST = gql`
  query Posts($language: LanguageCode) {
    posts(language: $language) {
      postId
      servedLanguage
      imageUrl
      createdAt
      viewsCount
      isTop
      contentResolved {
        language
        title
        content
        tags
      }
      title
      content
      tags
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
  query SearchPosts($filter: FilterPostsInput, $language: LanguageCode) {
    searchPosts(filter: $filter, language: $language) {
      postId
      baseLanguage
      servedLanguage
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

// Admin: fetch post with all language contents for editing
export const GET_POST_WITH_CONTENTS = gql`
  query GetPostWithContents($id: Int!) {
    post(id: $id) {
      postId
      isTop
      imageUrl
      baseLanguage
      contents {
        language
        title
        content
        tags
      }
    }
  }
`;

// Multilingual: Posts list by language (schema may be array or object)
// Header-only multilingual mode: rely on Accept-Language header.
// TODO: Re-enable `language` argument once backend enum/arg names are confirmed via introspection.
export const POSTS_IN_LANG = gql`
  query Posts {
    posts {
      postId
      servedLanguage
      imageUrl
      isTop
      createdAt
      viewsCount
      contentResolved {
        language
        title
        content
        tags
      }
    }
  }
`;

// Multilingual: Single post by language
// Header-only multilingual mode: rely on Accept-Language header.
// TODO: Re-enable `language` argument once backend enum/arg names are confirmed via introspection.
export const POST_IN_LANG = gql`
  query Post($id: Int!) {
    post(id: $id) {
      postId
      servedLanguage
      imageUrl
      isTop
      createdAt
      viewsCount
      contentResolved {
        language
        title
        content
        tags
      }
    }
  }
`;

export const GET_TOP_POSTS_WITH_LANG = gql`
  query GetTopPosts($limit: Int!, $language: LanguageCode) {
    topPosts(limit: $limit, language: $language) {
      postId
      servedLanguage
      imageUrl
      createdAt
      viewsCount
      isTop
      contentResolved {
        language
        title
        content
        tags
      }
      title
      content
      tags
    }
  }
`;

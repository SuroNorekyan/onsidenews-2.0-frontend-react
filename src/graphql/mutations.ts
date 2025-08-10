//src/graphql/mutations.ts
import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        userId
        username
        role
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      postId
      title
      isTop
      createdAt
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: Int!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      postId
      title
      isTop
      updatedAt
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id)
  }
`;

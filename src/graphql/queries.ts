import { gql } from "@apollo/client";

export const GET_ALL_POSTS = gql`
  query Posts {
    posts {
      postId
      title
      content
      imageUrl
      createdAt
    }
  }
`;

export const GET_SINGLE_POST = gql`
  query Post($id: Int!) {
    post(id: $id) {
      postId
      title
      content
      imageUrl
      createdAt
    }
  }
`;

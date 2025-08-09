// src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql", // change if needed
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("accessToken");
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Optional: auto‑logout on invalid/expired token
const errorLink = onError(({ graphQLErrors, networkError }) => {
  const isAuthError =
    graphQLErrors?.some((e) => e.extensions?.code === "UNAUTHENTICATED") ||
    (networkError as any)?.statusCode === 401;

  if (isAuthError) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // You can also redirect to login:
    // if (window.location.pathname.startsWith("/admin")) window.location.href = "/admin/login";
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});

export default client;

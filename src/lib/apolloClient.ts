// src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql", // change if needed
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("accessToken");
  const lang = (localStorage.getItem("onside:lang") || "EN").toLowerCase();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(lang ? { "Accept-Language": lang } : {}),
    },
  };
});

// Optional: auto‑logout on invalid/expired token
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  const isAuthError =
    graphQLErrors?.some((e) => e.extensions?.code === "UNAUTHENTICATED") ||
    (networkError as any)?.statusCode === 401;

  if (isAuthError) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // You can also redirect to login:
    // if (window.location.pathname.startsWith("/admin")) window.location.href = "/admin/login";
  }

  if (graphQLErrors && graphQLErrors.length > 0) {
    for (const err of graphQLErrors) {
      console.error(
        `[GraphQL error] op=${operation.operationName} message=${err.message}`,
        { locations: err.locations, path: err.path, extensions: (err as any).extensions, variables: operation.variables }
      );
    }
  }
  if (networkError) {
    console.error(
      `[Network error] op=${operation.operationName} variables=`,
      operation.variables,
      networkError
    );
  }
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});

export default client;

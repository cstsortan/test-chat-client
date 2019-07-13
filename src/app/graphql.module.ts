import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { environment } from 'src/environments/environment';




const uri = `http://${environment.apiEndpoint}/graphql`; // <-- add the URL of the GraphQL server here
const wsUri = `ws://${environment.apiEndpoint}/graphql`;

export function createApollo(httpLink: HttpLink) {

  // Create a WebSocket link:
  const ws = new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true
    }
  });

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    ws,
    httpLink.create({ uri }),
  );
  return {
    link,
    cache: new InMemoryCache(),
  };
}


@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule { }

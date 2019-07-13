import { Injectable } from '@angular/core';
import { Apollo, Subscription } from 'apollo-angular';
import gql from 'graphql-tag';
import { TestMessage } from './models/test-message';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NewMessageGQL extends Subscription {
    document = gql`
        subscription testMessageSent {
            testMessageSent {
                id
                author
                text
            }
        }
    `;
}

@Injectable({
    providedIn: 'root'
})
export class TestMessagesService {
    constructor(
        private apollo: Apollo,
        private newMessage: NewMessageGQL,
    ) {
    }

    sendMessage(author: string, text: string) {
        return this.apollo.mutate({
            mutation: gql`
                mutation sendMessage($text: String!, $author: String!) {
                    sendMessage(text: $text, author: $author) {
                        id
                    }
                }
            `,
            variables: {
                text,
                author
            }
        });
    }

    getMessages(): Observable<TestMessage[]> {

        return new Observable(subscriber => {
            let allMessages = [];
            let oldMessages = [];
            let newMessages = [];

            const emit = () => {
                allMessages = [
                    ...oldMessages,
                    ...newMessages,
                ];
                subscriber.next(allMessages);
            };

            const oldMessagesSubscription = this.queryMessages().subscribe(messages => {
                oldMessages = [...(messages.data as any).testMessages];
                emit();
            });

            const newMessagesSubscription = this.newMessageSent().subscribe(newMessage => {
                newMessages = [...newMessages, newMessage.data.testMessageSent];
                emit();
            });
            
            return () => {
                oldMessagesSubscription.unsubscribe();
                newMessagesSubscription.unsubscribe();
            }
        });
    }

    private queryMessages() {
        return this.apollo.watchQuery({
            query: gql`
            {
                testMessages{
                    text
                    author
                }
            }
            `
        }).valueChanges;
    }

    private newMessageSent() {
        return this.newMessage.subscribe();
    }
}

import { Component } from '@angular/core';
import { TestMessagesService } from './test-messages.service';
import { Observable } from 'rxjs';
import { TestMessage } from './models/test-message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'test-chat';
  messages$: Observable<TestMessage[]>;

  newMessage = {
    name: "Unknown",
    text: '',
  };

  constructor(
    private msg: TestMessagesService,
  ) {
    this.messages$ = this.msg.getMessages();
  }

  trackById(i, item: TestMessage) {
    return item.id;
  }

  send() {
    if (!this.newMessage.name || !this.newMessage.text) return;
    this.msg.sendMessage(this.newMessage.name, this.newMessage.text).subscribe(console.log, console.log);
  }
}

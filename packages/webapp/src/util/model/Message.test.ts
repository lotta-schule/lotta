import { NewMessageDestination } from 'model';
import {
  createConversation,
  elternGroup,
  SomeUser,
  SomeUserin,
} from 'test/fixtures';
import { Message } from './Message';

describe('util/model/Message', () => {
  it('should show the correct user name if Destination object describes a user', () => {
    const destination: NewMessageDestination = {
      user: SomeUserin,
    };
    expect(Message.getDestinationName(destination)).toEqual('Lui');
  });

  it('should show the correct user name if Destination object describes a group', () => {
    const destination: NewMessageDestination = {
      group: elternGroup,
    };
    expect(Message.getDestinationName(destination)).toEqual('Eltern');
  });

  it('should convert a user conversation to a destination', () => {
    const destination = { user: SomeUserin };
    const conversation = createConversation(SomeUser, destination);
    const converted = Message.conversationAsDestination(conversation, SomeUser);
    expect(converted).toEqual(destination);
  });

  it('should convert a group conversation to a destination', () => {
    const destination = { group: elternGroup };
    const conversation = createConversation(SomeUser, destination);
    const converted = Message.conversationAsDestination(conversation, SomeUser);
    expect(converted).toEqual(destination);
  });
});

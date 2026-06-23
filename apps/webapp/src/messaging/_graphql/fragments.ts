import { graphql } from '#/api/graphql';

/**
 * The initial/live message window for an open conversation. `ComposeMessage` and
 * `Authentication`'s subscription handler must read/write `GetConversationQuery`'s
 * cache entry using this exact filter, otherwise their `readQuery`/`writeQuery` calls
 * target a different (args-keyed) cache slot than the one `MessagesThread` renders.
 */
export const LIVE_MESSAGES_FILTER = { first: 25 };

export const MESSAGE_FRAGMENT = graphql(`
  fragment MessageFragment on Message @_unmask {
    id
    content
    insertedAt
    updatedAt
    files {
      id
      filename
      fileType
      filesize
      formats(category: "PREVIEW") {
        name
        url
        type
        availability {
          status
        }
      }
    }
    user {
      id
      name
      nickname
      avatarImageFile {
        id
        formats(category: "AVATAR") {
          name
          url
          type
          availability {
            status
          }
        }
      }
    }
  }
`);

export const CONVERSATION_FRAGMENT = graphql(`
  fragment ConversationFragment on Conversation @_unmask {
    id
    insertedAt
    updatedAt
    unreadMessages
    groups {
      id
      name
    }
    users {
      id
      name
      nickname
      avatarImageFile {
        id
        formats(category: "AVATAR") {
          name
          url
          type
          availability {
            status
          }
        }
      }
    }
  }
`);

defmodule LottaWeb.MessagesResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Messages.{Conversation, Message}

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    emails = [
      "alexis.rinaldoni@lotta.schule",
      "eike.wiewiorra@lotta.schule"
    ]

    [{user, user_jwt}, {user2, user2_jwt}] =
      Enum.map(emails, fn email ->
        user =
          Repo.one!(
            from(u in User,
              where: u.email == ^email
            ),
            prefix: tenant.prefix
          )

        {:ok, jwt, _} = AccessToken.encode_and_sign(user)
        {user, jwt}
      end)

    user2_file = Lotta.Repo.get_by!(Lotta.Storage.File, [user_id: user2.id, filename: "wieartig1.jpg"], prefix: tenant.prefix)

    lehrer_group =
      Repo.one!(
        from(ug in UserGroup, where: ug.name == ^"Lehrer"),
        prefix: tenant.prefix
      )

    schueler_group =
      Repo.one!(
        from(ug in UserGroup,
          where: ug.name == ^"Schüler"
        ),
        prefix: tenant.prefix
      )

    all_conversations =
      Conversation
      |> Repo.all(prefix: tenant.prefix)
      |> Enum.map(&Repo.preload(&1, [:users, :groups]))

    message =
      Repo.one!(
        from(c in Message,
          where: c.content == "OK, alles bereit?"
        ),
        prefix: tenant.prefix
      )
      |> Repo.preload(:files)

    {:ok,
     %{
       user: user,
       user_jwt: user_jwt,
       user2: user2,
       user2_jwt: user2_jwt,
       user2_file: user2_file,
       lehrer_group: lehrer_group,
       schueler_group: schueler_group,
       all_conversations: all_conversations,
       message: message,
       tenant: tenant
     }}
  end

  describe "conversations query" do
    @query """
    {
      conversations {
        users {
          name
        }
        groups {
          name
        }
      }
    }
    """
    test "returns all conversations for a user", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversations" => [
                   %{
                     "users" => [%{"name" => "Christopher Bill"}, %{"name" => "Alexis Rinaldoni"}],
                     "groups" => []
                   },
                   %{
                     "users" => [%{"name" => "Eike Wiewiorra"}, %{"name" => "Alexis Rinaldoni"}],
                     "groups" => []
                   }
                 ]
               }
             }
    end

    test "returns all conversations for another user", %{user2_jwt: user2_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversations" => [
                   %{
                     "users" => [],
                     "groups" => [%{"name" => "Lehrer"}]
                   },
                   %{
                     "users" => [%{"name" => "Eike Wiewiorra"}, %{"name" => "Alexis Rinaldoni"}],
                     "groups" => []
                   }
                 ]
               }
             }
    end

    test "return an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversations" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["conversations"]
                 }
               ]
             }
    end
  end

  describe "conversation query" do
    @query """
    query GetConversation($id: ID!) {
      conversation(id: $id) {
        users {
          name
        }
        groups {
          name
        }
        messages {
          content
          user {
            name
          }
          files {
            filename
          }
        }
      }
    }
    """
    test "returns all messages for a conversation with a user", %{
      user_jwt: user_jwt,
      user: user,
      user2: user2,
      all_conversations: all_conversations
    } do
      conversation =
        all_conversations
        |> Enum.find(fn c ->
          Enum.count(c.users) > 0 && Enum.all?(c.users, &(&1.id == user.id || &1.id == user2.id))
        end)

      assert conversation

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: conversation.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversation" => %{
                   "users" => [%{"name" => "Eike Wiewiorra"}, %{"name" => "Alexis Rinaldoni"}],
                   "groups" => [],
                   "messages" => [
                     %{
                       "content" => "Ich frag mal in die Gruppe",
                       "user" => %{"name" => "Eike Wiewiorra"},
                       "files" => []
                     },
                     %{
                       "content" => "Bereit für das Deployment",
                       "user" => %{"name" => "Alexis Rinaldoni"},
                       "files" => []
                     },
                     %{
                       "user" => %{"name" => "Eike Wiewiorra"},
                       "content" => "Was meinst du damit?",
                       "files" => []
                     },
                     %{
                       "user" => %{"name" => "Alexis Rinaldoni"},
                       "content" => "OK, alles bereit?",
                       "files" => [%{"filename" => "ich_schoen.jpg"}]
                     }
                   ]
                 }
               }
             }
    end

    test "returns all messages for a conversation with a group", %{
      user2_jwt: user2_jwt,
      lehrer_group: lehrer_group,
      all_conversations: all_conversations
    } do
      conversation =
        all_conversations
        |> Enum.find(fn c ->
          Enum.count(c.groups) == 1 && List.first(c.groups).id == lehrer_group.id
        end)

      assert conversation

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query, variables: %{id: conversation.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversation" => %{
                   "users" => [],
                   "groups" => [
                     %{
                       "name" => "Lehrer"
                     }
                   ],
                   "messages" => [
                     %{
                       "user" => %{"name" => "Eike Wiewiorra"},
                       "content" => "Alles bereit hier? Wir würden deployen.",
                       "files" => []
                     }
                   ]
                 }
               }
             }
    end

    test "returns an error when requesting a conversation between 2 other users", %{
      user_jwt: user_jwt,
      user2: user2,
      all_conversations: all_conversations
    } do
      [user | _] = Repo.all(from(User, where: [email: "billy@lotta.schule"]), prefix: @prefix)

      conversation =
        all_conversations
        |> Enum.find(fn c ->
          Enum.count(c.users) && Enum.all?(c.users, &(&1.id == user2.id || &1.id == user.id))
        end)

      assert conversation

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: conversation.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversation" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du hast nicht die Rechte, diese Unterhaltung anzusehen.",
                   "path" => ["conversation"]
                 }
               ]
             }
    end

    test "returns an error when requesting a conversation for a group the user is not member of",
         %{
           user_jwt: user_jwt,
           lehrer_group: lehrer_group,
           all_conversations: all_conversations
         } do
      conversation =
        all_conversations
        |> Enum.find(fn c ->
          Enum.count(c.groups) == 1 && List.first(c.groups).id == lehrer_group.id
        end)

      assert conversation

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: conversation.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversation" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du hast nicht die Rechte, diese Unterhaltung anzusehen.",
                   "path" => ["conversation"]
                 }
               ]
             }
    end

    test "return an error if user is not logged in", %{all_conversations: [conversation | _]} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{id: conversation.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversation" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["conversation"]
                 }
               ]
             }
    end

    test "return an error if a conversation with this id does not exist", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: "00000000-0000-0000-0000-000000000000"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "conversation" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Unterhaltung nicht gefunden.",
                   "path" => ["conversation"]
                 }
               ]
             }
    end
  end

  describe "create message mutation" do
    @query """
    mutation CreateMessage($message: MessageInput) {
      createMessage(message: $message) {
        content
        files {
          filename
        }
        user {
          email
        }
        conversation {
          users {
            email
          }
          groups {
            name
          }
      }
      }
    }
    """

    test "send a message to another user", %{user2: user2, user_jwt: user_jwt, user2_file: user2_file} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            message: %{content: "Hallo.", recipient_user: %{id: user2.id}, files: [%{id: user2_file.id}]}
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createMessage" => %{
                   "content" => "Hallo.",
                   "files" => [%{"filename" => user2_file.filename}],
                   "user" => %{"email" => "alexis.rinaldoni@lotta.schule"},
                   "conversation" => %{
                     "users" => [
                       %{
                         "email" => "eike.wiewiorra@lotta.schule"
                       },
                       %{
                         "email" => "alexis.rinaldoni@lotta.schule"
                       }
                     ],
                     "groups" => []
                   }
                 }
               }
             }
    end

    test "send a message to a group", %{user2_jwt: user2_jwt, user2_file: user2_file, lehrer_group: lehrer_group} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{message: %{content: "Hallo.", recipient_group: %{id: lehrer_group.id}, files: [%{id: user2_file.id}]}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createMessage" => %{
                   "content" => "Hallo.",
                   "files" => [%{"filename" => user2_file.filename}],
                   "user" => %{"email" => "eike.wiewiorra@lotta.schule"},
                   "conversation" => %{
                     "users" => [],
                     "groups" => [%{"name" => "Lehrer"}]
                   }
                 }
               }
             }
    end

    test "return an error if user is not logged in", %{lehrer_group: lehrer_group} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{message: %{content: "Hallo.", recipient_group: %{id: lehrer_group.id}}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createMessage" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["createMessage"]
                 }
               ]
             }
    end

    test "return an error if no recipient is given", %{user2_jwt: user2_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{message: %{content: "Hallo."}})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createMessage" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du hast keinen Empfänger für die Nachricht ausgewählt.",
                   "path" => ["createMessage"]
                 }
               ]
             }
    end

    test "return an error if no content is given", %{
      user2_jwt: user2_jwt,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{message: %{recipient_group: %{id: lehrer_group.id}}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createMessage" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Nachricht konnte nicht versandt werden.",
                   "path" => ["createMessage"],
                   "details" => %{
                     "content" => ["darf nicht leer sein"]
                   }
                 }
               ]
             }
    end

    test "return an error if user is not part of group he wants to send message to", %{
      user2_jwt: user2_jwt,
      schueler_group: schueler_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{message: %{content: "Hallo.", recipient_group: %{id: schueler_group.id}}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createMessage" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du darfst dieser Gruppe keine Nachricht senden.",
                   "path" => ["createMessage"]
                 }
               ]
             }
    end
  end

  describe "delete message mutation" do
    @query """
    mutation DeleteMessage($id: ID!) {
      deleteMessage(id: $id) {
        id
      }
    }
    """

    test "delete own message", %{user_jwt: user_jwt, message: message, tenant: t} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: message.id
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteMessage" => %{
                   "id" => "#{message.id}"
                 }
               }
             }

      assert_raise Ecto.NoResultsError, fn ->
        Repo.get!(Message, message.id, prefix: t.prefix)
      end
    end

    test "return an error if user is not logged in", %{message: message} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            id: message.id
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteMessage" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["deleteMessage"]
                 }
               ]
             }
    end

    test "return an error if user is not message sender", %{
      user2_jwt: user2_jwt,
      message: message
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: message.id
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteMessage" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du darfst diese Nachricht nicht löschen.",
                   "path" => ["deleteMessage"]
                 }
               ]
             }
    end

    test "return an error if message does not exist", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: 0
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteMessage" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Nachricht nicht gefunden.",
                   "path" => ["deleteMessage"]
                 }
               ]
             }
    end
  end
end

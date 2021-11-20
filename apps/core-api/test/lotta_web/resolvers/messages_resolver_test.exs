defmodule LottaWeb.MessagesResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Messages.Message

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

    message =
      Repo.one!(
        from(m in Message,
          where: m.content == "OK, alles bereit?"
        ),
        prefix: tenant.prefix
      )

    {:ok,
     %{
       user: user,
       user_jwt: user_jwt,
       user2: user2,
       user2_jwt: user2_jwt,
       lehrer_group: lehrer_group,
       schueler_group: schueler_group,
       message: message,
       tenant: tenant
     }}
  end

  describe "messages query" do
    @query """
    {
      messages {
        content
        senderUser {
          name
        }
        recipientUser {
          name
        }
        recipientGroup {
          name
        }
      }
    }
    """

    test "returns all messages for a user", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "messages" => [
                   %{
                     "senderUser" => %{"name" => "Christopher Bill"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Alexis Rinaldoni"},
                     "content" => "Bist du da?"
                   },
                   %{
                     "senderUser" => %{"name" => "Eike Wiewiorra"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Alexis Rinaldoni"},
                     "content" => "Ich frag mal in die Gruppe"
                   },
                   %{
                     "senderUser" => %{"name" => "Alexis Rinaldoni"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Eike Wiewiorra"},
                     "content" => "Bereit für das Deployment"
                   },
                   %{
                     "senderUser" => %{"name" => "Eike Wiewiorra"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Alexis Rinaldoni"},
                     "content" => "Was meinst du damit?"
                   },
                   %{
                     "senderUser" => %{"name" => "Alexis Rinaldoni"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Eike Wiewiorra"},
                     "content" => "OK, alles bereit?"
                   }
                 ]
               }
             }
    end

    test "returns all messages for a user's group", %{user2_jwt: user2_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "messages" => [
                   %{
                     "senderUser" => %{"name" => "Eike Wiewiorra"},
                     "recipientGroup" => %{"name" => "Lehrer"},
                     "recipientUser" => nil,
                     "content" => "Alles bereit hier? Wir würden deployen."
                   },
                   %{
                     "senderUser" => %{"name" => "Eike Wiewiorra"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Alexis Rinaldoni"},
                     "content" => "Ich frag mal in die Gruppe"
                   },
                   %{
                     "senderUser" => %{"name" => "Alexis Rinaldoni"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Eike Wiewiorra"},
                     "content" => "Bereit für das Deployment"
                   },
                   %{
                     "senderUser" => %{"name" => "Eike Wiewiorra"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Alexis Rinaldoni"},
                     "content" => "Was meinst du damit?"
                   },
                   %{
                     "senderUser" => %{"name" => "Alexis Rinaldoni"},
                     "recipientGroup" => nil,
                     "recipientUser" => %{"name" => "Eike Wiewiorra"},
                     "content" => "OK, alles bereit?"
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
                 "messages" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["messages"]
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
        senderUser {
          email
        }
        recipientUser {
          email
        }
        recipientGroup {
          name
        }
      }
    }
    """

    test "send a message to another user", %{user2: user2, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            message: %{content: "Hallo.", recipient_user: %{id: user2.id}}
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createMessage" => %{
                   "content" => "Hallo.",
                   "senderUser" => %{"email" => "alexis.rinaldoni@lotta.schule"},
                   "recipientUser" => %{"email" => "eike.wiewiorra@lotta.schule"},
                   "recipientGroup" => nil
                 }
               }
             }
    end

    test "send a message to a group", %{user2_jwt: user2_jwt, lehrer_group: lehrer_group} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{message: %{content: "Hallo.", recipient_group: %{id: lehrer_group.id}}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createMessage" => %{
                   "content" => "Hallo.",
                   "senderUser" => %{"email" => "eike.wiewiorra@lotta.schule"},
                   "recipientUser" => nil,
                   "recipientGroup" => %{"name" => "Lehrer"}
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
                   "message" => "Nachricht konnte nicht versandt werden.",
                   "path" => ["createMessage"],
                   "details" => %{"recipient_user_id" => ["darf nicht leer sein"]}
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
                   "message" => "Du kannst dieser Gruppe keine Nachricht senden.",
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
                   "id" => Integer.to_string(message.id)
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

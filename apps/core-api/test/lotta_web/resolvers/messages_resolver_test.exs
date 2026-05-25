defmodule LottaWeb.MessagesResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  import Ecto.Query
  import Lotta.Factory

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Messages.Message
  alias Lotta.Storage.File

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    # Phase 6e will replace these email lookups with factory users
    user =
      Repo.one!(from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: tenant.prefix
      )

    user2 =
      Repo.one!(from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule"),
        prefix: tenant.prefix
      )

    # Phase 6e will replace this
    billy =
      Repo.one!(from(u in User, where: u.email == ^"billy@lotta.schule"),
        prefix: tenant.prefix
      )

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)
    {:ok, user2_jwt, _} = AccessToken.encode_and_sign(user2)

    # Phase 6c will replace these file lookups with factory helpers
    user2_file =
      Repo.get_by!(File, [user_id: user2.id, filename: "wieartig1.jpg"], prefix: tenant.prefix)

    user_file =
      Repo.one!(from(f in File, where: f.filename == ^"ich_schoen.jpg"), prefix: tenant.prefix)

    # Groups stay in seeder permanently
    lehrer_group =
      Repo.one!(from(ug in UserGroup, where: ug.name == ^"Lehrer"), prefix: tenant.prefix)

    schueler_group =
      Repo.one!(from(ug in UserGroup, where: ug.name == ^"Schüler"), prefix: tenant.prefix)

    # --- Factory conversations (replacing seeder) ---

    # Conversation 1: user (alexis) + user2 (eike), 4 messages, first has a file
    con_user_user2 = insert(:conversation) |> with_users([user, user2])

    message =
      con_user_user2
      |> Ecto.build_assoc(:messages, %Message{
        user_id: user.id,
        content: "OK, alles bereit?",
        files: [user_file]
      })
      |> Repo.insert!(prefix: @prefix)
      |> Repo.preload(:files)

    con_user_user2
    |> Ecto.build_assoc(:messages, %Message{
      user_id: user2.id,
      content: "Was meinst du damit?"
    })
    |> Repo.insert!(prefix: @prefix)

    con_user_user2
    |> Ecto.build_assoc(:messages, %Message{
      user_id: user.id,
      content: "Bereit für das Deployment"
    })
    |> Repo.insert!(prefix: @prefix)

    con_user_user2
    |> Ecto.build_assoc(:messages, %Message{
      user_id: user2.id,
      content: "Ich frag mal in die Gruppe"
    })
    |> Repo.insert!(prefix: @prefix)

    # Conversation 2: lehrer group, 1 message from user2 (eike)
    con_lehrer =
      insert(:conversation)
      |> with_groups([lehrer_group])

    con_lehrer
    |> Ecto.build_assoc(:messages, %Message{
      user_id: user2.id,
      content: "Alles bereit hier? Wir würden deployen."
    })
    |> Repo.insert!(prefix: @prefix)

    # Conversation 3: user (alexis) + billy, 1 message from billy
    con_user_billy = insert(:conversation) |> with_users([user, billy])

    con_user_billy
    |> Ecto.build_assoc(:messages, %Message{
      user_id: billy.id,
      content: "Bist du da?"
    })
    |> Repo.insert!(prefix: @prefix)

    {:ok,
     %{
       user: user,
       user_jwt: user_jwt,
       user2: user2,
       user2_jwt: user2_jwt,
       user2_file: user2_file,
       lehrer_group: lehrer_group,
       schueler_group: schueler_group,
       con_user_user2: con_user_user2,
       con_lehrer: con_lehrer,
       con_user_billy: con_user_billy,
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

      assert %{"data" => %{"conversations" => conversations}} = res
      assert length(conversations) == 2

      billy_conv =
        Enum.find(conversations, fn c ->
          Enum.any?(c["users"], &(&1["name"] == "Christopher Bill"))
        end)

      eike_conv =
        Enum.find(conversations, fn c ->
          Enum.any?(c["users"], &(&1["name"] == "Eike Wiewiorra"))
        end)

      assert billy_conv != nil
      assert eike_conv != nil
      assert length(billy_conv["users"]) == 2
      assert length(eike_conv["users"]) == 2
      assert billy_conv["groups"] == []
      assert eike_conv["groups"] == []
    end

    test "returns all conversations for another user", %{user2_jwt: user2_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{"data" => %{"conversations" => conversations}} = res
      assert length(conversations) == 2

      lehrer_conv = Enum.find(conversations, fn c -> c["groups"] != [] end)
      user_conv = Enum.find(conversations, fn c -> c["users"] != [] end)

      assert lehrer_conv != nil
      assert user_conv != nil
      assert lehrer_conv["groups"] == [%{"name" => "Lehrer"}]
      assert lehrer_conv["users"] == []

      assert Enum.sort_by(user_conv["users"], & &1["name"]) == [
               %{"name" => "Alexis Rinaldoni"},
               %{"name" => "Eike Wiewiorra"}
             ]

      assert user_conv["groups"] == []
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
      con_user_user2: con_user_user2
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: con_user_user2.id})
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
      con_lehrer: con_lehrer
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query, variables: %{id: con_lehrer.id})
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

    test "returns an error when requesting a conversation the user is not part of", %{
      user_jwt: user_jwt,
      con_lehrer: con_lehrer
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: con_lehrer.id})
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
           con_lehrer: con_lehrer
         } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: con_lehrer.id})
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

    test "return an error if user is not logged in", %{con_user_user2: con_user_user2} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{id: con_user_user2.id})
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
    mutation CreateMessage($message: MessageInput!) {
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

    test "send a message to another user", %{
      user2: user2,
      user_jwt: user_jwt,
      user2_file: user2_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            message: %{
              content: "Hallo.",
              recipient_user: %{id: user2.id},
              files: [%{id: user2_file.id}]
            }
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

    test "send a message to a group", %{
      user2_jwt: user2_jwt,
      user2_file: user2_file,
      lehrer_group: lehrer_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            message: %{
              content: "Hallo.",
              recipient_group: %{id: lehrer_group.id},
              files: [%{id: user2_file.id}]
            }
          }
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

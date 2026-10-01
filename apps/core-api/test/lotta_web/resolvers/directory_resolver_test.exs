defmodule LottaWeb.DirectoryResolverTest do
  @moduledoc false

  import Ecto.Query
  import Lotta.Factory

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants, Storage}
  alias Lotta.Accounts.User
  alias Lotta.Storage.Directory

  use LottaWeb.ConnCase, async: true

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    admin =
      Repo.one!(
        from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: tenant.prefix
      )

    user2 =
      insert(:user, email: "dir-eike@lotta.schule", name: "Eike Wiewiorra", nickname: "Chef")

    Storage.create_new_user_directories(user2)

    user =
      insert(:user, email: "dir-billy@lotta.schule", name: "Christopher Bill", nickname: "Billy")

    Storage.create_new_user_directories(user)

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)

    {:ok, user2_jwt, _} = AccessToken.encode_and_sign(user2)

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    # User2 (eike) directories
    user2_directory = insert(:directory, name: "avatar", user_id: user2.id)
    insert(:directory, name: "ehrenberg-on-air", user_id: user2.id)
    insert(:directory, name: "podcast", user_id: user2.id)

    # Admin directories
    insert(:directory, name: "irgendwas", user_id: admin.id)
    insert(:directory, name: "logos", user_id: admin.id)
    insert(:directory, name: "podcast", user_id: admin.id)

    # Public directories
    public_directory = insert(:directory, name: "logos")
    insert(:directory, name: "hintergrund")

    # Make user2_directory and public_directory non-empty (needed for delete-non-empty tests)
    insert(:directory, name: "sub", user_id: user2.id, parent_directory_id: user2_directory.id)
    insert(:directory, name: "sub", parent_directory_id: public_directory.id)

    {:ok,
     %{
       admin_account: admin,
       admin_jwt: admin_jwt,
       user2_account: user2,
       user2_jwt: user2_jwt,
       user_account: user,
       user_jwt: user_jwt,
       user2_directory: user2_directory,
       public_directory: public_directory,
       tenant: tenant
     }}
  end

  describe "directories query" do
    @query """
    query getDirectories($parentDirectoryId: ID) {
      directories(parentDirectoryId: $parentDirectoryId) {
        name
        user {
          id
        }
        parentDirectory {
          id
        }
      }
    }
    """

    test "returns own root directories and public root directories for admin user", %{
      admin_jwt: admin_jwt,
      admin_account: admin_account
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{parentDirectoryId: nil})
        |> json_response(200)

      assert %{"data" => %{"directories" => dirs}} = res

      admin_id_str = Integer.to_string(admin_account.id)

      user_dir_names =
        dirs
        |> Enum.filter(&(&1["user"] == %{"id" => admin_id_str}))
        |> Enum.map(& &1["name"])
        |> MapSet.new()

      public_dir_names =
        dirs |> Enum.filter(&is_nil(&1["user"])) |> Enum.map(& &1["name"]) |> MapSet.new()

      assert MapSet.subset?(
               MapSet.new([
                 "irgendwas",
                 "logos",
                 "Meine Bilder",
                 "Meine Dokumente",
                 "Meine Tondokumente",
                 "Meine Videos",
                 "Mein Profil",
                 "podcast"
               ]),
               user_dir_names
             )

      assert MapSet.subset?(MapSet.new(["hintergrund", "logos"]), public_dir_names)
      assert Enum.all?(dirs, &(&1["parentDirectory"] == nil))

      # user dirs come before public dirs
      last_user_pos =
        dirs
        |> Enum.with_index()
        |> Enum.filter(fn {d, _} -> d["user"] == %{"id" => admin_id_str} end)
        |> Enum.map(&elem(&1, 1))
        |> Enum.max()

      first_public_pos =
        dirs
        |> Enum.with_index()
        |> Enum.filter(fn {d, _} -> is_nil(d["user"]) end)
        |> Enum.map(&elem(&1, 1))
        |> Enum.min()

      assert last_user_pos < first_public_pos
    end

    test "returns own root directories and public root directories for non-admin user", %{
      user2_jwt: user2_jwt,
      user2_account: user2_account
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query, variables: %{parentDirectoryId: nil})
        |> json_response(200)

      assert %{"data" => %{"directories" => dirs}} = res

      user2_id_str = Integer.to_string(user2_account.id)

      user_dir_names =
        dirs
        |> Enum.filter(&(&1["user"] == %{"id" => user2_id_str}))
        |> Enum.map(& &1["name"])
        |> MapSet.new()

      public_dir_names =
        dirs |> Enum.filter(&is_nil(&1["user"])) |> Enum.map(& &1["name"]) |> MapSet.new()

      assert MapSet.subset?(
               MapSet.new([
                 "avatar",
                 "ehrenberg-on-air",
                 "Meine Bilder",
                 "Meine Dokumente",
                 "Meine Tondokumente",
                 "Meine Videos",
                 "Mein Profil",
                 "podcast"
               ]),
               user_dir_names
             )

      assert MapSet.subset?(MapSet.new(["hintergrund", "logos"]), public_dir_names)
      assert Enum.all?(dirs, &(&1["parentDirectory"] == nil))

      last_user_pos =
        dirs
        |> Enum.with_index()
        |> Enum.filter(fn {d, _} -> d["user"] == %{"id" => user2_id_str} end)
        |> Enum.map(&elem(&1, 1))
        |> Enum.max()

      first_public_pos =
        dirs
        |> Enum.with_index()
        |> Enum.filter(fn {d, _} -> is_nil(d["user"]) end)
        |> Enum.map(&elem(&1, 1))
        |> Enum.min()

      assert last_user_pos < first_public_pos
    end

    test "returns only public root directories for user with no own directories", %{
      user_jwt: user_jwt,
      user_account: user_account
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{parentDirectoryId: nil})
        |> json_response(200)

      assert %{"data" => %{"directories" => dirs}} = res

      user_id_str = Integer.to_string(user_account.id)

      user_dir_names =
        dirs
        |> Enum.filter(&(&1["user"] == %{"id" => user_id_str}))
        |> Enum.map(& &1["name"])
        |> MapSet.new()

      public_dir_names =
        dirs |> Enum.filter(&is_nil(&1["user"])) |> Enum.map(& &1["name"]) |> MapSet.new()

      assert MapSet.subset?(
               MapSet.new([
                 "Meine Bilder",
                 "Meine Dokumente",
                 "Meine Tondokumente",
                 "Meine Videos",
                 "Mein Profil"
               ]),
               user_dir_names
             )

      assert MapSet.subset?(MapSet.new(["hintergrund", "logos"]), public_dir_names)
      assert Enum.all?(dirs, &(&1["parentDirectory"] == nil))
    end

    test "returns error when user is not owner of private directory and user is not admin", %{
      user_jwt: user_jwt,
      user2_directory: user2_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{parentDirectoryId: user2_directory.id})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner anzusehen.",
                   "path" => ["directories"]
                 }
               ]
             } = res
    end

    test "returns error when user is not owner of private directory and user is admin", %{
      admin_jwt: admin_jwt,
      user2_directory: user2_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{parentDirectoryId: user2_directory.id})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner anzusehen.",
                   "path" => ["directories"]
                 }
               ]
             } = res
    end
  end

  describe "directory query" do
    @query """
    query directory($id: ID) {
      directory(id: $id) {
        name
        parentDirectory {
          id
        }
      }
    }
    """

    test "returns directory information for user's own directory", %{
      user2_jwt: user2_jwt,
      user2_directory: user2_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query, variables: %{id: user2_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "directory" => %{
                   "name" => "avatar",
                   "parentDirectory" => nil
                 }
               }
             }
    end

    test "returns directory information for public directory as non-admin user", %{
      user2_jwt: user2_jwt,
      public_directory: public_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query, variables: %{id: public_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "directory" => %{
                   "name" => "logos",
                   "parentDirectory" => nil
                 }
               }
             }
    end

    test "returns directory information for public directory as admin user", %{
      admin_jwt: admin_jwt,
      public_directory: public_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: public_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "directory" => %{
                   "name" => "logos",
                   "parentDirectory" => nil
                 }
               }
             }
    end

    test "returns error when user is not owner of private directory and user is not admin", %{
      user_jwt: user_jwt,
      user2_directory: user2_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_directory.id})
        |> json_response(200)

      assert %{
               "data" => %{"directory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner anzusehen.",
                   "path" => ["directory"]
                 }
               ]
             } = res
    end

    test "returns error when user is not owner of private directory and user is admin", %{
      admin_jwt: admin_jwt,
      user2_directory: user2_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_directory.id})
        |> json_response(200)

      assert %{
               "data" => %{"directory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner anzusehen.",
                   "path" => ["directory"]
                 }
               ]
             } = res
    end
  end

  describe "create directory mutation" do
    @query """
    mutation createDirectory($parentDirectoryId: ID, $name: String!, $isPublic: Boolean) {
      createDirectory(parentDirectoryId: $parentDirectoryId, name: $name, isPublic: $isPublic) {
        name
        parentDirectory {
          name
        }
        user {
          id
        }
      }
    }
    """
    test "create a new root private directory", %{
      user2_jwt: user2_jwt,
      user2_account: user2_account
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{name: "Neuer Ordner"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createDirectory" => %{
                   "name" => "Neuer Ordner",
                   "parentDirectory" => nil,
                   "user" => %{"id" => Integer.to_string(user2_account.id)}
                 }
               }
             }
    end

    test "create a new private directory as subdirectory", %{
      user2_jwt: user2_jwt,
      user2_account: user2_account,
      user2_directory: user2_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{name: "Neuer Ordner", parentDirectoryId: user2_directory.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createDirectory" => %{
                   "name" => "Neuer Ordner",
                   "parentDirectory" => %{"name" => "avatar"},
                   "user" => %{"id" => Integer.to_string(user2_account.id)}
                 }
               }
             }
    end

    test "returns error when user is not owner of parent directory", %{
      user2_directory: user2_directory,
      user_jwt: user_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{name: "newdirectoryname", parentDirectoryId: user2_directory.id}
        )
        |> json_response(200)

      assert %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                   "path" => ["createDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when user is not owner of private source directory and user is admin", %{
      user2_directory: user2_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{parentDirectoryId: user2_directory.id, name: "newdirectoryname"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                   "path" => ["createDirectory"]
                 }
               ]
             } = res
    end

    test "create a new root public directory as admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{name: "Neuer Ordner", isPublic: true})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createDirectory" => %{
                   "name" => "Neuer Ordner",
                   "parentDirectory" => nil,
                   "user" => nil
                 }
               }
             }
    end

    test "create a new public directory as subdirectory as admin", %{
      admin_jwt: admin_jwt,
      public_directory: public_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{name: "Neuer Ordner", parentDirectoryId: public_directory.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createDirectory" => %{
                   "name" => "Neuer Ordner",
                   "parentDirectory" => %{"name" => "logos"},
                   "user" => nil
                 }
               }
             }
    end

    test "returns error when creating a root public directory as non-admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{name: "newdirectoryname", parentDirectoryId: nil, isPublic: true}
        )
        |> json_response(200)

      assert %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                   "path" => ["createDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when creating a directory as a subfolder of a public directory as non-admin",
         %{user2_directory: user2_directory, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{name: "newdirectoryname", parentDirectoryId: user2_directory.id}
        )
        |> json_response(200)

      assert %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                   "path" => ["createDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when directory does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            parentDirectoryId: "00000000-0000-0000-0000-000000000000",
            name: "newdirectoryname"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "message" =>
                     "Ordner mit der id 00000000-0000-0000-0000-000000000000 nicht gefunden.",
                   "path" => ["createDirectory"]
                 }
               ]
             } = res
    end
  end

  describe "update directory mutation" do
    @query """
    mutation updateDirectory($id: ID!, $parentDirectoryId: ID, $name: String) {
      updateDirectory(id: $id, parentDirectoryId: $parentDirectoryId, name: $name) {
        name
        parentDirectory {
          name
        }
      }
    }
    """
    test "move a user's own directory to own directory", %{
      user2_directory: user2_directory,
      user2_jwt: user2_jwt,
      user2_account: user2_account,
      tenant: t
    } do
      target_dir =
        Repo.one!(
          from(d in Directory,
            where: d.name == ^"podcast" and d.user_id == ^user2_account.id
          ),
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_directory.id, parentDirectoryId: target_dir.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateDirectory" => %{
                   "name" => "avatar",
                   "parentDirectory" => %{"name" => "podcast"}
                 }
               }
             }
    end

    test "move a user's own directory to root", %{
      user2_directory: user2_directory,
      user2_jwt: user2_jwt,
      user2_account: user2_account,
      tenant: t
    } do
      dir =
        Repo.insert!(
          %Directory{
            user_id: user2_account.id,
            name: "directory",
            parent_directory_id: user2_directory.id
          },
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{id: dir.id, parentDirectoryId: nil})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateDirectory" => %{"name" => "directory", "parentDirectory" => nil}
               }
             }
    end

    test "returns error when user is not owner of private source directory and user is not admin",
         %{user2_directory: user2_directory, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_directory.id, name: "newdirectoryname"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                   "path" => ["updateDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when user is not owner of private source directory and user is admin", %{
      user2_directory: user2_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_directory.id, name: "newdirectoryname"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                   "path" => ["updateDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when directory does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: "00000000-0000-0000-0000-000000000000", name: "newdirectoryname"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "message" =>
                     "Ordner mit der id 00000000-0000-0000-0000-000000000000 nicht gefunden.",
                   "path" => ["updateDirectory"]
                 }
               ]
             } = res
    end

    test "rename a directory in public directory as admin", %{
      public_directory: public_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: public_directory.id, name: "newdirname"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateDirectory" => %{"name" => "newdirname", "parentDirectory" => nil}
               }
             }
    end

    test "returns error when trying to move a directory into itslef", %{
      user2_directory: user2_directory,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_directory.id, parentDirectoryId: user2_directory.id}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du kannst diesen Ordner nicht hierher verschieben.",
                   "path" => ["updateDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when trying to move a directory from public directory as non-admin", %{
      public_directory: public_directory,
      user2_jwt: user2_jwt,
      user2_account: user2_account,
      tenant: t
    } do
      target_dir =
        Repo.one!(
          from(d in Directory,
            where: d.name == ^"podcast" and d.user_id == ^user2_account.id
          ),
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: public_directory.id,
            parentDirectoryId: target_dir.id
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                   "path" => ["updateDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when trying to move a directory to public directory as non-admin", %{
      user2_directory: user2_directory,
      user2_jwt: user2_jwt,
      public_directory: public_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: user2_directory.id,
            parentDirectoryId: public_directory.id
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                   "path" => ["updateDirectory"]
                 }
               ]
             } = res
    end
  end

  describe "delete directory mutation" do
    @query """
    mutation deleteDirectory($id: ID!) {
      deleteDirectory(id: $id) {
        name
      }
    }
    """
    test "delete a user's own directory", %{
      user2_jwt: user2_jwt,
      user2_account: user2_account,
      tenant: t
    } do
      directory =
        Repo.insert!(
          %Directory{
            name: "temporary",
            user_id: user2_account.id
          },
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteDirectory" => %{"name" => "temporary"}
               }
             }

      assert Repo.get(Directory, directory.id, prefix: t.prefix) == nil
    end

    test "returns error when user is not owner of directory as admin", %{
      admin_jwt: admin_jwt,
      user2_account: user2_account,
      tenant: t
    } do
      directory =
        Repo.insert!(
          %Directory{
            name: "temporary",
            user_id: user2_account.id
          },
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu löschen.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when user is not owner of directory as non-admin", %{
      user_jwt: user_jwt,
      user2_account: user2_account,
      tenant: t
    } do
      directory =
        Repo.insert!(
          %Directory{
            name: "temporary",
            user_id: user2_account.id
          },
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu löschen.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when directory does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: "00000000-0000-0000-0000-000000000000"})
        |> json_response(200)

      assert %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "message" =>
                     "Ordner mit der id 00000000-0000-0000-0000-000000000000 nicht gefunden.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             } = res
    end

    test "deletes a public directory as admin if directory is empty", %{
      admin_jwt: admin_jwt,
      tenant: t
    } do
      directory =
        Repo.insert!(
          %Directory{
            name: "public_temporary"
          },
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteDirectory" => %{"name" => "public_temporary"}
               }
             }

      assert Repo.get(Directory, directory.id, prefix: t.prefix) == nil
    end

    test "returns error when trying to delete a non-empty public directory as admin", %{
      public_directory: public_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: public_directory.id})
        |> json_response(200)

      assert %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Es dürfen nur leere Ordner gelöscht werden.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             } = res
    end

    test "deletes own directory as user if directory is empty", %{
      user_jwt: user_jwt,
      user_account: user_account,
      tenant: t
    } do
      directory =
        Repo.insert!(
          %Directory{
            name: "temporary",
            user_id: user_account.id
          },
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteDirectory" => %{"name" => "temporary"}
               }
             }

      assert Repo.get(Directory, directory.id, prefix: t.prefix) == nil
    end

    test "returns error when trying to delete a non-empty public directory as non-admin", %{
      user2_directory: user2_directory,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_directory.id})
        |> json_response(200)

      assert %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Es dürfen nur leere Ordner gelöscht werden.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             } = res
    end

    test "returns error when trying to delete a public directory as non-admin", %{
      public_directory: public_directory,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{id: public_directory.id})
        |> json_response(200)

      assert %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu löschen.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             } = res
    end
  end
end

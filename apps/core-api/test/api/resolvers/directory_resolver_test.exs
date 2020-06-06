defmodule Api.DirectoryResolverTest do
  @moduledoc """
    Test Module for DirectoryResolver
  """

  use ApiWeb.ConnCase
  import Ecto.Query

  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    admin = Api.Repo.get_by!(Api.Accounts.User, email: "alexis.rinaldoni@lotta.schule")
    user2 = Api.Repo.get_by!(Api.Accounts.User, email: "eike.wiewiorra@lotta.schule")
    user = Api.Repo.get_by!(Api.Accounts.User, email: "billy@lotta.schule")

    {:ok, admin_jwt, _} =
      Api.Guardian.encode_and_sign(admin, %{email: admin.email, name: admin.name})

    {:ok, user2_jwt, _} =
      Api.Guardian.encode_and_sign(user2, %{email: user2.email, name: user2.name})

    {:ok, user_jwt, _} = Api.Guardian.encode_and_sign(user, %{email: user.email, name: user.name})

    user2_directory =
      Api.Repo.one!(
        from d in Api.Accounts.Directory,
          where:
            is_nil(d.parent_directory_id) and d.name == "avatar" and d.tenant_id == ^web_tenant.id and
              d.user_id == ^user2.id
      )

    public_directory =
      Api.Repo.one!(
        from d in Api.Accounts.Directory,
          where:
            d.name == "logos" and d.tenant_id == ^web_tenant.id and is_nil(d.user_id) and
              is_nil(d.parent_directory_id)
      )

    {:ok,
     %{
       web_tenant: web_tenant,
       admin_account: admin,
       admin_jwt: admin_jwt,
       user2_account: user2,
       user2_jwt: user2_jwt,
       user_account: user,
       user_jwt: user_jwt,
       user2_directory: user2_directory,
       public_directory: public_directory
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{parentDirectoryId: nil})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "directories" => [
                   %{
                     "name" => "irgendwas",
                     "user" => %{"id" => admin_account.id},
                     "parentDirectory" => nil
                   },
                   %{
                     "name" => "logos",
                     "user" => %{"id" => admin_account.id},
                     "parentDirectory" => nil
                   },
                   %{
                     "name" => "Meine Bilder",
                     "parentDirectory" => nil,
                     "user" => %{"id" => admin_account.id}
                   },
                   %{
                     "name" => "Meine Dokumente",
                     "parentDirectory" => nil,
                     "user" => %{"id" => admin_account.id}
                   },
                   %{
                     "name" => "Meine Tondokumente",
                     "parentDirectory" => nil,
                     "user" => %{"id" => admin_account.id}
                   },
                   %{
                     "name" => "Meine Videos",
                     "parentDirectory" => nil,
                     "user" => %{"id" => admin_account.id}
                   },
                   %{
                     "name" => "Mein Profil",
                     "parentDirectory" => nil,
                     "user" => %{"id" => admin_account.id}
                   },
                   %{
                     "name" => "podcast",
                     "user" => %{"id" => admin_account.id},
                     "parentDirectory" => nil
                   },
                   %{"name" => "hintergrund", "user" => nil, "parentDirectory" => nil},
                   %{"name" => "logos", "user" => nil, "parentDirectory" => nil}
                 ]
               }
             }
    end

    test "returns own root directories and public root directories for non-admin user", %{
      user2_jwt: user2_jwt,
      user2_account: user2_account
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query, variables: %{parentDirectoryId: nil})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "directories" => [
                   %{
                     "name" => "avatar",
                     "user" => %{"id" => user2_account.id},
                     "parentDirectory" => nil
                   },
                   %{
                     "name" => "ehrenberg-on-air",
                     "user" => %{"id" => user2_account.id},
                     "parentDirectory" => nil
                   },
                   %{
                     "name" => "Meine Bilder",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user2_account.id}
                   },
                   %{
                     "name" => "Meine Dokumente",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user2_account.id}
                   },
                   %{
                     "name" => "Meine Tondokumente",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user2_account.id}
                   },
                   %{
                     "name" => "Meine Videos",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user2_account.id}
                   },
                   %{
                     "name" => "Mein Profil",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user2_account.id}
                   },
                   %{
                     "name" => "podcast",
                     "user" => %{"id" => user2_account.id},
                     "parentDirectory" => nil
                   },
                   %{"name" => "hintergrund", "user" => nil, "parentDirectory" => nil},
                   %{"name" => "logos", "user" => nil, "parentDirectory" => nil}
                 ]
               }
             }
    end

    test "returns only public root directories for user with no own directories", %{
      user_jwt: user_jwt,
      user_account: user_account
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{parentDirectoryId: nil})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "directories" => [
                   %{
                     "name" => "Meine Bilder",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user_account.id}
                   },
                   %{
                     "name" => "Meine Dokumente",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user_account.id}
                   },
                   %{
                     "name" => "Meine Tondokumente",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user_account.id}
                   },
                   %{
                     "name" => "Meine Videos",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user_account.id}
                   },
                   %{
                     "name" => "Mein Profil",
                     "parentDirectory" => nil,
                     "user" => %{"id" => user_account.id}
                   },
                   %{"name" => "hintergrund", "user" => nil, "parentDirectory" => nil},
                   %{"name" => "logos", "user" => nil, "parentDirectory" => nil}
                 ]
               }
             }
    end

    test "returns error when user is not owner of private directory and user is not admin", %{
      user_jwt: user_jwt,
      user2_account: user2_account,
      web_tenant: web_tenant
    } do
      user2_directory =
        Api.Repo.get_by!(Api.Accounts.Directory,
          name: "avatar",
          tenant_id: web_tenant.id,
          user_id: user2_account.id
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{parentDirectoryId: user2_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"directories" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du hast nicht die Berechtigung, diesen Ordner zu lesen.",
                   "path" => ["directories"]
                 }
               ]
             }
    end

    test "returns error when user is not owner of private directory and user is admin", %{
      admin_jwt: admin_jwt,
      user2_account: user2_account,
      web_tenant: web_tenant
    } do
      user2_directory =
        Api.Repo.get_by!(Api.Accounts.Directory,
          name: "avatar",
          tenant_id: web_tenant.id,
          user_id: user2_account.id
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{parentDirectoryId: user2_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"directories" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du hast nicht die Berechtigung, diesen Ordner zu lesen.",
                   "path" => ["directories"]
                 }
               ]
             }
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
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"directory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du hast nicht die Berechtigung, diesen Ordner zu lesen.",
                   "path" => ["directory"]
                 }
               ]
             }
    end

    test "returns error when user is not owner of private directory and user is admin", %{
      admin_jwt: admin_jwt,
      user2_directory: user2_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"directory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du hast nicht die Berechtigung, diesen Ordner zu lesen.",
                   "path" => ["directory"]
                 }
               ]
             }
    end
  end

  describe "create directory mutation" do
    @query """
    mutation createDirectory($parentDirectoryId: ID, $name: String, $isPublic: Boolean) {
      createDirectory(parentDirectoryId: $parentDirectoryId, name: $name, isPublic: $isPublic) {
        name
        parentDirectory {
          name
        }
        user {
          id
        }
        tenant {
          slug
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{name: "Neuer Ordner"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createDirectory" => %{
                   "name" => "Neuer Ordner",
                   "parentDirectory" => nil,
                   "user" => %{"id" => user2_account.id},
                   "tenant" => %{"slug" => "web"}
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
        |> put_req_header("tenant", "slug:web")
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
                   "user" => %{"id" => user2_account.id},
                   "tenant" => %{"slug" => "web"}
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{name: "newdirectoryname", parentDirectoryId: user2_directory.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner hier nicht erstellen.",
                   "path" => ["createDirectory"]
                 }
               ]
             }
    end

    test "returns error when user is not owner of private source directory and user is admin", %{
      user2_directory: user2_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{parentDirectoryId: user2_directory.id, name: "newdirectoryname"}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner hier nicht erstellen.",
                   "path" => ["createDirectory"]
                 }
               ]
             }
    end

    test "create a new root public directory as admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{name: "Neuer Ordner", isPublic: true})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createDirectory" => %{
                   "name" => "Neuer Ordner",
                   "parentDirectory" => nil,
                   "user" => nil,
                   "tenant" => %{"slug" => "web"}
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
        |> put_req_header("tenant", "slug:web")
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
                   "user" => nil,
                   "tenant" => %{"slug" => "web"}
                 }
               }
             }
    end

    test "returns error when creating a root public directory as non-admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{name: "newdirectoryname", parentDirectoryId: nil, isPublic: true}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner hier nicht erstellen.",
                   "path" => ["createDirectory"]
                 }
               ]
             }
    end

    test "returns error when creating a directory as a subfolder of a public directory as non-admin",
         %{user2_directory: user2_directory, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{name: "newdirectoryname", parentDirectoryId: user2_directory.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner hier nicht erstellen.",
                   "path" => ["createDirectory"]
                 }
               ]
             }
    end

    test "returns error when directory does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{parentDirectoryId: 0, name: "newdirectoryname"}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"createDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Ordner nicht gefunden.",
                   "path" => ["createDirectory"]
                 }
               ]
             }
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
      user2_account: user2_account
    } do
      target_dir =
        Api.Repo.get_by!(Api.Accounts.Directory, name: "podcast", user_id: user2_account.id)

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
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
      user2_account: user2_account
    } do
      dir =
        Api.Repo.insert!(%Api.Accounts.Directory{
          user_id: user2_account.id,
          name: "directory",
          tenant_id: user2_directory.tenant_id,
          parent_directory_id: user2_directory.id
        })

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_directory.id, name: "newdirectoryname"}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner nicht bearbeiten.",
                   "path" => ["updateDirectory"]
                 }
               ]
             }
    end

    test "returns error when user is not owner of private source directory and user is admin", %{
      user2_directory: user2_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_directory.id, name: "newdirectoryname"}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner nicht bearbeiten.",
                   "path" => ["updateDirectory"]
                 }
               ]
             }
    end

    test "returns error when directory does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: 0, name: "newdirectoryname"})
        |> json_response(200)

      assert res == %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Datei oder Ordner nicht gefunden.",
                   "path" => ["updateDirectory"]
                 }
               ]
             }
    end

    test "rename a directory in public directory as admin", %{
      public_directory: public_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_directory.id, parentDirectoryId: user2_directory.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du kannst diesen Ordner nicht hierher verschieben.",
                   "path" => ["updateDirectory"]
                 }
               ]
             }
    end

    test "returns error when trying to move a directory from public directory as non-admin", %{
      public_directory: public_directory,
      user2_jwt: user2_jwt,
      user2_account: user2_account
    } do
      target_dir =
        Api.Repo.get_by!(Api.Accounts.Directory, name: "podcast", user_id: user2_account.id)

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: public_directory.id, parentDirectoryId: target_dir.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner nicht bearbeiten.",
                   "path" => ["updateDirectory"]
                 }
               ]
             }
    end

    test "returns error when trying to move a directory to public directory as non-admin", %{
      user2_directory: user2_directory,
      user2_jwt: user2_jwt,
      public_directory: public_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_directory.id, parentDirectoryId: public_directory.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{"updateDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner nicht bearbeiten.",
                   "path" => ["updateDirectory"]
                 }
               ]
             }
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
      web_tenant: web_tenant
    } do
      directory =
        Api.Repo.insert!(%Api.Accounts.Directory{
          name: "temporary",
          user_id: user2_account.id,
          tenant_id: web_tenant.id
        })

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteDirectory" => %{"name" => "temporary"}
               }
             }

      assert Api.Repo.get(Api.Accounts.Directory, directory.id) == nil
    end

    test "returns error when user is not owner of directory as admin", %{
      admin_jwt: admin_jwt,
      user2_account: user2_account,
      web_tenant: web_tenant
    } do
      directory =
        Api.Repo.insert!(%Api.Accounts.Directory{
          name: "temporary",
          user_id: user2_account.id,
          tenant_id: web_tenant.id
        })

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner nicht löschen.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             }
    end

    test "returns error when user is not owner of directory as non-admin", %{
      user_jwt: user_jwt,
      user2_account: user2_account,
      web_tenant: web_tenant
    } do
      directory =
        Api.Repo.insert!(%Api.Accounts.Directory{
          name: "temporary",
          user_id: user2_account.id,
          tenant_id: web_tenant.id
        })

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner nicht löschen.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             }
    end

    test "returns error when directory does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert res == %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Ordner nicht gefunden.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             }
    end

    test "deletes a public directory as admin if directory is empty", %{
      admin_jwt: admin_jwt,
      web_tenant: web_tenant
    } do
      directory =
        Api.Repo.insert!(%Api.Accounts.Directory{
          name: "public_temporary",
          tenant_id: web_tenant.id
        })

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteDirectory" => %{"name" => "public_temporary"}
               }
             }

      assert Api.Repo.get(Api.Accounts.Directory, directory.id) == nil
    end

    test "returns error when trying to delete a non-empty public directory as admin", %{
      public_directory: public_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: public_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Es dürfen nur leere Ordner gelöscht werden.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             }
    end

    test "deletes own directory as user if directory is empty", %{
      user_jwt: user_jwt,
      user_account: user_account,
      web_tenant: web_tenant
    } do
      directory =
        Api.Repo.insert!(%Api.Accounts.Directory{
          name: "temporary",
          tenant_id: web_tenant.id,
          user_id: user_account.id
        })

      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteDirectory" => %{"name" => "temporary"}
               }
             }

      assert Api.Repo.get(Api.Accounts.Directory, directory.id) == nil
    end

    test "returns error when trying to delete a non-empty public directory as non-admin", %{
      user2_directory: user2_directory,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Es dürfen nur leere Ordner gelöscht werden.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             }
    end

    test "returns error when trying to delete a public directory as non-admin", %{
      public_directory: public_directory,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query, variables: %{id: public_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{"deleteDirectory" => nil},
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Du darfst diesen Ordner nicht löschen.",
                   "path" => ["deleteDirectory"]
                 }
               ]
             }
    end
  end
end

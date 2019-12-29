defmodule Api.FileResolverTest do
  use ApiWeb.ConnCase
  
  setup do
    Api.Repo.Seeder.seed()

    web_tenant = Api.Tenants.get_tenant_by_slug!("web")
    admin = Api.Repo.get_by!(Api.Accounts.User, [email: "alexis.rinaldoni@einsa.net"])
    user2 = Api.Repo.get_by!(Api.Accounts.User, [email: "eike.wiewiorra@einsa.net"])
    user = Api.Repo.get_by!(Api.Accounts.User, [email: "billy@einsa.net"])
    {:ok, admin_jwt, _} = Api.Guardian.encode_and_sign(admin, %{ email: admin.email, name: admin.name })
    {:ok, user2_jwt, _} = Api.Guardian.encode_and_sign(user2, %{ email: user2.email, name: user2.name })
    {:ok, user_jwt, _} = Api.Guardian.encode_and_sign(user, %{ email: user.email, name: user.name })
    admin_file = Api.Repo.get_by!(Api.Accounts.File, [filename: "ich_schoen.jpg"])
    user_file = Api.Repo.get_by!(Api.Accounts.File, [filename: "ich_schoen.jpg"])
    user2_file = Api.Repo.get_by!(Api.Accounts.File, [filename: "wieartig1.jpg"])
    public_file = Api.Repo.get_by!(Api.Accounts.File, [path: "/logos", filename: "logo1.jpg", is_public: true])

    {:ok, %{
      web_tenant: web_tenant,
      admin_account: admin,
      admin_jwt: admin_jwt,
      user2_account: user2,
      user2_jwt: user2_jwt,
      user_account: user,
      user_jwt: user_jwt,
      admin_file: admin_file,
      user_file: user_file,
      user2_file: user2_file,
      public_file: public_file,
    }}
  end

  
  describe "files query" do
    @query """
    {
      files {
        path
        filename
        isPublic
      }
    }
    """

    test "returns own files and public files for an admin with own files and public files", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "files" => [
              %{"filename" => "irgendwas.png", "isPublic" => false, "path" => "/"},
              %{"filename" => "wasanderes.png", "isPublic" => false, "path" => "/"},
              %{"filename" => "ich_haesslich.jpg", "isPublic" => false, "path" => "/avatar"},
              %{"filename" => "ich_schoen.jpg", "isPublic" => false, "path" => "/avatar"},
              %{"filename" => "pc3.m4v", "isPublic" => false, "path" => "/podcast"},
              %{"filename" => "podcast1.mp4", "isPublic" => false, "path" => "/podcast"},
              %{"filename" => "podcast2.mov", "isPublic" => false, "path" => "/podcast"},
              %{"isPublic" => true, "path" => "/hintergrund", "filename" => "hg_comic.png"},
              %{"isPublic" => true, "path" => "/hintergrund", "filename" => "hg_dunkel.jpg"},
              %{"isPublic" => true, "path" => "/hintergrund", "filename" => "hg_grafik.png"},
              %{"isPublic" => true, "path" => "/hintergrund", "filename" => "hg_hell.jpg"},
              %{"filename" => "logo1.jpg", "isPublic" => true, "path" => "/logos"},
              %{"filename" => "logo2.jpg", "isPublic" => true, "path" => "/logos"},
              %{"filename" => "logo3.png", "isPublic" => true, "path" => "/logos"},
              %{"filename" => "logo4.png", "isPublic" => true, "path" => "/logos"},
              %{"filename" => "chamaeleon.png", "isPublic" => true, "path" => "/logos/chamaeleon"},
              %{"filename" => "podcast1.png", "isPublic" => true, "path" => "/logos/podcast"},
              %{"filename" => "podcast2.png", "isPublic" => true, "path" => "/logos/podcast"}
          ]
        }
      }
    end
    
    test "returns own files and public files for a user with own files and public files", %{user2_jwt: user2_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user2_jwt}")
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "files" => [
              %{"filename" => "wieartig1.jpg", "isPublic" => false, "path" => "/avatar"},
              %{"filename" => "wieartig2.jpg", "isPublic" => false, "path" => "/avatar"},
              %{"filename" => "eoa1.mp3", "isPublic" => false, "path" => "/ehrenberg-on-air"},
              %{"filename" => "eoa2.mp3", "isPublic" => false, "path" => "/ehrenberg-on-air"},
              %{"filename" => "pocst7.m4v", "isPublic" => false, "path" => "/podcast"},
              %{"filename" => "podcast5.mp4", "isPublic" => false, "path" => "/podcast"},
              %{"filename" => "podcast6.mov", "isPublic" => false, "path" => "/podcast"},
              %{"isPublic" => true, "path" => "/hintergrund", "filename" => "hg_comic.png"},
              %{"isPublic" => true, "path" => "/hintergrund", "filename" => "hg_dunkel.jpg"},
              %{"isPublic" => true, "path" => "/hintergrund", "filename" => "hg_grafik.png"},
              %{"isPublic" => true, "path" => "/hintergrund", "filename" => "hg_hell.jpg"},
              %{"filename" => "logo1.jpg", "isPublic" => true, "path" => "/logos"},
              %{"filename" => "logo2.jpg", "isPublic" => true, "path" => "/logos"},
              %{"filename" => "logo3.png", "isPublic" => true, "path" => "/logos"},
              %{"filename" => "logo4.png", "isPublic" => true, "path" => "/logos"},
              %{"filename" => "chamaeleon.png", "isPublic" => true, "path" => "/logos/chamaeleon"},
              %{"filename" => "podcast1.png", "isPublic" => true, "path" => "/logos/podcast"},
              %{"filename" => "podcast2.png", "isPublic" => true, "path" => "/logos/podcast"}
          ]
        }
      }
    end
    
    test "returns only public files for a user with no own files and public files", %{user_jwt: user_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user_jwt}")
      |> get("/api", query: @query)
      |> json_response(200)

      assert res == %{
        "data" => %{
          "files" => [
              %{"isPublic" => true, "filename" => "hg_comic.png", "path" => "/hintergrund"},
              %{"isPublic" => true, "filename" => "hg_dunkel.jpg", "path" => "/hintergrund"},
              %{"isPublic" => true, "filename" => "hg_grafik.png", "path" => "/hintergrund"},
              %{"isPublic" => true, "filename" => "hg_hell.jpg", "path" => "/hintergrund"},
              %{"isPublic" => true, "filename" => "logo1.jpg", "path" => "/logos"},
              %{"isPublic" => true, "filename" => "logo2.jpg", "path" => "/logos"},
              %{"isPublic" => true, "filename" => "logo3.png", "path" => "/logos"},
              %{"isPublic" => true, "filename" => "logo4.png", "path" => "/logos"},
              %{"isPublic" => true, "filename" => "chamaeleon.png", "path" => "/logos/chamaeleon"},
              %{"isPublic" => true, "filename" => "podcast1.png", "path" => "/logos/podcast"},
              %{"isPublic" => true, "filename" => "podcast2.png", "path" => "/logos/podcast"}
          ]
        }
      }
    end
  end

  
  describe "move file mutation" do
    @query """
    mutation moveFile($id: ID!, $path: String, $isPublic: Boolean) {
      moveFile(id: $id, path: $path, isPublic: $isPublic) {
        path
        filename
        isPublic
      }
    }
    """
    test "move a user's own file", %{user2_file: user2_file, user2_jwt: user2_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user2_jwt}")
      |> post("/api", query: @query, variables: %{id: user2_file.id, path: "/neu"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "moveFile" => %{"filename" => "wieartig1.jpg", "isPublic" => false, "path" => "/neu"}
        }
      }
    end

    test "returns error when user is not owner of file", %{user2_file: user2_file, admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: user2_file.id, path: "/neu"})
      |> json_response(200)

      assert res == %{
        "data" => %{"moveFile" => nil},
        "errors" => [
          %{"locations" => [%{"column" => 0, "line" => 2}], "message" => "Du darfst diese Datei nicht verschieben.", "path" => ["moveFile"]}
        ]
      }
    end
    
    test "returns error when file does not exist", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: 0, path: "/neu"})
      |> json_response(200)

      assert res == %{
        "data" => %{"moveFile" => nil},
        "errors" => [
          %{"locations" => [%{"column" => 0, "line" => 2}], "message" => "Datei mit der id 0 nicht gefunden.", "path" => ["moveFile"]}
        ]
      }
    end
  end

  test "move a public file as admin", %{public_file: public_file, admin_jwt: admin_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> post("/api", query: @query, variables: %{id: public_file.id, path: "/neu"})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "moveFile" => %{"filename" => "logo1.jpg", "isPublic" => true, "path" => "/neu"}
      }
    }
  end
  
  test "returns error when trying to move a public file as non-admin", %{public_file: public_file, user2_jwt: user2_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user2_jwt}")
    |> post("/api", query: @query, variables: %{id: public_file.id, path: "/neu"})
    |> json_response(200)

    assert res == %{
      "data" => %{"moveFile" => nil},
      "errors" => [
        %{"locations" => [%{"column" => 0, "line" => 2}], "message" => "Du darfst diese Datei nicht verschieben.", "path" => ["moveFile"]}
      ]
    }
  end

  test "make a file public as admin", %{admin_file: admin_file, admin_jwt: admin_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> post("/api", query: @query, variables: %{id: admin_file.id, isPublic: true})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "moveFile" => %{"filename" => "ich_schoen.jpg", "isPublic" => true, "path" => "/avatar"}
      }
    }
  end
  
  test "make a file non-public as admin", %{user2_file: user2_file, user2_jwt: user2_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user2_jwt}")
    |> post("/api", query: @query, variables: %{id: user2_file.id, isPublic: false})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "moveFile" => %{"filename" => "wieartig1.jpg", "isPublic" => false, "path" => "/avatar"}
      }
    }
  end
  
  test "returns error when trying to make a file public as non-admin", %{public_file: public_file, user2_jwt: user2_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user2_jwt}")
    |> post("/api", query: @query, variables: %{id: public_file.id, path: "/neu", isPublic: true})
    |> json_response(200)

    assert res == %{
      "data" => %{"moveFile" => nil},
      "errors" => [
        %{"locations" => [%{"column" => 0, "line" => 2}], "message" => "Du darfst diese Datei nicht verschieben.", "path" => ["moveFile"]}
      ]
    }
  end

  describe "delete file mutation" do
    @query """
    mutation deleteFile($id: ID!) {
      deleteFile(id: $id) {
        path
        filename
        isPublic
      }
    }
    """
    test "delete a user's own file", %{user2_file: user2_file, user2_jwt: user2_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user2_jwt}")
      |> post("/api", query: @query, variables: %{id: user2_file.id})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "deleteFile" => %{"filename" => "wieartig1.jpg", "isPublic" => false, "path" => "/avatar"}
        }
      }
    end

    test "returns error when user is not owner of file", %{user2_file: user2_file, admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: user2_file.id})
      |> json_response(200)

      assert res == %{
        "data" => %{"deleteFile" => nil},
        "errors" => [
          %{"locations" => [%{"column" => 0, "line" => 2}], "message" => "Du darfst diese Datei nicht löschen.", "path" => ["deleteFile"]}
        ]
      }
    end
    
    test "returns error when file does not exist", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{id: 0})
      |> json_response(200)

      assert res == %{
        "data" => %{"deleteFile" => nil},
        "errors" => [
          %{"locations" => [%{"column" => 0, "line" => 2}], "message" => "Datei mit der id 0 nicht gefunden.", "path" => ["deleteFile"]}
        ]
      }
    end
  end

  test "deletes a public file as admin", %{public_file: public_file, admin_jwt: admin_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{admin_jwt}")
    |> post("/api", query: @query, variables: %{id: public_file.id})
    |> json_response(200)

    assert res == %{
      "data" => %{
        "deleteFile" => %{"filename" => "logo1.jpg", "isPublic" => true, "path" => "/logos"}
      }
    }
  end
  
  test "returns error when trying to delete a public file as non-admin", %{public_file: public_file, user2_jwt: user2_jwt} do
    res = build_conn()
    |> put_req_header("tenant", "slug:web")
    |> put_req_header("authorization", "Bearer #{user2_jwt}")
    |> post("/api", query: @query, variables: %{id: public_file.id})
    |> json_response(200)

    assert res == %{
      "data" => %{"deleteFile" => nil},
      "errors" => [
        %{"locations" => [%{"column" => 0, "line" => 2}], "message" => "Du darfst diese Datei nicht löschen.", "path" => ["deleteFile"]}
      ]
    }
  end

  
  describe "move directory mutation" do
    @query """
    mutation moveDirectory($path: String!, $isPublic: Boolean!, $newPath: String!) {
      moveDirectory(path: $path, isPublic: $isPublic, newPath: $newPath) {
        path
        filename
        isPublic
      }
    }
    """
    test "move a user's own directory", %{user2_jwt: user2_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user2_jwt}")
      |> post("/api", query: @query, variables: %{path: "/podcast", isPublic: false, newPath: "/new-podcast"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "moveDirectory" => [
            %{"filename" => "pocst7.m4v", "isPublic" => false, "path" => "/new-podcast"},
            %{"filename" => "podcast5.mp4", "isPublic" => false, "path" => "/new-podcast"},
            %{"filename" => "podcast6.mov", "isPublic" => false, "path" => "/new-podcast"},
          ]
        }
      }
    end

    test "returns empty array if no files are found for user", %{user2_jwt: user2_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user2_jwt}")
      |> post("/api", query: @query, variables: %{path: "/logos", isPublic: false, newPath: "/new-logos"})
      |> json_response(200)

      assert res == %{
        "data" => %{"moveDirectory" => []}
      }
    end

    test "move public directory if admin", %{admin_jwt: admin_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{admin_jwt}")
      |> post("/api", query: @query, variables: %{path: "/logos", isPublic: true, newPath: "/new-logos"})
      |> json_response(200)

      assert res == %{
        "data" => %{
          "moveDirectory" => [
            %{"filename" => "logo1.jpg", "isPublic" => true, "path" => "/new-logos"},
            %{"filename" => "logo2.jpg", "isPublic" => true, "path" => "/new-logos"},
            %{"filename" => "logo3.png", "isPublic" => true, "path" => "/new-logos"},
            %{"filename" => "logo4.png", "isPublic" => true, "path" => "/new-logos"},
            %{"filename" => "chamaeleon.png", "isPublic" => true, "path" => "/new-logos/chamaeleon"},
            %{"filename" => "podcast1.png", "isPublic" => true, "path" => "/new-logos/podcast"},
            %{"filename" => "podcast2.png", "isPublic" => true, "path" => "/new-logos/podcast"}
          ]
        }
      }
    end

    test "returns error if non-admin tries to move public files", %{user2_jwt: user2_jwt} do
      res = build_conn()
      |> put_req_header("tenant", "slug:web")
      |> put_req_header("authorization", "Bearer #{user2_jwt}")
      |> post("/api", query: @query, variables: %{path: "/logos", isPublic: true, newPath: "/new-logos"})
      |> json_response(200)

      assert res == %{
        "data" => %{"moveDirectory" => nil},
        "errors" => [
          %{"locations" => [%{"column" => 0, "line" => 2}], "message" => "Du darfst diesen Ordner nicht verschieben.", "path" => ["moveDirectory"]}
        ]
      }
    end
  end
end
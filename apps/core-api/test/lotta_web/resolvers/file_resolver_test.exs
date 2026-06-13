defmodule LottaWeb.FileResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase
  use Lotta.WorkerCase

  import Mox
  import Ecto.Query
  import Lotta.Factory

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Storage, Tenants}
  alias Lotta.Accounts.User
  alias Lotta.Worker.Conversion
  alias Lotta.Storage.{FileConversion, Directory}

  @prefix "tenant_test"

  setup :verify_on_exit!

  setup do
    Repo.put_prefix(@prefix)
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    admin =
      Repo.one!(
        from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: @prefix
      )

    user2 =
      insert(:user,
        email: "eike.wiewiorra@lotta.schule",
        name: "Eike Wiewiorra",
        nickname: "Chef"
      )

    user = insert(:user, email: "billy@lotta.schule", name: "Christopher Bill", nickname: "Billy")

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)
    {:ok, user2_jwt, _} = AccessToken.encode_and_sign(user2)
    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    # Directories
    user2_avatar_dir = insert(:directory, name: "avatar", user_id: user2.id)
    user2_directory = insert(:directory, name: "ehrenberg-on-air", user_id: user2.id)
    insert(:directory, name: "podcast", user_id: user2.id)
    admin_logos_dir = insert(:directory, name: "logos", user_id: admin.id)
    admin_podcast_dir = insert(:directory, name: "podcast", user_id: admin.id)
    public_directory = insert(:directory, name: "logos")

    # Admin file (ich_schoen.jpg) with remote storage; set as admin avatar
    admin_file =
      insert(:file,
        user_id: admin.id,
        filename: "ich_schoen.jpg",
        file_type: "image",
        mime_type: "image/jpg",
        parent_directory_id: admin_logos_dir.id
      )
      |> with_remote_storage("test/support/fixtures/image_file.png")

    admin
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_change(:avatar_image_file_id, admin_file.id)
    |> Repo.update!(prefix: @prefix)

    # User2 file (wieartig1.jpg) with remote storage
    user2_file =
      insert(:file,
        user_id: user2.id,
        filename: "wieartig1.jpg",
        file_type: "image",
        mime_type: "image/jpg",
        parent_directory_id: user2_avatar_dir.id
      )
      |> with_remote_storage("test/support/fixtures/image_file.png")

    # Public logos directory files
    public_file =
      insert(:file,
        user_id: admin.id,
        filename: "logo1.jpg",
        file_type: "image",
        mime_type: "image/jpg",
        parent_directory_id: public_directory.id
      )

    insert(:file,
      user_id: admin.id,
      filename: "logo2.jpg",
      file_type: "image",
      mime_type: "image/jpg",
      parent_directory_id: public_directory.id
    )

    insert(:file,
      user_id: admin.id,
      filename: "logo3.png",
      file_type: "image",
      mime_type: "image/png",
      parent_directory_id: public_directory.id
    )

    insert(:file,
      user_id: admin.id,
      filename: "logo4.png",
      file_type: "image",
      mime_type: "image/png",
      parent_directory_id: public_directory.id
    )

    # Admin podcast directory files
    insert(:file,
      user_id: admin.id,
      filename: "pc3.m4v",
      file_type: "video",
      mime_type: "video/m4v",
      parent_directory_id: admin_podcast_dir.id
    )

    insert(:file,
      user_id: admin.id,
      filename: "podcast1.mp4",
      file_type: "video",
      mime_type: "video/mp4",
      parent_directory_id: admin_podcast_dir.id
    )

    insert(:file,
      user_id: admin.id,
      filename: "podcast2.mov",
      file_type: "video",
      mime_type: "video/mov",
      parent_directory_id: admin_podcast_dir.id
    )

    # Articles referencing user2_file for usage tests (with seeder-matching timestamps)
    insert(:article,
      preview_image_file_id: user2_file.id,
      title: "And the oskar goes to ...",
      updated_at: ~U[2019-09-01 10:08:00Z]
    )

    insert(:article,
      preview_image_file_id: user2_file.id,
      title: "Draft1",
      updated_at: ~U[2019-09-01 10:00:00Z]
    )

    insert(:article,
      preview_image_file_id: user2_file.id,
      title: "Draft2",
      updated_at: ~U[2019-09-01 10:05:00Z]
    )

    insert(:article,
      preview_image_file_id: user2_file.id,
      title: "Fertiger Artikel zum Konzert",
      updated_at: ~U[2019-09-01 10:06:00Z]
    )

    # Categories referencing public_file for usage tests
    insert(:category, banner_image_file_id: public_file.id, title: "Fächer")
    insert(:category, banner_image_file_id: public_file.id, title: "GTA")
    insert(:category, banner_image_file_id: public_file.id, title: "Profil")
    insert(:category, banner_image_file_id: public_file.id, title: "Projekt")

    image_upload = %Plug.Upload{
      path: "test/support/fixtures/image_file.png",
      filename: "image_file.png"
    }

    {:ok,
     %{
       admin_account: admin,
       admin_jwt: admin_jwt,
       user2_account: user2,
       user2_jwt: user2_jwt,
       user_account: user,
       user_jwt: user_jwt,
       admin_file: admin_file,
       user2_directory: user2_directory,
       user2_file: user2_file,
       public_directory: public_directory,
       public_file: public_file,
       image_upload: image_upload,
       tenant: tenant
     }}
  end

  describe "resolve available formats" do
    @query """
      query getFileFormats($id: ID, $category: String) {
        file(id: $id) {
          filename
          formats(category: $category) {
            name
            type
            mimeType
            url
            availability {
              status
            }
          }
        }
      }
    """

    test "returns file with correct immediatly available files for images", %{
      admin_account: admin_account,
      admin_file: admin_file
    } do
      res =
        build_tenant_conn()
        |> authorize(admin_account)
        |> get("/api", query: @query, variables: %{id: admin_file.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "ich_schoen.jpg",
                   "formats" => formats
                 }
               }
             } = res

      assert Enum.count(formats) == 30

      assert Enum.all?(formats, fn format ->
               format["type"] == "IMAGE" and
                 format["availability"]["status"] == "AVAILABLE" and
                 not (is_nil(format["url"]) or format["url"] == "")
             end)
    end

    test "filter by category on request", %{
      admin_account: admin_account,
      admin_file: admin_file
    } do
      res =
        build_tenant_conn()
        |> authorize(admin_account)
        |> get("/api", query: @query, variables: %{id: admin_file.id, category: "banner"})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "ich_schoen.jpg",
                   "formats" => formats
                 }
               }
             } = res

      assert Enum.count(formats) == 4

      assert Enum.all?(formats, fn format ->
               format["type"] == "IMAGE" and
                 format["availability"]["status"] == "AVAILABLE" and
                 String.starts_with?(format["name"], "BANNER_")
             end)
    end

    test "returns file as READY when they have already been transcoded", %{
      admin_account: admin_account,
      admin_file: admin_file
    } do
      Tesla.Mock.mock(fn %{method: :get} ->
        %Tesla.Env{
          status: 200,
          body: create_file_stream("test/support/fixtures/ich_schoen.jpg")
        }
      end)

      assert {:ok, %FileConversion{}} =
               Storage.get_file_conversion(admin_file, "articlepreview_660")

      res =
        build_tenant_conn()
        |> authorize(admin_account)
        |> get("/api", query: @query, variables: %{id: admin_file.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "ich_schoen.jpg",
                   "formats" => formats
                 }
               }
             } = res

      assert Enum.count(formats) == 30

      ready_formats =
        Enum.filter(formats, fn format ->
          format["availability"]["status"] == "READY"
        end)

      assert Enum.count(ready_formats) == 5

      assert Enum.all?(ready_formats, fn format ->
               format["type"] == "IMAGE" and
                 String.starts_with?(format["name"], "ARTICLEPREVIEW_") and
                 not (is_nil(format["url"]) or format["url"] == "")
             end)
    end

    test "returns file with correct immediatly available files for audios", %{
      user2_account: user
    } do
      file = real_audio_file(user)

      res =
        build_tenant_conn()
        |> authorize(user)
        |> get("/api", query: @query, variables: %{id: file.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "some_filename",
                   "formats" => formats
                 }
               }
             } = res

      assert Enum.count(formats) == 5

      image_formats =
        Enum.filter(formats, &(&1["type"] == "IMAGE"))

      assert Enum.all?(image_formats, fn format ->
               format["availability"]["status"] == "AVAILABLE" and
                 not (is_nil(format["url"]) or format["url"] == "")
             end)

      assert Enum.count(image_formats) == 3

      audio_formats =
        Enum.filter(formats, &(&1["type"] == "AUDIO"))

      assert Enum.count(audio_formats) == 2

      assert Enum.all?(audio_formats, fn format ->
               format["availability"]["status"] == "REQUESTABLE" and
                 format["url"] == ""
             end)

      Tesla.Mock.mock(fn
        %{method: :get} ->
          %Tesla.Env{
            status: 200,
            body: create_file_stream("test/support/fixtures/eoa2.mp3")
          }
      end)

      Application.put_env(:lotta, :exile_module, Lotta.ExileMock)
      on_exit(fn -> Application.delete_env(:lotta, :exile_module) end)

      stub(Lotta.ExileMock, :stream!, fn _cmd, _opts ->
        create_file_stream("test/support/fixtures/eoa2.mp3")
        |> Stream.map(&{:stdout, &1})
      end)

      {:ok, job} =
        Conversion.get_or_create_conversion_job(
          file,
          "audioplay"
        )

      assert job.state == "completed"
      Application.delete_env(:lotta, :exile_module)

      res =
        build_tenant_conn()
        |> authorize(user)
        |> get("/api", query: @query, variables: %{id: file.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "some_filename",
                   "formats" => formats
                 }
               }
             } = res

      assert Enum.count(formats) == 5

      audio_formats =
        Enum.filter(formats, &(&1["type"] == "AUDIO"))

      assert Enum.count(audio_formats) == 2

      assert Enum.all?(audio_formats, fn format ->
               format["availability"]["status"] == "READY" and
                 format["url"] != ""
             end)
    end

    test "returns file with correct immediatly available files for videos", %{
      user2_account: user
    } do
      file = real_video_file(user)

      res =
        build_tenant_conn()
        |> authorize(user)
        |> get("/api", query: @query, variables: %{id: file.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "some_filename",
                   "formats" => formats
                 }
               }
             } = res

      assert Enum.count(formats) == 10

      image_formats =
        Enum.filter(formats, &(&1["type"] == "IMAGE"))

      assert Enum.all?(image_formats, fn format ->
               format["availability"]["status"] == "AVAILABLE" and
                 not (is_nil(format["url"]) or format["url"] == "")
             end)

      assert Enum.count(image_formats) == 4

      video_formats =
        Enum.filter(formats, &(&1["type"] == "VIDEO"))

      assert Enum.count(video_formats) == 6

      assert Enum.all?(video_formats, fn format ->
               format["availability"]["status"] == "REQUESTABLE" and
                 format["url"] == ""
             end)

      Tesla.Mock.mock(fn
        %{method: :get} ->
          %Tesla.Env{
            status: 200,
            body: create_file_stream("test/support/fixtures/pc3.m4v")
          }
      end)

      Application.put_env(:lotta, :exile_module, Lotta.ExileMock)
      on_exit(fn -> Application.delete_env(:lotta, :exile_module) end)

      stub(Lotta.ExileMock, :stream!, fn _cmd, _opts ->
        create_file_stream("test/support/fixtures/pc3.m4v")
        |> Stream.map(&{:stdout, &1})
      end)

      {:ok, job} =
        Conversion.get_or_create_conversion_job(
          file,
          "videoplay"
        )

      assert job.state == "completed"
      Application.delete_env(:lotta, :exile_module)

      res =
        build_tenant_conn()
        |> authorize(user)
        |> get("/api", query: @query, variables: %{id: file.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "some_filename",
                   "formats" => formats
                 }
               }
             } = res

      assert Enum.count(formats) == 10

      video_formats =
        Enum.filter(formats, &(&1["type"] == "VIDEO"))

      assert Enum.count(video_formats) == 6

      assert Enum.all?(video_formats, fn format ->
               format["availability"]["status"] == "READY" and
                 format["url"] != ""
             end)
    end
  end

  describe "file query" do
    @query """
    query getFile($id: ID) {
      file(id: $id) {
        filename
        user {
          nickname
          name
        }
        parentDirectory {
          name
        }
      }
    }
    """

    test "returns own file for own directory of admin user", %{
      admin_jwt: admin_jwt,
      admin_file: admin_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: admin_file.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "file" => %{
                   "filename" => "ich_schoen.jpg",
                   "user" => %{
                     "name" => "Alexis Rinaldoni",
                     "nickname" => "Der Meister"
                   },
                   "parentDirectory" => %{"name" => "logos"}
                 }
               }
             }
    end

    test "returns public file for public directory of admin user", %{
      admin_jwt: admin_jwt,
      public_file: public_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: public_file.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "file" => %{
                   "filename" => "logo1.jpg",
                   "user" => %{
                     "name" => "Alexis Rinaldoni",
                     "nickname" => "Der Meister"
                   },
                   "parentDirectory" => %{
                     "name" => "logos"
                   }
                 }
               }
             }
    end

    test "returns public file for public directory for non admin user", %{
      user_jwt: user_jwt,
      public_file: public_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: public_file.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "file" => %{
                   "filename" => "logo1.jpg",
                   "user" => %{
                     # full name not given to other users
                     "name" => "Alexis Rinaldoni",
                     "nickname" => "Der Meister"
                   },
                   "parentDirectory" => %{
                     "name" => "logos"
                   }
                 }
               }
             }
    end

    test "returns error when user is not owner of private directory and user is not admin", %{
      user_jwt: user_jwt,
      user2_file: user2_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_file.id})
        |> json_response(200)

      assert %{
               "data" => %{"file" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diese Datei zu lesen.",
                   "path" => ["file"]
                 }
               ]
             } = res
    end

    test "returns error when user is not owner of private directory and user is admin", %{
      admin_jwt: admin_jwt,
      user2_file: user2_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_file.id})
        |> json_response(200)

      assert %{
               "data" => %{"file" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diese Datei zu lesen.",
                   "path" => ["file"]
                 }
               ]
             } = res
    end
  end

  describe "resolve file usage" do
    @query """
    query getFileUsage($id: ID) {
      file(id: $id) {
        filename
        usage {
          ... on FileCategoryUsageLocation {
            usage
            category {
              title
            }
          }
          ... on FileArticleUsageLocation {
            usage
            article {
              title
              previewImageFile {
                remoteLocation
              }
            }
          }
          ... on FileContentModuleUsageLocation {
            usage
            article {
              title
              previewImageFile {
                remoteLocation
              }
            }
          }
          ... on FileUserUsageLocation {
            usage
            user {
              name
              nickname
              avatarImageFile {
                remoteLocation
              }
            }
          }
          ... on FileSystemUsageLocation {
            usage
          }
        }
      }
    }
    """

    test "returns own file's usage for admin user", %{
      admin_jwt: admin_jwt,
      admin_file: admin_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: admin_file.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "ich_schoen.jpg",
                   "usage" => [
                     %{
                       "usage" => "avatar",
                       "user" => %{
                         "avatarImageFile" => %{"remoteLocation" => remote_location},
                         "name" => "Alexis Rinaldoni",
                         "nickname" => "Der Meister"
                       }
                     }
                   ]
                 }
               }
             } = res

      assert is_binary(remote_location)
    end

    test "returns own file's usage for non-admin user", %{
      user2_jwt: user2_jwt,
      user2_file: user2_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query, variables: %{id: user2_file.id})
        |> json_response(200)

      assert %{"data" => %{"file" => %{"filename" => "wieartig1.jpg", "usage" => usage}}} = res
      assert length(usage) == 4
      assert Enum.all?(usage, &(&1["usage"] == "preview"))

      assert Enum.all?(usage, fn %{
                                   "article" => %{
                                     "previewImageFile" => %{"remoteLocation" => loc}
                                   }
                                 } ->
               is_binary(loc)
             end)

      titles = usage |> Enum.map(& &1["article"]["title"]) |> MapSet.new()

      assert titles ==
               MapSet.new([
                 "And the oskar goes to ...",
                 "Fertiger Artikel zum Konzert",
                 "Draft2",
                 "Draft1"
               ])
    end

    test "returns public file's usage for admin user", %{
      admin_jwt: admin_jwt,
      public_file: public_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: public_file.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "file" => %{
                   "filename" => "logo1.jpg",
                   "usage" => usage
                 }
               }
             } = res

      assert Enum.any?(usage, fn %{"category" => %{"title" => title}, "usage" => usage} ->
               title == "Fächer" && usage == "banner"
             end)

      assert Enum.any?(usage, fn %{"category" => %{"title" => title}, "usage" => usage} ->
               title == "GTA" && usage == "banner"
             end)

      assert Enum.any?(usage, fn %{"category" => %{"title" => title}, "usage" => usage} ->
               title == "Profil" && usage == "banner"
             end)

      assert Enum.any?(usage, fn %{"category" => %{"title" => title}, "usage" => usage} ->
               title == "Projekt" && usage == "banner"
             end)
    end

    test "returns public file's usage for non-admin user", %{
      user2_jwt: user2_jwt,
      public_file: public_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> get("/api", query: @query, variables: %{id: public_file.id})
        |> json_response(200)

      assert %{"data" => %{"file" => %{"filename" => "logo1.jpg", "usage" => usage}}} = res
      assert length(usage) == 4
      assert Enum.all?(usage, &(&1["usage"] == "banner"))
      titles = usage |> Enum.map(& &1["category"]["title"]) |> MapSet.new()
      assert titles == MapSet.new(["Fächer", "GTA", "Profil", "Projekt"])
    end
  end

  describe "files query" do
    @query """
    query getDirectoriesAndFiles($parentDirectoryId: ID) {
      files(parentDirectoryId: $parentDirectoryId) {
        filename
        userId
        parentDirectory {
          name
        }
        path {
          name
        }
      }
    }
    """

    test "returns own files for own directory of admin user", %{
      admin_jwt: admin_jwt,
      admin_account: admin_account,
      tenant: t
    } do
      admin_dir =
        Lotta.Repo.one!(
          from(d in Directory, where: d.name == ^"podcast" and d.user_id == ^admin_account.id),
          prefix: t.prefix
        )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{parentDirectoryId: admin_dir.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "files" => [
                   %{
                     "filename" => "pc3.m4v",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "podcast"},
                     "path" => [%{"name" => "podcast"}]
                   },
                   %{
                     "filename" => "podcast1.mp4",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "podcast"},
                     "path" => [%{"name" => "podcast"}]
                   },
                   %{
                     "filename" => "podcast2.mov",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "podcast"},
                     "path" => [%{"name" => "podcast"}]
                   }
                 ]
               }
             }
    end

    test "returns public files for public directory of admin user", %{
      admin_jwt: admin_jwt,
      admin_account: admin_account,
      public_directory: public_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{parentDirectoryId: public_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "files" => [
                   %{
                     "filename" => "logo1.jpg",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "logos"},
                     "path" => [%{"name" => "logos"}]
                   },
                   %{
                     "filename" => "logo2.jpg",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "logos"},
                     "path" => [%{"name" => "logos"}]
                   },
                   %{
                     "filename" => "logo3.png",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "logos"},
                     "path" => [%{"name" => "logos"}]
                   },
                   %{
                     "filename" => "logo4.png",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "logos"},
                     "path" => [%{"name" => "logos"}]
                   }
                 ]
               }
             }
    end

    test "returns public files for public directory for non admin user", %{
      user_jwt: user_jwt,
      admin_account: admin_account,
      public_directory: public_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{parentDirectoryId: public_directory.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "files" => [
                   %{
                     "filename" => "logo1.jpg",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "logos"},
                     "path" => [%{"name" => "logos"}]
                   },
                   %{
                     "filename" => "logo2.jpg",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "logos"},
                     "path" => [%{"name" => "logos"}]
                   },
                   %{
                     "filename" => "logo3.png",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "logos"},
                     "path" => [%{"name" => "logos"}]
                   },
                   %{
                     "filename" => "logo4.png",
                     "userId" => Integer.to_string(admin_account.id),
                     "parentDirectory" => %{"name" => "logos"},
                     "path" => [%{"name" => "logos"}]
                   }
                 ]
               }
             }
    end

    test "returns error when user is not owner of private directory and user is not admin", %{
      user_jwt: user_jwt,
      user2_account: user2_account,
      tenant: t
    } do
      user2_directory =
        Repo.one!(
          from(d in Directory,
            where: d.name == ^"avatar" and d.user_id == ^user2_account.id
          ),
          prefix: t.prefix
        )

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
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu lesen.",
                   "path" => ["files"]
                 }
               ]
             } = res
    end

    test "returns error when user is not owner of private directory and user is admin", %{
      admin_jwt: admin_jwt,
      user2_account: user2_account,
      tenant: t
    } do
      user2_directory =
        Repo.one!(
          from(d in Directory,
            where: d.name == ^"avatar" and d.user_id == ^user2_account.id
          ),
          prefix: t.prefix
        )

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
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu lesen.",
                   "path" => ["files"]
                 }
               ]
             } = res
    end
  end

  describe "relevant files in usage query" do
    @query """
    query relevantFilesInUsage {
      relevantFilesInUsage {
        filename
      }
    }
    """

    test "it should return an error when user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{"relevantFilesInUsage" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["relevantFilesInUsage"]
                 }
               ]
             } = res
    end

    test "it should return the user's relevant files in usage", %{user2_jwt: user2_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "relevantFilesInUsage" => [%{"filename" => "wieartig1.jpg"}]
               }
             } = res
    end
  end

  describe "update file mutation" do
    @query """
    mutation updateFile($id: ID!, $parentDirectoryId: ID, $filename: String) {
      updateFile(id: $id, parentDirectoryId: $parentDirectoryId, filename: $filename) {
        filename
        parentDirectory {
          name
        }
      }
    }
    """
    test "move a user's own file to own directory", %{
      user2_file: user2_file,
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
          variables: %{id: user2_file.id, parentDirectoryId: target_dir.id}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateFile" => %{
                   "filename" => "wieartig1.jpg",
                   "parentDirectory" => %{"name" => "podcast"}
                 }
               }
             }
    end

    test "returns error when user is not owner of private source directory and user is not admin",
         %{user2_file: user2_file, user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_file.id, filename: "newfilename.file"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateFile" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diese Datei zu bearbeiten.",
                   "path" => ["updateFile"]
                 }
               ]
             } = res
    end

    test "returns error when user is not owner of private source directory and user is admin", %{
      user2_file: user2_file,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_file.id, filename: "newfilename.file"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateFile" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diese Datei zu bearbeiten.",
                   "path" => ["updateFile"]
                 }
               ]
             } = res
    end

    test "returns error when file does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: "00000000-0000-0000-0000-000000000000", filename: "neuername.test"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateFile" => nil},
               "errors" => [
                 %{
                   "message" =>
                     "Die Datei mit der id 00000000-0000-0000-0000-000000000000 wurde nicht gefunden.",
                   "path" => ["updateFile"]
                 }
               ]
             } = res
    end

    test "move a file in public directory as admin", %{
      public_file: public_file,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: public_file.id, filename: "newfilename.jpg"}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateFile" => %{
                   "filename" => "newfilename.jpg",
                   "parentDirectory" => %{"name" => "logos"}
                 }
               }
             }
    end

    test "returns error when trying to move a file from public directory as non-admin", %{
      public_file: public_file,
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
          variables: %{id: public_file.id, parentDirectoryId: target_dir.id}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateFile" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diese Datei zu bearbeiten.",
                   "path" => ["updateFile"]
                 }
               ]
             } = res
    end

    test "returns error when trying to move a file to public directory as non-admin", %{
      user2_file: user2_file,
      user2_jwt: user2_jwt,
      public_directory: public_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: user2_file.id, parentDirectoryId: public_directory.id}
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateFile" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diese Datei zu bearbeiten.",
                   "path" => ["updateFile"]
                 }
               ]
             } = res
    end
  end

  describe "upload file mutation" do
    @mutation """
    mutation uploadFile($file: Upload!, $parentDirectoryId: ID!) {
      uploadFile(file: $file, parentDirectoryId: $parentDirectoryId) {
        filename
      }
    }
    """
    test "should upload a file to own directory", %{
      image_upload: image_upload,
      user2_directory: user2_directory,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{file: "file", parentDirectoryId: user2_directory.id},
          file: image_upload
        )
        |> json_response(200)

      assert %{"filename" => "image_file.png"} = res["data"]["uploadFile"]
    end

    test "admin should upload a file to public directory", %{
      image_upload: image_upload,
      public_directory: public_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{file: "file", parentDirectoryId: public_directory.id},
          file: image_upload
        )
        |> json_response(200)

      assert %{"filename" => "image_file.png"} = res["data"]["uploadFile"]
    end

    test "should return an error when user has reached quota", %{
      image_upload: image_upload,
      user2_directory: user2_directory,
      user2_jwt: user2_jwt,
      tenant: t
    } do
      Tenants.update_tenant(
        t,
        %{
          configuration: Map.put(t.configuration, :user_max_storage_config, "0")
        }
      )

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{file: "file", parentDirectoryId: user2_directory.id},
          file: image_upload
        )
        |> json_response(200)

      refute res["data"]["uploadFile"]

      assert res["errors"] == [
               %{
                 "locations" => [%{"column" => 3, "line" => 2}],
                 "message" => "not_enough_space",
                 "path" => ["uploadFile"]
               }
             ]
    end

    test "should return an error when directtory does not exist", %{
      image_upload: image_upload,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{file: "file", parentDirectoryId: "00000000-0000-0000-0000-000000000000"},
          file: image_upload
        )
        |> json_response(200)

      refute res["data"]["uploadFile"]

      assert res["errors"] == [
               %{
                 "locations" => [%{"column" => 3, "line" => 2}],
                 "message" =>
                   "Der Ordner mit der id 00000000-0000-0000-0000-000000000000 wurde nicht gefunden.",
                 "path" => ["uploadFile"]
               }
             ]
    end

    test "should return an error when user wants to upload to public directory", %{
      image_upload: image_upload,
      public_directory: public_directory,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{file: "file", parentDirectoryId: public_directory.id},
          file: image_upload
        )
        |> json_response(200)

      refute res["data"]["uploadFile"]

      assert res["errors"] == [
               %{
                 "locations" => [%{"column" => 3, "line" => 2}],
                 "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                 "path" => ["uploadFile"]
               }
             ]
    end

    test "should return error when user is not logged in", %{
      image_upload: image_upload,
      user2_directory: user2_directory
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @mutation,
          variables: %{file: "file", parentDirectoryId: user2_directory.id},
          file: image_upload
        )
        |> json_response(200)

      refute res["data"]["uploadFile"]

      assert res["errors"] == [
               %{
                 "locations" => [%{"column" => 3, "line" => 2}],
                 "message" => "Du musst angemeldet sein um das zu tun.",
                 "path" => ["uploadFile"]
               }
             ]
    end

    test "should return an error when user wants to upload to other user's directory", %{
      image_upload: image_upload,
      user2_directory: user2_directory,
      user_jwt: user_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{file: "file", parentDirectoryId: user2_directory.id},
          file: image_upload
        )
        |> json_response(200)

      refute res["data"]["uploadFile"]

      assert res["errors"] == [
               %{
                 "locations" => [%{"column" => 3, "line" => 2}],
                 "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                 "path" => ["uploadFile"]
               }
             ]
    end

    test "should return an error when admin wants to upload to other user's directory", %{
      image_upload: image_upload,
      user2_directory: user2_directory,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{file: "file", parentDirectoryId: user2_directory.id},
          file: image_upload
        )
        |> json_response(200)

      refute res["data"]["uploadFile"]

      assert res["errors"] == [
               %{
                 "locations" => [%{"column" => 3, "line" => 2}],
                 "message" => "Du hast nicht die Rechte, diesen Ordner zu beschreiben.",
                 "path" => ["uploadFile"]
               }
             ]
    end
  end

  describe "delete file mutation" do
    @mutation """
    mutation deleteFile($id: ID!) {
      deleteFile(id: $id) {
        filename
      }
    }
    """
    test "delete a user's own file", %{user2_file: user2_file, user2_jwt: user2_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @mutation, variables: %{id: user2_file.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteFile" => %{"filename" => "wieartig1.jpg"}
               }
             }
    end

    test "returns error when user is not owner of file", %{
      user2_file: user2_file,
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @mutation, variables: %{id: user2_file.id})
        |> json_response(200)

      assert %{
               "data" => %{"deleteFile" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu bearbeiten.",
                   "path" => ["deleteFile"]
                 }
               ]
             } = res
    end

    test "returns error when file does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @mutation,
          variables: %{id: "00000000-0000-0000-0000-000000000000"}
        )
        |> json_response(200)

      assert %{
               "data" => %{"deleteFile" => nil},
               "errors" => [
                 %{
                   "message" =>
                     "Datei mit der id 00000000-0000-0000-0000-000000000000 nicht gefunden.",
                   "path" => ["deleteFile"]
                 }
               ]
             } = res
    end

    test "deletes a public file as admin", %{public_file: public_file, admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @mutation, variables: %{id: public_file.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteFile" => %{"filename" => "logo1.jpg"}
               }
             }
    end

    test "returns error when trying to delete a public file as non-admin", %{
      public_file: public_file,
      user2_jwt: user2_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api", query: @mutation, variables: %{id: public_file.id})
        |> json_response(200)

      assert %{
               "data" => %{"deleteFile" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diesen Ordner zu bearbeiten.",
                   "path" => ["deleteFile"]
                 }
               ]
             } = res
    end
  end

  describe "request_conversion query" do
    @query """
    mutation requestFileConversion($id: ID!, $category: String!) {
      requestFileConversion(id: $id, category: $category)
    }
    """

    test "should start the conversion when the file has been requested", %{
      admin_jwt: admin_jwt,
      admin_file: admin_file
    } do
      with_testing_mode(:manual, fn ->
        res =
          build_conn()
          |> put_req_header("tenant", "slug:test")
          |> put_req_header("authorization", "Bearer #{admin_jwt}")
          |> post("/api", query: @query, variables: %{id: admin_file.id, category: "videoplay"})
          |> json_response(200)

        assert res == %{
                 "data" => %{"requestFileConversion" => true}
               }

        assert_enqueued(
          worker: Conversion,
          args: %{"file_id" => admin_file.id, "format_category" => "videoplay"}
        )
      end)
    end

    test "returns error when user is not owner of private directory and user is not admin", %{
      user_jwt: user_jwt,
      user2_file: user2_file
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: user2_file.id, category: "videoplay"})
        |> json_response(200)

      assert %{
               "data" => %{"requestFileConversion" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die Rechte, diese Datei zu lesen.",
                   "path" => ["requestFileConversion"]
                 }
               ]
             } = res
    end

    test "returns error when category is not valid", %{
      admin_account: admin_account,
      admin_file: admin_file
    } do
      res =
        build_tenant_conn()
        |> authorize(admin_account)
        |> post("/api", query: @query, variables: %{id: admin_file.id, category: "geheimattacke"})
        |> json_response(200)

      assert %{
               "data" => %{"requestFileConversion" => nil},
               "errors" => [
                 %{
                   "message" => "Ungültige Kategorie: geheimattacke",
                   "path" => ["requestFileConversion"]
                 }
               ]
             } = res
    end
  end
end

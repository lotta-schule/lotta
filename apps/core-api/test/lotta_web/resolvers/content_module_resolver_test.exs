defmodule LottaWeb.ContentModuleResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true
  use Bamboo.Test

  import Lotta.Factory

  alias LottaWeb.Auth.AccessToken

  alias Lotta.{Repo, Tenants, Accounts}
  alias Lotta.Content.ContentModule
  alias Lotta.Storage.FileData

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    admin_group = insert(:admin_group)
    {:ok, admin} = insert(:user) |> Accounts.update_user(%{groups: [admin_group]})

    user = insert(:user)

    admin_dir = insert(:directory, user_id: admin.id)
    admin_file = insert(:file, user_id: admin.id, parent_directory_id: admin_dir.id)

    article = insert(:article) |> with_users([user])

    test_formular =
      %ContentModule{
        article_id: article.id,
        type: "text",
        content: %{"value" => "Pizza Test-Formular"},
        configuration: %{
          "destination" => admin.email,
          "save_internally" => true,
          "elements" => [
            %{
              "descriptionText" => "Halli, hallo, wir sind da, du bist hier, dadub dadumm.",
              "element" => "input",
              "label" => "Name",
              "name" => "name",
              "required" => true,
              "type" => "text"
            },
            %{
              "descriptionText" =>
                "Falls du ein Gutschein hast, fotografier ihn und füge ihn hier an.",
              "element" => "file",
              "label" => "Coupon",
              "name" => "coupon",
              "required" => true,
              "maxSize" => 1_048_576
            },
            %{
              "descriptionText" => "",
              "element" => "selection",
              "label" => "PizzaGröße",
              "name" => "größe",
              "required" => true,
              "type" => "radio",
              "options" => [
                %{"label" => "klein (22cm Durchmesser)", "selected" => true, "value" => "klein"},
                %{"label" => "groß (28cm Durchmesser)", "selected" => false, "value" => "groß"},
                %{"label" => "Familienpizza (50x60cm)", "selected" => false, "value" => "familie"}
              ]
            },
            %{
              "descriptionText" => "",
              "element" => "selection",
              "label" => "Zutat",
              "name" => "feld3",
              "required" => true,
              "type" => "checkbox",
              "options" => [
                %{
                  "label" => "zusätzliche Peperoni",
                  "selected" => false,
                  "value" => "peperoni"
                },
                %{"label" => "Zusätzlicher Käse", "selected" => true, "value" => "käse"},
                %{"label" => "Pilze", "selected" => true, "value" => "pilze"},
                %{"label" => "Gorgonzola", "value" => "gorgonzola"},
                %{
                  "label" => "Ananas (Bestellung wird sofort verworfen)",
                  "value" => "ananas"
                }
              ]
            },
            %{
              "descriptionText" => "",
              "element" => "selection",
              "label" => "Bei Abholung 10% Rabat",
              "name" => "transport",
              "required" => true,
              "type" => "select",
              "options" => [
                %{"label" => "Abholung", "selected" => false, "value" => "abholung"},
                %{"label" => "Lieferung", "selected" => true, "value" => "lieferung"}
              ]
            },
            %{
              "element" => "input",
              "label" => "Weitere Informationen",
              "multiline" => true,
              "name" => "beschreibung",
              "type" => "text"
            }
          ]
        }
      }
      |> Repo.insert!(prefix: @prefix)

    test_formular
    |> Ecto.build_assoc(:results,
      result: %{
        "responses" => %{
          "beschreibung" => "",
          "feld3" => ["käse", "pilze"],
          "größe" => "klein",
          "name" => "Test",
          "transport" => "lieferung"
        }
      }
    )
    |> Repo.insert!(prefix: @prefix)

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)
    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    {:ok,
     %{
       test_formular: test_formular,
       admin: admin,
       admin_jwt: admin_jwt,
       admin_email: admin.email,
       admin_file: admin_file,
       user: user,
       user_jwt: user_jwt,
       tenant: tenant
     }}
  end

  describe "send_form_response mutation" do
    @query """
    mutation SendFormResponse($id: ID!, $response: Json!) {
      sendFormResponse(contentModuleId: $id, response: $response)
    }
    """
    test "sends form response and saves correct result to database", %{
      test_formular: test_formular
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            id: test_formular.id,
            response: "{
          \"name\": \"Test\",
          \"größe\": \"klein\",
          \"feld3\": [\"käse\",\"pilze\"],
          \"transport\": \"lieferung\",
          \"beschreibung\": \"\"
        }"
          }
        )
        |> json_response(200)

      assert res == %{"data" => %{"sendFormResponse" => true}}

      results =
        test_formular
        |> Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      assert List.last(results).content_module_id == test_formular.id

      assert List.last(results).result == %{
               "responses" => %{
                 "beschreibung" => "",
                 "feld3" => ["käse", "pilze"],
                 "größe" => "klein",
                 "name" => "Test",
                 "transport" => "lieferung",
                 "coupon" => "(LEER)"
               }
             }
    end

    test "sends form response and sends them via mail", %{
      test_formular: test_formular
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            id: test_formular.id,
            response: "{
          \"name\": \"Test\",
          \"größe\": \"klein\",
          \"feld3\": [\"käse\",\"pilze\"],
          \"transport\": \"lieferung\",
          \"beschreibung\": \"\"
        }"
          }
        )
        |> json_response(200)

      assert res == %{"data" => %{"sendFormResponse" => true}}

      results =
        test_formular
        |> Repo.preload(:results)
        |> Map.fetch!(:results)
        |> List.last()

      mail =
        Lotta.Email.content_module_form_response_mail(test_formular, results.result["responses"])

      assert_delivered_email(mail)
    end

    test "sends form response and strips out unwanted fields", %{test_formular: test_formular} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            id: test_formular.id,
            response: "{
          \"name\": \"Test\",
          \"größe\": \"klein\",
          \"feld3\": [\"käse\",\"pilze\"],
          \"dieses_feld_existiert_nicht\": \"abcABC\",
          \"transport\": \"lieferung\",
          \"beschreibung\": \"\"
        }"
          }
        )
        |> json_response(200)

      assert res == %{"data" => %{"sendFormResponse" => true}}

      results =
        test_formular
        |> Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      assert List.last(results).content_module_id == test_formular.id

      assert List.last(results).result == %{
               "responses" => %{
                 "beschreibung" => "",
                 "feld3" => ["käse", "pilze"],
                 "größe" => "klein",
                 "name" => "Test",
                 "transport" => "lieferung",
                 "coupon" => "(LEER)"
               }
             }
    end

    test "sends an uploaded file in the email response and save its filename to database", %{
      test_formular: test_formular,
      admin_email: admin_email
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            id: test_formular.id,
            response: "{
          \"name\": \"Test\",
          \"größe\": \"klein\",
          \"feld3\": [\"käse\",\"pilze\"],
          \"dieses_feld_existiert_nicht\": \"abcABC\",
          \"transport\": \"lieferung\",
          \"beschreibung\": \"\",
          \"coupon\": \"file-upload://{\\\"filename\\\":\\\"coupon.png\\\",\\\"filesize\\\":114,\\\"filetype\\\":\\\"image/gif\\\",\\\"blob\\\":\\\"http://localhost:123\\\",\\\"data\\\":\\\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\\\"}\"
        }"
          }
        )
        |> json_response(200)

      assert res == %{"data" => %{"sendFormResponse" => true}}

      results =
        test_formular
        |> Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      newest_response = List.last(results)
      assert newest_response.content_module_id == test_formular.id

      assert newest_response.result == %{
               "responses" => %{
                 "beschreibung" => "",
                 "feld3" => ["käse", "pilze"],
                 "größe" => "klein",
                 "name" => "Test",
                 "transport" => "lieferung",
                 "coupon" => "coupon.png"
               }
             }

      assert_delivered_email_matches(%{
        to: [{_, ^admin_email}],
        text_body: text_body,
        html_body: html_body,
        attachments: [%{filename: "coupon.png"}]
      })

      assert text_body =~ "coupon: \"coupon.png\""
      assert html_body =~ "<li><strong>coupon</strong> &quot;coupon.png&quot;</li>"
    end

    test "sends lotta file and save its filename to database", %{
      test_formular: test_formular,
      admin: admin,
      admin_email: admin_email
    } do
      {:ok, file_data} = FileData.from_path("test/support/fixtures/secrets.zip")

      admin_real_file =
        insert(:file, user_id: admin.id)
        |> then(fn file ->
          path = Enum.join([@prefix, file.id, "original"], "/")
          {:ok, entity_data} = Lotta.Storage.RemoteStorage.create(file_data, path)

          file
          |> Repo.preload(:remote_storage_entity)
          |> Ecto.Changeset.change()
          |> Ecto.Changeset.put_assoc(:remote_storage_entity, entity_data)
          |> Repo.update!()
        end)

      filename = admin_real_file.filename

      res =
        build_tenant_conn()
        |> authorize(admin)
        |> post("/api",
          query: @query,
          variables: %{
            id: test_formular.id,
            response: "{
          \"name\": \"Test\",
          \"größe\": \"klein\",
          \"feld3\": [\"käse\",\"pilze\"],
          \"dieses_feld_existiert_nicht\": \"abcABC\",
          \"transport\": \"lieferung\",
          \"beschreibung\": \"\",
          \"coupon\": \"lotta-file-id://{\\\"filename\\\":\\\"#{filename}\\\",\\\"filesize\\\":#{admin_real_file.filesize},\\\"filetype\\\":\\\"#{admin_real_file.mime_type}\\\",\\\"id\\\":\\\"#{admin_real_file.id}\\\"}\"
        }"
          }
        )
        |> json_response(200)

      assert res == %{"data" => %{"sendFormResponse" => true}}

      results =
        test_formular
        |> Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      newest_response = List.last(results)
      assert newest_response.content_module_id == test_formular.id

      assert newest_response.result == %{
               "responses" => %{
                 "beschreibung" => "",
                 "feld3" => ["käse", "pilze"],
                 "größe" => "klein",
                 "name" => "Test",
                 "transport" => "lieferung",
                 "coupon" => filename
               }
             }

      assert_delivered_email_matches(%{
        to: [{_, ^admin_email}],
        text_body: text_body,
        html_body: html_body,
        attachments: [%{filename: ^filename}]
      })

      assert text_body =~ "coupon: \"#{filename}\""
      assert html_body =~ "<li><strong>coupon</strong> &quot;#{filename}&quot;</li>"
    end

    test "sends empty file value if user has no rights to access file", %{
      test_formular: test_formular,
      user_jwt: user_jwt,
      admin_file: admin_file,
      admin_email: admin_email
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: test_formular.id,
            response: "{
          \"name\": \"Test\",
          \"größe\": \"klein\",
          \"feld3\": [\"käse\",\"pilze\"],
          \"dieses_feld_existiert_nicht\": \"abcABC\",
          \"transport\": \"lieferung\",
          \"beschreibung\": \"\",
          \"coupon\": \"lotta-file-id://{\\\"filename\\\":\\\"#{admin_file.filename}\\\",\\\"filesize\\\":#{admin_file.filesize},\\\"filetype\\\":\\\"#{admin_file.mime_type}\\\",\\\"id\\\":\\\"#{admin_file.id}\\\"}\"
        }"
          }
        )
        |> json_response(200)

      assert res == %{"data" => %{"sendFormResponse" => true}}

      results =
        test_formular
        |> Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      newest_response = List.last(results)
      assert newest_response.content_module_id == test_formular.id

      assert newest_response.result == %{
               "responses" => %{
                 "beschreibung" => "",
                 "feld3" => ["käse", "pilze"],
                 "größe" => "klein",
                 "name" => "Test",
                 "transport" => "lieferung",
                 "coupon" => "(Datei nicht gültig)"
               }
             }

      assert_delivered_email_matches(%{
        to: [{_, ^admin_email}],
        text_body: text_body,
        html_body: html_body,
        attachments: []
      })

      assert text_body =~ "coupon: \"(Datei nicht gültig)\""
      assert html_body =~ "<li><strong>coupon</strong> &quot;(Datei nicht gültig)&quot;</li>"
    end

    test "sends form response and save sent user", %{
      admin_jwt: admin_jwt,
      test_formular: test_formular
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: test_formular.id,
            response: "{
          \"name\": \"Test\",
          \"größe\": \"klein\",
          \"feld3\": [\"käse\",\"pilze\"],
          \"dieses_feld_existiert_nicht\": \"abcABC\",
          \"transport\": \"lieferung\",
          \"beschreibung\": \"\"
        }"
          }
        )
        |> json_response(200)

      assert res == %{"data" => %{"sendFormResponse" => true}}

      results =
        test_formular
        |> Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      assert List.last(results).content_module_id == test_formular.id
    end
  end

  describe "get form responses" do
    @query """
    query ContentModuleResults($id: ID!) {
      contentModuleResults(contentModuleId: $id) {
        user {
          id
          name
          nickname
        }
        result
      }
    }
    """
    test "return a list of all results if user is admin", %{
      admin_jwt: admin_jwt,
      test_formular: test_formular
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{id: test_formular.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "contentModuleResults" => [
                   %{
                     "result" => %{
                       "responses" => %{
                         "beschreibung" => "",
                         "feld3" => ["käse", "pilze"],
                         "größe" => "klein",
                         "name" => "Test",
                         "transport" => "lieferung"
                       }
                     },
                     "user" => nil
                   }
                 ]
               }
             }
    end

    test "return a list of all results if user is author", %{
      user_jwt: user_jwt,
      test_formular: test_formular
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: test_formular.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "contentModuleResults" => [
                   %{
                     "result" => %{
                       "responses" => %{
                         "beschreibung" => "",
                         "feld3" => ["käse", "pilze"],
                         "größe" => "klein",
                         "name" => "Test",
                         "transport" => "lieferung"
                       }
                     },
                     "user" => nil
                   }
                 ]
               }
             }
    end

    test "return an error user is not author", %{test_formular: test_formular} do
      not_author = insert(:user)
      {:ok, user_jwt, _} = AccessToken.encode_and_sign(not_author)

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: test_formular.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "contentModuleResults" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du darfst die Antworten für dieses Modul nicht lesen.",
                   "path" => ["contentModuleResults"]
                 }
               ]
             } = res
    end

    test "return an error user is not logged in", %{test_formular: test_formular} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{id: test_formular.id})
        |> json_response(200)

      assert %{
               "data" => %{
                 "contentModuleResults" => nil
               },
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["contentModuleResults"]
                 }
               ]
             } = res
    end
  end
end

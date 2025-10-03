defmodule LottaWeb.ContentModuleResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase
  use Bamboo.Test

  import Ecto.Query
  import Lotta.Fixtures

  alias LottaWeb.Auth.AccessToken

  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.User
  alias Lotta.Content.ContentModule
  alias Lotta.Storage.File

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    query =
      from(cm in ContentModule,
        where: fragment("?->>? = ?", cm.content, "value", "Pizza Test-Formular")
      )

    test_formular = Repo.one!(query, prefix: tenant.prefix)

    admin =
      Repo.one!(
        from(u in User,
          where: u.email == ^"alexis.rinaldoni@lotta.schule"
        ),
        prefix: tenant.prefix
      )

    user =
      Repo.one!(
        from(u in User,
          where: u.email == ^"eike.wiewiorra@lotta.schule"
        ),
        prefix: tenant.prefix
      )

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)

    admin_file =
      Repo.one!(
        from(f in File,
          where: f.filename == ^"irgendwas.png"
        ),
        prefix: tenant.prefix
      )

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    {:ok,
     %{
       test_formular: test_formular,
       admin: admin,
       admin_jwt: admin_jwt,
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
        to: [{_, "alexis.rinaldoni@lotta.schule"}],
        text_body: text_body,
        html_body: html_body,
        attachments: [%{filename: "coupon.png"}]
      })

      assert text_body =~ "coupon: \"coupon.png\""
      assert html_body =~ "<li><strong>coupon</strong> &quot;coupon.png&quot;</li>"
    end

    test "sends lotta file and save its filename to database", %{
      test_formular: test_formular,
      admin: admin
    } do
      admin_file = fixture(:real_file, admin)
      filename = admin_file.filename

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
          \"coupon\": \"lotta-file-id://{\\\"filename\\\":\\\"#{filename}\\\",\\\"filesize\\\":#{admin_file.filesize},\\\"filetype\\\":\\\"#{admin_file.mime_type}\\\",\\\"id\\\":\\\"#{admin_file.id}\\\"}\"
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
        to: [{_, "alexis.rinaldoni@lotta.schule"}],
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
      admin_file: admin_file
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
          \"coupon\": \"lotta-file-id://{\\\"filename\\\":\\\"irgendwas.png\\\",\\\"filesize\\\":713,\\\"filetype\\\":\\\"image/png\\\",\\\"id\\\":\\\"#{admin_file.id}\\\"}\"
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
        to: [{_, "alexis.rinaldoni@lotta.schule"}],
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
      user =
        Repo.one!(
          from(u in User,
            where: u.email == ^"billy@lotta.schule"
          ),
          prefix: @prefix
        )

      {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

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

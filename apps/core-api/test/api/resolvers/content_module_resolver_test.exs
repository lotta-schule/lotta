defmodule Api.ContentModuleResolverTest do
  @moduledoc """
    Test Module for ContentModuleResolver
  """

  use ApiWeb.ConnCase
  import Ecto.Query

  setup do
    Api.Repo.Seeder.seed()

    query =
      from cm in Api.Content.ContentModule,
        where: fragment("?->>? = ?", cm.content, "value", "Pizza Test-Formular")

    test_formular = Api.Repo.one!(query)
    admin = Api.Repo.get_by!(Api.Accounts.User, email: "alexis.rinaldoni@lotta.schule")
    user = Api.Repo.get_by!(Api.Accounts.User, email: "eike.wiewiorra@lotta.schule")

    {:ok, admin_jwt, _} =
      Api.Guardian.encode_and_sign(admin, %{email: admin.email, name: admin.name})

    {:ok, user_jwt, _} = Api.Guardian.encode_and_sign(user, %{email: user.email, name: user.name})

    {:ok,
     %{
       test_formular: test_formular,
       admin: admin,
       admin_jwt: admin_jwt,
       user: user,
       user_jwt: user_jwt
     }}
  end

  describe "send_form_response mutation" do
    @query """
    mutation SendFormResponse($id: LottaId!, $response: Json!) {
      sendFormResponse(contentModuleId: $id, response: $response)
    }
    """
    test "sends form response and saves correct result to database", %{
      test_formular: test_formular
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
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
        |> Api.Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      assert List.last(results).content_module_id == test_formular.id

      assert List.last(results).result == %{
               "responses" => %{
                 "beschreibung" => "",
                 "feld3" => ["käse", "pilze"],
                 "größe" => "klein",
                 "name" => "Test",
                 "transport" => "lieferung"
               }
             }
    end

    test "sends form response and strips out unwanted fields", %{test_formular: test_formular} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
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
        |> Api.Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      assert List.last(results).content_module_id == test_formular.id

      assert List.last(results).result == %{
               "responses" => %{
                 "beschreibung" => "",
                 "feld3" => ["käse", "pilze"],
                 "größe" => "klein",
                 "name" => "Test",
                 "transport" => "lieferung"
               }
             }
    end

    test "sends form response and save sent user", %{
      admin_jwt: admin_jwt,
      test_formular: test_formular
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
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
        |> Api.Repo.preload(:results)
        |> Map.fetch!(:results)

      assert length(results) == 2
      assert List.last(results).content_module_id == test_formular.id
      # assert List.last(results).user_id == admin.id
    end
  end

  describe "get form responses" do
    @query """
    query ContentModuleResults($id: LottaId!) {
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
        |> put_req_header("tenant", "slug:web")
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

    test "return an error user is not user", %{user_jwt: user_jwt, test_formular: test_formular} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{id: test_formular.id})
        |> json_response(200)

      assert res = %{
               "data" => %{
                 "contentModuleResults" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen Modul-Ergebnisse abrufen.",
                   "path" => ["contentModuleResults"]
                 }
               ]
             }
    end

    test "return an error user is not logged in", %{test_formular: test_formular} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> get("/api", query: @query, variables: %{id: test_formular.id})
        |> json_response(200)

      assert res = %{
               "data" => %{
                 "contentModuleResults" => nil
               },
               "errors" => [
                 %{
                   "message" => "Nur Administratoren dürfen Modul-Ergebnisse abrufen.",
                   "path" => ["contentModuleResults"]
                 }
               ]
             }
    end
  end
end

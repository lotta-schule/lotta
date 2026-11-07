defmodule LottaWeb.E2EControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query
  import Phoenix.ConnTest

  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.{Authentication, User, UserGroup}

  setup do
    %{tenant: Tenants.get_tenant_by_prefix("tenant_test")}
  end

  defp seed(params, opts \\ []) do
    conn =
      build_conn()
      |> put_req_header("accept", "application/json")

    conn =
      if Keyword.get(opts, :auth, true),
        do: put_req_header(conn, "authorization", "Basic " <> Base.encode64("admin:test123")),
        else: conn

    post(conn, "/admin/api/seed", params)
  end

  describe "seed" do
    test "creates groups and users and assigns the groups", %{tenant: tenant} do
      conn =
        seed(%{
          "tenant" => %{"id" => tenant.id},
          "groups" => [%{"name" => "E2E Klasse 5a"}],
          "users" => [
            %{
              "name" => "Frodo Baggins",
              "email" => "frodo@e2e.example",
              "password" => "my-precious",
              "groups" => ["E2E Klasse 5a"]
            },
            %{"name" => "Samweis Gamdschie", "email" => "sam@e2e.example"}
          ]
        })

      body = json_response(conn, 200)
      assert body["success"] == true
      assert [%{"name" => "E2E Klasse 5a", "id" => group_id}] = body["groups"]

      assert [
               %{"email" => "frodo@e2e.example", "password" => "my-precious"},
               %{"email" => "sam@e2e.example", "password" => sam_password}
             ] = body["users"]

      # user with a given password can log in right away
      assert {:ok, frodo} =
               Authentication.login_with_username_pass(
                 "frodo@e2e.example",
                 "my-precious",
                 tenant
               )

      assert frodo.has_changed_default_password == true

      assert [%UserGroup{id: ^group_id}] =
               Repo.preload(frodo, :groups, prefix: tenant.prefix).groups

      # user without password gets a generated one and must change it on first login
      assert is_binary(sam_password)

      assert {:ok, sam} =
               Authentication.login_with_username_pass("sam@e2e.example", sam_password, tenant)

      refute sam.has_changed_default_password
    end

    test "reuses existing groups with the same name", %{tenant: tenant} do
      params = %{"tenant" => %{"id" => tenant.id}, "groups" => [%{"name" => "E2E Reused"}]}

      %{"groups" => [%{"id" => id}]} = json_response(seed(params), 200)
      %{"groups" => [%{"id" => ^id}]} = json_response(seed(params), 200)

      assert Repo.aggregate(
               from(g in UserGroup, where: g.name == "E2E Reused"),
               :count,
               prefix: tenant.prefix
             ) == 1
    end

    test "fails without creating anything when a user references an unknown group", %{
      tenant: tenant
    } do
      conn =
        seed(%{
          "tenant" => %{"id" => tenant.id},
          "groups" => [%{"name" => "E2E Rolled Back"}],
          "users" => [
            %{"name" => "Gollum", "email" => "gollum@e2e.example", "groups" => ["Nope"]}
          ]
        })

      assert %{"success" => false, "error" => "Unknown groups: Nope"} =
               json_response(conn, 422)

      refute Repo.one(from(u in User, where: u.email == "gollum@e2e.example"),
               prefix: tenant.prefix
             )

      refute Repo.one(from(g in UserGroup, where: g.name == "E2E Rolled Back"),
               prefix: tenant.prefix
             )
    end

    test "returns 404 when the tenant does not exist" do
      assert json_response(seed(%{"tenant" => %{"id" => 999_999}}), 404)
    end

    test "returns unauthorized without authentication", %{tenant: tenant} do
      assert seed(%{"tenant" => %{"id" => tenant.id}}, auth: false).status == 401
    end

    test "returns 404 when the e2e api is disabled", %{tenant: tenant} do
      Application.put_env(:lotta, :e2e_api_enabled, false)
      on_exit(fn -> Application.put_env(:lotta, :e2e_api_enabled, true) end)

      assert %{"success" => false} =
               json_response(seed(%{"tenant" => %{"id" => tenant.id}}), 404)
    end
  end
end

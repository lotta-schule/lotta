defmodule LottaWeb.OAuthControllerTest do
  use LottaWeb.ConnCase

  import Mock
  import Plug.Conn
  import Lotta.Factory

  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Tenant
  alias LottaWeb.Auth.AccessToken
  alias Lotta.Eduplaces.{UserInfo, AuthCodeStrategy, SchoolInfo}

  @prefix "tenant_test"

  setup ctx do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    Tesla.Mock.mock(fn
      %{url: "https://plausible.io/" <> _rest} = env ->
        %Tesla.Env{env | status: 200, body: "OK"}

      %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
        %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

      %{url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/" <> _path} ->
        %Tesla.Env{status: 404, body: "Not Found"}
    end)

    {:ok, Map.merge(ctx, %{tenant: tenant})}
  end

  describe "GET /auth/:provider/login" do
    test "sets ep_login_state cookie and redirects to provider URL", %{conn: conn} do
      authorize_url = "https://eduplaces.com/oauth/authorize?state=some-state"

      # Mock the strategy authorize URL
      with_mock(AuthCodeStrategy,
        authorize_url!: fn opts ->
          assert Keyword.has_key?(opts, :state)
          authorize_url
        end
      ) do
        conn =
          conn
          |> get("/auth/oauth/eduplaces/login")
          |> fetch_cookies()

        assert redirected_to(conn) =~ "https://eduplaces.com/oauth/authorize"
        assert conn.cookies["ep_login_state"]
      end
    end

    test "sets mobile_app cookie when x-lotta-app-version header is present", %{conn: conn} do
      with_mock(AuthCodeStrategy,
        authorize_url!: fn _opts -> "https://eduplaces.com/oauth/authorize?state=some-state" end
      ) do
        conn =
          conn
          |> put_req_header("x-lotta-app-version", "1.0.0")
          |> get("/auth/oauth/eduplaces/login")
          |> fetch_cookies()

        assert %{"mobile_app" => %{value: "true", http_only: true, same_site: "Lax"}} =
                 get_resp_cookies(conn)
      end
    end

    test "does not set mobile_app cookie when x-lotta-app-version header is absent", %{
      conn: conn
    } do
      with_mock(AuthCodeStrategy,
        authorize_url!: fn _opts -> "https://eduplaces.com/oauth/authorize?state=some-state" end
      ) do
        conn =
          conn
          |> get("/auth/oauth/eduplaces/login")
          |> fetch_cookies()

        refute Map.has_key?(get_resp_cookies(conn), "mobile_app")
      end
    end
  end

  describe "GET /auth/:provider/callback" do
    test "returns error when state is missing", %{conn: conn} do
      conn =
        conn
        |> put_req_cookie("ep_login_state", "valid_state")
        |> get("/auth/oauth/eduplaces/callback?state=")
        |> fetch_cookies()

      assert html_response(conn, 400) =~ "Fehlender oder ungültiger Status-Parameter"
    end

    test "returns error when state mismatches", %{conn: conn} do
      conn =
        conn
        |> put_req_cookie("ep_login_state", "valid_state")
        |> get("/auth/oauth/eduplaces/callback?state=invalid_state")
        |> fetch_cookies()

      assert html_response(conn, 400) =~ "Status-Parameter stimmt nicht überein"
    end

    test "redirects to tenant URI with access token on successful login", %{
      conn: conn,
      tenant: tenant
    } do
      user_info = %UserInfo{
        id: "user123",
        username: "Teacher User",
        groups: [],
        role: :teacher,
        school: %SchoolInfo{
          id: "school123",
          name: "Test School",
          official_id: "TS123",
          schooling_level: "secondary"
        }
      }

      tenant
      |> Ecto.Changeset.change(%{eduplaces_id: user_info.school.id})
      |> Repo.update!()

      user = insert(:user, email: "hedwig@hogwarts.de", eduplaces_id: user_info.id)

      with_mock(AuthCodeStrategy,
        get_token!: fn _params -> {"fake_token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")

        assert redirect_uri = redirected_to(conn)

        assert "https://test.lotta.schule/auth/callback?token=" <> token =
                 String.replace_suffix(redirect_uri, "&return_url=/", "")

        tenant_id = tenant.id
        user_id = to_string(user.id)
        email = user.email

        assert {:ok,
                %{
                  "tid" => ^tenant_id,
                  "sub" => ^user_id,
                  "typ" => "hisec",
                  "email" => ^email
                }} = AccessToken.decode_and_verify(token)
      end
    end

    test "creates new tenant when no tenant exists with this eduplaces_id", %{conn: conn} do
      user_info = %UserInfo{
        id: "user123",
        username: "Hedwig",
        groups: [],
        role: :teacher,
        school: %SchoolInfo{
          id: "school123",
          name: "Test School",
          official_id: "TS123",
          schooling_level: "secondary"
        }
      }

      with_mock(AuthCodeStrategy,
        get_token!: fn _params -> {"token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")

        # Should redirect to tenant URI with token and return_url pointing to /setup
        redirect_path = redirected_to(conn)
        assert redirect_path =~ "https://test-school.lotta.schule/auth/callback?token="
        assert redirect_path =~ "return_url=/setup/status"
      end
    end

    test "Creates a teacher user when no user exists with this eduplaces_id", %{
      conn: conn,
      tenant: tenant
    } do
      user_info = %UserInfo{
        id: "user991564",
        username: "Hedwig",
        groups: [],
        role: :teacher,
        school: %SchoolInfo{
          id: "school123",
          name: "Test School",
          official_id: "TS123",
          schooling_level: "secondary"
        }
      }

      tenant
      |> Ecto.Changeset.change(%{eduplaces_id: user_info.school.id})
      |> Repo.update!()

      with_mock(AuthCodeStrategy,
        get_token!: fn _params -> {"token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")
          |> fetch_cookies()

        assert redirect_uri = redirected_to(conn)

        assert "https://test.lotta.schule/auth/callback?token=" <> token =
                 String.replace_suffix(redirect_uri, "&return_url=/", "")

        tenant_id = tenant.id

        assert {:ok,
                %{
                  "tid" => ^tenant_id,
                  "sub" => user_id,
                  "typ" => "hisec"
                }} = AccessToken.decode_and_verify(token)

        assert user =
                 Repo.get_by(Lotta.Accounts.User,
                   eduplaces_id: user_info.id
                 )

        assert user.id == String.to_integer(user_id)
      end
    end

    test "Creates a student user when no user exists with this eduplaces_id", %{
      conn: conn,
      tenant: tenant
    } do
      user_info = %UserInfo{
        id: "user991564",
        username: "Hedwig",
        groups: [],
        role: :student,
        school: %SchoolInfo{
          id: "school123",
          name: "Test School",
          official_id: "TS123",
          schooling_level: "secondary"
        }
      }

      tenant
      |> Ecto.Changeset.change(%{eduplaces_id: user_info.school.id})
      |> Repo.update!()

      with_mock(AuthCodeStrategy,
        get_token!: fn _params -> {"token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")
          |> fetch_cookies()

        assert redirect_uri = redirected_to(conn)

        assert "https://test.lotta.schule/auth/callback?token=" <> token =
                 String.replace_suffix(redirect_uri, "&return_url=/", "")

        tenant_id = tenant.id

        assert {:ok,
                %{
                  "tid" => ^tenant_id,
                  "sub" => user_id,
                  "typ" => "hisec"
                }} = AccessToken.decode_and_verify(token)

        assert user =
                 Repo.get_by(Lotta.Accounts.User,
                   eduplaces_id: user_info.id
                 )

        assert user.id == String.to_integer(user_id)
      end
    end

    test "returns forbidden error when user is not a teacher and the school does not exist yet",
         %{conn: conn} do
      user_info = %UserInfo{
        id: "user123",
        username: "Student User",
        groups: [],
        role: :student,
        school: %SchoolInfo{
          id: "school123",
          name: "Test School",
          official_id: "TS123",
          schooling_level: "secondary"
        }
      }

      with_mock(AuthCodeStrategy,
        get_token!: fn _params -> {"token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")

        assert html_response(conn, 403) =~ "Zugriff verweigert"

        assert html_response(conn, 403) =~
                 "Nur eine Lehrkraft darf Lotta für eine Schule einrichten"
      end
    end

    test "redirects to lotta:// URI with access and refresh tokens when mobile_app cookie is set",
         %{conn: conn, tenant: tenant} do
      user_info = %UserInfo{
        id: "user123",
        username: "Teacher User",
        groups: [],
        role: :teacher,
        school: %SchoolInfo{
          id: "school123",
          name: "Test School",
          official_id: "TS123",
          schooling_level: "secondary"
        }
      }

      tenant
      |> Ecto.Changeset.change(%{eduplaces_id: user_info.school.id})
      |> Repo.update!()

      user = insert(:user, email: "hedwig@hogwarts.de", eduplaces_id: user_info.id)

      with_mock(AuthCodeStrategy,
        get_token!: fn _params -> {"fake_token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("mobile_app", "true")
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")

        redirect_uri = redirected_to(conn)

        %URI{scheme: "lotta", host: slug, path: "/auth/callback", query: query} =
          URI.parse(redirect_uri)

        assert slug == tenant.slug

        query_params = URI.decode_query(query)

        tenant_id = tenant.id
        user_id = to_string(user.id)

        assert {:ok, %{"tid" => ^tenant_id, "sub" => ^user_id, "typ" => "access"}} =
                 AccessToken.decode_and_verify(query_params["token"])

        assert {:ok, %{"tid" => ^tenant_id, "sub" => ^user_id, "typ" => "refresh"}} =
                 AccessToken.decode_and_verify(query_params["refresh_token"], %{
                   "typ" => "refresh"
                 })

        assert query_params["return_url"] == "/"
      end
    end

    test "does not include refresh_token in redirect when mobile_app cookie is not set", %{
      conn: conn,
      tenant: tenant
    } do
      user_info = %UserInfo{
        id: "user123",
        username: "Teacher User",
        groups: [],
        role: :teacher,
        school: %SchoolInfo{
          id: "school123",
          name: "Test School",
          official_id: "TS123",
          schooling_level: "secondary"
        }
      }

      tenant
      |> Ecto.Changeset.change(%{eduplaces_id: user_info.school.id})
      |> Repo.update!()

      _user =
        insert(:user, email: "hedwig@hogwarts.de", eduplaces_id: user_info.id)

      with_mock(AuthCodeStrategy,
        get_token!: fn _params -> {"fake_token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")

        redirect_uri = redirected_to(conn)
        query_params = redirect_uri |> URI.parse() |> Map.get(:query) |> URI.decode_query()

        refute Map.has_key?(query_params, "refresh_token")
        assert Map.has_key?(query_params, "token")

        assert {:ok, %{"typ" => "hisec"}} = AccessToken.decode_and_verify(query_params["token"])
      end
    end
  end

  describe "GET /auth/callback" do
    test "sets refresh token cookie and redirects to root on success", %{
      conn: conn,
      tenant: tenant
    } do
      user = insert(:user, eduplaces_id: "user123")

      {:ok, token, _} = AccessToken.encode_and_sign(user, %{}, token_type: "hisec")

      conn =
        conn
        |> put_req_header("tenant", "slug:#{tenant.slug}")
        |> get("/auth/callback?token=#{token}")
        |> fetch_cookies()

      assert redirected_to(conn) == "/"

      user_id = to_string(user.id)
      tenant_id = tenant.id

      assert %{"SignInRefreshToken" => %{value: refresh_token}} = get_resp_cookies(conn)

      assert {:ok,
              %{
                "sub" => ^user_id,
                "tid" => ^tenant_id
              }} = AccessToken.decode_and_verify(refresh_token, %{"typ" => "refresh"})
    end

    test "returns unauthorized when token is invalid", %{conn: conn, tenant: tenant} do
      conn =
        conn
        |> put_req_header("tenant", "slug:#{tenant.slug}")
        |> get("/auth/callback?token=invalid")

      assert html_response(conn, 401) =~ "Nicht autorisiert"
    end

    test "returns unauthorized when tenant ID mismatches", %{conn: conn, tenant: tenant} do
      other =
        Repo.insert!(%Tenant{
          title: "Meine andere Schule",
          slug: "meine-andere-schule",
          prefix: "t_other",
          logo_image_file_id: nil,
          background_image_file_id: nil
        })

      {:ok, _} = Lotta.Tenants.TenantDbManager.create_tenant_database_schema(other)

      on_exit(fn ->
        Lotta.Repo.with_new_dynamic_repo(fn _ ->
          Lotta.Repo.query!("DROP SCHEMA IF EXISTS \"#{other.prefix}\" CASCADE")
        end)
      end)

      user =
        Repo.insert!(
          %User{
            email: "some@email.de",
            name: "Alberta Smith",
            nickname: "TheNick",
            class: "5",
            hide_full_name: false
          },
          prefix: other.prefix
        )

      {:ok, token, _} =
        AccessToken.encode_and_sign(
          user,
          %{},
          token_type: "hisec"
        )

      conn =
        conn
        |> put_req_header("tenant", "slug:#{tenant.slug}")
        |> get("/auth/callback?token=#{token}")

      assert html_response(conn, 401) =~ "Nicht autorisiert"
    end
  end
end

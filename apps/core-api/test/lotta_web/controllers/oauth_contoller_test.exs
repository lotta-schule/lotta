defmodule LottaWeb.OAuthControllerTest do
  use LottaWeb.ConnCase

  import Mock
  import Plug.Conn
  import Lotta.Fixtures

  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Tenant
  alias LottaWeb.Auth.AccessToken
  alias Lotta.Eduplaces.{UserInfo, AuthCodeStrategy, SchoolInfo}

  @prefix "tenant_test"

  setup ctx do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

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

      user = fixture(:registered_user, %{email: "hedwig@hogwarts.de", eduplaces_id: user_info.id})

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

    test "Creates a user when no user exists with this eduplaces_id", %{
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

    test "returns forbidden error when user is not a teacher", %{conn: conn, tenant: tenant} do
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

        assert html_response(conn, 403) =~ "Zugriff verweigert"

        assert html_response(conn, 403) =~
                 "Nur eine Lehrkraft darf Lotta für eine Schule einrichten"
      end
    end
  end

  describe "GET /auth/callback" do
    test "sets refresh token cookie and redirects to root on success", %{
      conn: conn,
      tenant: tenant
    } do
      user = fixture(:registered_user, %{eduplaces_id: "user123"})

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
        %Tenant{}
        |> Map.merge(fixture(:valid_tenant_attrs))
        |> Repo.insert!()

      {:ok, _} = Lotta.Tenants.TenantDbManager.create_tenant_database_schema(other)

      user =
        %User{}
        |> Map.merge(fixture(:valid_eduplace_user_attrs))
        |> Repo.insert!(prefix: other.prefix)

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

defmodule LottaWeb.OAuthControllerTest do
  use LottaWeb.ConnCase, async: true

  import Mock
  import Phoenix.Controller, only: [redirected_to: 1]
  import Plug.Conn
  import Lotta.Fixtures

  alias Lotta.{Repo, Tenants}
  alias LottaWeb.Auth.AccessToken
  alias Lotta.Eduplaces.{UserInfo, OAuthStrategy}

  @prefix "tenant_test"

  setup ctx do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    {:ok, Map.merge(ctx, %{tenant: tenant})}
  end

  describe "GET /auth/:provider/login" do
    test "sets ep_login_state cookie and redirects to provider URL", %{conn: conn} do
      authorize_url = "https://eduplaces.com/oauth/authorize?state=some-state"

      # Mock the strategy authorize URL
      with_mock(OAuthStrategy,
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

      assert html_response(conn, 400) =~ "Missing or invalid state parameter."
    end

    test "returns error when state mismatches", %{conn: conn} do
      conn =
        conn
        |> put_req_cookie("ep_login_state", "valid_state")
        |> get("/auth/oauth/eduplaces/callback?state=invalid_state")
        |> fetch_cookies()

      assert html_response(conn, 400) =~ "State parameter mismatch."
    end

    test "redirects to tenant URI with access token on successful login", %{
      conn: conn,
      tenant: tenant
    } do
      user_info = %UserInfo{id: "user123", school: %{id: "school123"}}

      tenant
      |> Ecto.Changeset.change(%{eduplaces_id: user_info.school.id})
      |> Repo.update!()

      user = fixture(:registered_user, %{email: "hedwig@hogwarts.de", eduplaces_id: user_info.id})

      with_mock(OAuthStrategy,
        get_token!: fn _params -> {"fake_token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")

        assert redirect_uri = redirected_to(conn)
        assert "https://test.lotta.schule/auth/callback?token=" <> token = redirect_uri

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

    test "returns 404 when no tenant exists with this eduplaces_id", %{conn: conn} do
      user_info = %UserInfo{
        id: "user123",
        username: "Hedwig",
        groups: [],
        role: :student,
        school: %{id: "school123"}
      }

      with_mock(OAuthStrategy,
        get_token!: fn _params -> {"token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")
          |> fetch_cookies()

        assert html_response(conn, 404) =~ "not registered"
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
        role: :student,
        school: %{id: "school123"}
      }

      tenant
      |> Ecto.Changeset.change(%{eduplaces_id: user_info.school.id})
      |> Repo.update!()

      with_mock(OAuthStrategy,
        get_token!: fn _params -> {"token", user_info} end
      ) do
        conn =
          conn
          |> put_req_cookie("ep_login_state", "valid_state")
          |> get("/auth/oauth/eduplaces/callback?state=valid_state")
          |> fetch_cookies()

        assert redirect_uri = redirected_to(conn)
        assert "https://test.lotta.schule/auth/callback?token=" <> token = redirect_uri

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

      assert refresh_token = conn.cookies["SignInRefreshToken"]

      assert {:ok,
              %{
                "sub" => ^user_id,
                "tid" => ^tenant_id,
                "typ" => "refresh"
              }} = AccessToken.decode_and_verify(refresh_token)
    end

    test "returns unauthorized when token is invalid", %{conn: conn, tenant: tenant} do
      conn =
        conn
        |> put_req_header("tenant", "slug:#{tenant.slug}")
        |> get("/auth/callback?token=invalid")

      assert html_response(conn, 401) =~ "not authorized to access this resource"
    end

    test "returns unauthorized when tenant ID mismatches", %{conn: conn, tenant: tenant} do
      claims = %{"tid" => "other_tenant"}
      user = %{id: "user"}

      conn =
        conn
        |> put_req_header("tenant", "slug:#{tenant.slug}")
        |> get("/auth/callback?token=token")

      assert html_response(conn, 401) =~ "not authorized to access this resource"
    end
  end
end

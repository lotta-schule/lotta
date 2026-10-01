defmodule Lotta.Eduplaces.AuthCodeStrategyTest do
  use ExUnit.Case, async: true

  import Mox

  alias Lotta.Eduplaces.AuthCodeStrategy
  alias Lotta.Eduplaces.UserInfo
  alias OAuth2.{Client, AccessToken}

  @test_config [
    client_id: "test_client_id",
    client_secret: "test_client_secret",
    site: "https://auth.test.eduplaces.dev",
    strategy: AuthCodeStrategy
  ]

  @mock_jwt_fields %{
    "sub" => "user123",
    "pseudonym" => "testuser",
    "groups" => [
      %{"id" => "group1", "name" => "Test Group 1"},
      %{"id" => "group2", "name" => "Test Group 2"}
    ],
    "role" => "student",
    "school" => "school123",
    "school_name" => "Test School",
    "school_official_id" => "12345",
    "schooling_level" => "secondary"
  }

  setup :verify_on_exit!

  setup do
    original_config = Application.get_env(:lotta, Eduplaces, [])
    Application.put_env(:lotta, Eduplaces, @test_config)

    on_exit(fn ->
      Application.put_env(:lotta, Eduplaces, original_config)
    end)

    :ok
  end

  describe "client/0" do
    test "creates OAuth2 client with correct configuration" do
      client = AuthCodeStrategy.client()

      assert %Client{} = client
      assert client.client_id == "test_client_id"
      assert client.client_secret == "test_client_secret"
      assert client.site == "https://auth.test.eduplaces.dev"
      assert client.strategy == AuthCodeStrategy
    end

    test "sets JSON serializer correctly" do
      client = AuthCodeStrategy.client()

      assert client.serializers["application/json"] == Jason
    end
  end

  describe "authorize_url!/1" do
    test "generates authorization URL with correct scopes" do
      url = AuthCodeStrategy.authorize_url!()

      assert url =~ "https://auth.test.eduplaces.dev"
      assert url =~ "response_type=code"
      assert url =~ "client_id=test_client_id"

      assert url =~ "openid"
      assert url =~ "role"
      assert url =~ "pseudonym"
      assert url =~ "groups"
      assert url =~ "school"
      assert url =~ "schooling_level"
      assert url =~ "school_name"
      assert url =~ "school_official_id"
    end

    test "accepts additional parameters" do
      url = AuthCodeStrategy.authorize_url!(state: "test_state", redirect_uri: "http://test.com")

      assert url =~ "state=test_state"
      assert url =~ "redirect_uri=http%3A%2F%2Ftest.com"
    end

    test "properly encodes scope parameter" do
      url = AuthCodeStrategy.authorize_url!()

      expected_scopes = [
        "openid",
        "role",
        "pseudonym",
        "groups",
        "school",
        "schooling_level",
        "school_name",
        "school_official_id"
      ]

      scope_string = Enum.join(expected_scopes, " ")
      assert url =~ URI.encode(scope_string)
    end
  end

  describe "get_token!/3" do
    setup do
      Application.put_env(:lotta, :oauth2_client_module, Lotta.Eduplaces.OAuth2ClientMock)
      Application.put_env(:lotta, :jose_jwt_module, Lotta.Eduplaces.JOSEJWTMock)

      on_exit(fn ->
        Application.delete_env(:lotta, :oauth2_client_module)
        Application.delete_env(:lotta, :jose_jwt_module)
      end)

      :ok
    end

    test "retrieves access token and parses ID token successfully" do
      mock_access_token = %AccessToken{
        access_token: "test_access_token",
        other_params: %{"id_token" => "mock.jwt.token"}
      }

      stub(Lotta.Eduplaces.OAuth2ClientMock, :get_token!, fn _client, _params, _headers, _opts ->
        %Client{token: mock_access_token}
      end)

      stub(Lotta.Eduplaces.JOSEJWTMock, :peek, fn _token -> %{fields: @mock_jwt_fields} end)

      {token, user_info} = AuthCodeStrategy.get_token!()

      assert token == mock_access_token
      assert %UserInfo{} = user_info
      assert user_info.id == "user123"
      assert user_info.username == "testuser"
      assert user_info.role == :student
    end

    test "passes parameters correctly to OAuth2 client" do
      params = [code: "auth_code", redirect_uri: "http://test.com"]
      headers = [{"accept", "application/json"}]
      opts = [timeout: 5000]

      mock_access_token = %AccessToken{
        access_token: "test_token",
        other_params: %{"id_token" => "mock.jwt.token"}
      }

      expect(Lotta.Eduplaces.OAuth2ClientMock, :get_token!, fn client,
                                                               token_params,
                                                               token_headers,
                                                               _opts ->
        assert client.client_id == "test_client_id"
        assert token_params[:code] == "auth_code"
        assert token_params[:redirect_uri] == "http://test.com"
        assert {"accept", "application/json"} in token_headers

        %Client{token: mock_access_token}
      end)

      stub(Lotta.Eduplaces.JOSEJWTMock, :peek, fn _token -> %{fields: @mock_jwt_fields} end)

      AuthCodeStrategy.get_token!(params, headers, opts)
    end
  end

  describe "authorize_url/2 callback" do
    test "delegates to OAuth2.Strategy.AuthCode.authorize_url/2" do
      client = AuthCodeStrategy.client()
      params = [state: "test_state"]

      result = AuthCodeStrategy.authorize_url(client, params)

      assert %Client{} = result
    end
  end

  describe "get_token/3 callback" do
    test "adds accept header before delegating" do
      client = AuthCodeStrategy.client()
      params = %{"code" => "auth_code"}
      headers = [{"custom", "header"}]

      result = AuthCodeStrategy.get_token(client, params, headers)

      assert %Client{} = result
      assert {"accept", "application/json"} in result.headers
    end

    test "converts string keys to atoms in params" do
      client = AuthCodeStrategy.client()
      params = %{"code" => "auth_code", "redirect_uri" => "http://test.com"}

      result = AuthCodeStrategy.get_token(client, params, [])

      assert %Client{} = result
    end

    test "preserves existing atom keys in params" do
      client = AuthCodeStrategy.client()
      params = %{"redirect_uri" => "http://test.com", code: "auth_code"}

      result = AuthCodeStrategy.get_token(client, params, [])

      assert %Client{} = result
    end
  end

  describe "read_id_token/1" do
    setup do
      Application.put_env(:lotta, :jose_jwt_module, Lotta.Eduplaces.JOSEJWTMock)
      on_exit(fn -> Application.delete_env(:lotta, :jose_jwt_module) end)
      :ok
    end

    test "extracts and parses user info from JWT token" do
      token = %AccessToken{
        other_params: %{"id_token" => "mock.jwt.token"}
      }

      expect(Lotta.Eduplaces.JOSEJWTMock, :peek, fn jwt_token ->
        assert jwt_token == "mock.jwt.token"
        %{fields: @mock_jwt_fields}
      end)

      result = AuthCodeStrategy.read_id_token(token)

      assert %UserInfo{} = result
      assert result.id == "user123"
      assert result.username == "testuser"
      assert result.role == :student
    end

    test "handles missing id_token gracefully" do
      token = %AccessToken{other_params: %{}}

      assert_raise(FunctionClauseError, fn ->
        AuthCodeStrategy.read_id_token(token)
      end)
    end
  end

  describe "allowed_atoms/0" do
    test "returns expected value" do
      assert [
               :client_id,
               :client_secret,
               :site,
               :state,
               :response_type,
               :scope,
               :error,
               :error_description,
               :provider
             ] == AuthCodeStrategy.allowed_atoms()
    end
  end

  describe "scope configuration" do
    test "includes all required OAuth2 scopes" do
      url = AuthCodeStrategy.authorize_url!()

      required_scopes = [
        "openid",
        "role",
        "pseudonym",
        "groups",
        "school",
        "schooling_level",
        "school_name",
        "school_official_id"
      ]

      Enum.each(required_scopes, fn scope ->
        assert url =~ scope, "Missing required scope: #{scope}"
      end)
    end
  end

  describe "error handling" do
    setup do
      Application.put_env(:lotta, :oauth2_client_module, Lotta.Eduplaces.OAuth2ClientMock)
      on_exit(fn -> Application.delete_env(:lotta, :oauth2_client_module) end)
      :ok
    end

    test "logs errors when OAuth2 token exchange fails" do
      stub(Lotta.Eduplaces.OAuth2ClientMock, :get_token!, fn _client, _params, _headers, _opts ->
        raise OAuth2.Error, reason: "invalid_grant"
      end)

      assert_raise(OAuth2.Error, fn ->
        AuthCodeStrategy.get_token!()
      end)
    end

    test "handles JWT parsing errors gracefully" do
      Application.put_env(:lotta, :jose_jwt_module, Lotta.Eduplaces.JOSEJWTMock)
      on_exit(fn -> Application.delete_env(:lotta, :jose_jwt_module) end)

      mock_access_token = %AccessToken{
        access_token: "test_access_token",
        other_params: %{"id_token" => "invalid.jwt.token"}
      }

      stub(Lotta.Eduplaces.OAuth2ClientMock, :get_token!, fn _client, _params, _headers, _opts ->
        %Client{token: mock_access_token}
      end)

      stub(Lotta.Eduplaces.JOSEJWTMock, :peek, fn _token -> raise "Invalid JWT format" end)

      assert_raise(RuntimeError, "Invalid JWT format", fn ->
        AuthCodeStrategy.get_token!()
      end)
    end
  end

  describe "configuration handling" do
    test "merges strategy into application config" do
      client = AuthCodeStrategy.client()

      assert client.strategy == AuthCodeStrategy
      assert client.client_id == "test_client_id"
      assert client.client_secret == "test_client_secret"
      assert client.site == "https://auth.test.eduplaces.dev"
    end

    test "handles missing configuration gracefully" do
      Application.delete_env(:lotta, Eduplaces)

      assert_raise(FunctionClauseError, fn ->
        AuthCodeStrategy.client()
      end)
    end
  end
end

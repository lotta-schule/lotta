defmodule Lotta.Eduplaces.AuthCodeStrategyTest do
  use ExUnit.Case

  import Mock

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

  setup do
    # Mock the application configuration
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

      # Check that scopes are properly encoded
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

      # The scope should be space-separated and properly encoded
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
    test "retrieves access token and parses ID token successfully" do
      mock_access_token = %AccessToken{
        access_token: "test_access_token",
        other_params: %{"id_token" => "mock.jwt.token"}
      }

      with_mock(OAuth2.Client, [:passthrough],
        get_token!: fn _client, _params, _headers, _opts ->
          %Client{token: mock_access_token}
        end
      ) do
        with_mock(JOSE.JWT,
          peek: fn _token -> %{fields: @mock_jwt_fields} end
        ) do
          {token, user_info} = AuthCodeStrategy.get_token!()

          assert token == mock_access_token
          assert %UserInfo{} = user_info
          assert user_info.id == "user123"
          assert user_info.username == "testuser"
          assert user_info.role == :student
        end
      end
    end

    test "passes parameters correctly to OAuth2 client" do
      params = [code: "auth_code", redirect_uri: "http://test.com"]
      headers = [{"accept", "application/json"}]
      opts = [timeout: 5000]

      mock_access_token = %AccessToken{
        access_token: "test_token",
        other_params: %{"id_token" => "mock.jwt.token"}
      }

      with_mock(OAuth2.Client, [:passthrough],
        get_token!: fn client, token_params, token_headers, _opts ->
          # Verify the client and parameters are passed correctly
          assert client.client_id == "test_client_id"
          assert token_params[:code] == "auth_code"
          assert token_params[:redirect_uri] == "http://test.com"
          assert {"accept", "application/json"} in token_headers

          %Client{token: mock_access_token}
        end
      ) do
        with_mock(JOSE.JWT,
          peek: fn _token -> %{fields: @mock_jwt_fields} end
        ) do
          AuthCodeStrategy.get_token!(params, headers, opts)

          assert called(OAuth2.Client.get_token!(:_, :_, :_, :_))
        end
      end
    end
  end

  describe "authorize_url/2 callback" do
    test "delegates to OAuth2.Strategy.AuthCode.authorize_url/2" do
      client = AuthCodeStrategy.client()
      params = [state: "test_state"]

      with_mock(OAuth2.Strategy.AuthCode,
        authorize_url: fn c, p ->
          assert c == client
          assert p == params
          "https://mocked.url"
        end
      ) do
        result = AuthCodeStrategy.authorize_url(client, params)

        assert result == "https://mocked.url"
        assert called(OAuth2.Strategy.AuthCode.authorize_url(client, params))
      end
    end
  end

  describe "get_token/3 callback" do
    test "adds accept header and delegates to OAuth2.Strategy.AuthCode" do
      client = AuthCodeStrategy.client()
      params = %{"code" => "auth_code"}
      headers = [{"custom", "header"}]

      with_mock(OAuth2.Strategy.AuthCode,
        get_token: fn c, p, h ->
          # Verify the client has the accept header
          assert {"accept", "application/json"} in c.headers
          # Verify original headers are passed through
          assert {"custom", "header"} in h

          # Verify params were converted to keyword list
          assert p[:code] == "auth_code"

          {:ok, c}
        end
      ) do
        AuthCodeStrategy.get_token(client, params, headers)

        assert called(OAuth2.Strategy.AuthCode.get_token(:_, :_, :_))
      end
    end

    test "converts string keys to atoms in params" do
      client = AuthCodeStrategy.client()
      params = %{"code" => "auth_code", "redirect_uri" => "http://test.com"}

      with_mock(OAuth2.Strategy.AuthCode,
        get_token: fn _c, p, _h ->
          assert p[:code] == "auth_code"
          assert p[:redirect_uri] == "http://test.com"
          {:ok, client}
        end
      ) do
        AuthCodeStrategy.get_token(client, params, [])
      end
    end

    test "preserves existing atom keys in params" do
      client = AuthCodeStrategy.client()
      params = %{"redirect_uri" => "http://test.com", code: "auth_code"}

      with_mock(OAuth2.Strategy.AuthCode,
        get_token: fn _c, p, _h ->
          assert p[:code] == "auth_code"
          assert p[:redirect_uri] == "http://test.com"
          {:ok, client}
        end
      ) do
        AuthCodeStrategy.get_token(client, params, [])
      end
    end
  end

  describe "read_id_token/1" do
    test "extracts and parses user info from JWT token" do
      token = %AccessToken{
        other_params: %{"id_token" => "mock.jwt.token"}
      }

      with_mock(JOSE.JWT,
        peek: fn jwt_token ->
          assert jwt_token == "mock.jwt.token"
          %{fields: @mock_jwt_fields}
        end
      ) do
        with_mock(UserInfo,
          from_jwt_info: fn fields ->
            assert fields == @mock_jwt_fields
            %UserInfo{id: "user123", username: "testuser", role: :student}
          end
        ) do
          result = AuthCodeStrategy.read_id_token(token)

          assert %UserInfo{} = result
          assert called(JOSE.JWT.peek("mock.jwt.token"))
          assert called(UserInfo.from_jwt_info(@mock_jwt_fields))
        end
      end
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
      # This tests the private scope/0 function indirectly through authorize_url!/1
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
    test "logs errors when OAuth2 token exchange fails" do
      with_mock(OAuth2.Client, [:passthrough],
        get_token!: fn _client, _params, _headers, _opts ->
          raise OAuth2.Error, reason: "invalid_grant"
        end
      ) do
        assert_raise(OAuth2.Error, fn ->
          AuthCodeStrategy.get_token!()
        end)
      end
    end

    test "handles JWT parsing errors gracefully" do
      mock_access_token = %AccessToken{
        access_token: "test_access_token",
        other_params: %{"id_token" => "invalid.jwt.token"}
      }

      with_mock(OAuth2.Client, [:passthrough],
        get_token!: fn _client, _params, _headers, _opts ->
          %Client{token: mock_access_token}
        end
      ) do
        with_mock(JOSE.JWT,
          peek: fn _token -> raise "Invalid JWT format" end
        ) do
          assert_raise(RuntimeError, "Invalid JWT format", fn ->
            AuthCodeStrategy.get_token!()
          end)
        end
      end
    end
  end

  describe "configuration handling" do
    test "merges strategy into application config" do
      # Test that the private config/0 function works correctly
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

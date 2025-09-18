defmodule Lotta.Eduplaces.IDMTest do
  use ExUnit.Case, async: true
  import Mock
  import Tesla.Mock

  alias Lotta.Eduplaces.IDM

  describe "IDM module integration tests" do
    test "get/1 returns parsed JSON response on 200 status" do
      mock_response = %OAuth2.Response{
        status_code: 200,
        body: ~s({"id": "123", "name": "Test User"})
      }

      with_mock(Lotta.Eduplaces.ClientCredentialStrategy,
        client: fn -> %OAuth2.Client{} end
      ) do
        with_mock(OAuth2.Client,
          get: fn _client, _path -> {:ok, mock_response} end
        ) do
          assert {:ok, %{"id" => "123", "name" => "Test User"}} = IDM.get("/test-path")
        end
      end
    end

    test "get/1 returns error on non-200 status" do
      mock_response = %OAuth2.Response{
        status_code: 404,
        body: "Not Found"
      }

      with_mock(Lotta.Eduplaces.ClientCredentialStrategy,
        client: fn -> %OAuth2.Client{} end
      ) do
        with_mock(OAuth2.Client,
          get: fn _client, _path -> {:ok, mock_response} end
        ) do
          assert {:error, %{status: 404, body: "Not Found"}} = IDM.get("/test-path")
        end
      end
    end

    test "get/1 returns error when OAuth2 client fails" do
      with_mock(Lotta.Eduplaces.ClientCredentialStrategy,
        client: fn -> %OAuth2.Client{} end
      ) do
        with_mock(OAuth2.Client,
          get: fn _client, _path -> {:error, :timeout} end
        ) do
          assert {:error, :timeout} = IDM.get("/test-path")
        end
      end
    end

    test "get/1 returns error when JSON parsing fails" do
      mock_response = %OAuth2.Response{
        status_code: 200,
        body: "invalid json"
      }

      with_mock(Lotta.Eduplaces.ClientCredentialStrategy,
        client: fn -> %OAuth2.Client{} end
      ) do
        with_mock(OAuth2.Client,
          get: fn _client, _path -> {:ok, mock_response} end
        ) do
          assert {:error, _} = IDM.get("/test-path")
        end
      end
    end
  end

  describe "API method path construction" do
    test "get_user/1 constructs correct path for users endpoint" do
      mock(fn
        %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
          %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

        %{method: :get, url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/users/user123"} ->
          %Tesla.Env{status: 200, body: ~s({"id": "123"})}
      end)

      assert {:ok, %{"id" => "123"}} = IDM.get_user("user123")
    end

    test "list_users/0 constructs correct path for users endpoint" do
      mock(fn
        %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
          %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

        %{method: :get, url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/users"} ->
          %Tesla.Env{status: 200, body: ~s([{"id": "123"}])}
      end)

      assert {:ok, [%{"id" => "123"}]} = IDM.list_users()
    end

    test "get_school/1 constructs correct path for school endpoint" do
      mock(fn
        %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
          %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

        %{method: :get, url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/school/school123"} ->
          %Tesla.Env{status: 200, body: ~s({"id": "school123"})}
      end)

      assert {:ok, %{"id" => "school123"}} = IDM.get_school("school123")
    end

    test "list_schools/0 constructs correct path for schools endpoint" do
      mock(fn
        %{method: :post, url: "https://auth.sandbox.eduplaces.dev/oauth2/token"} ->
          %Tesla.Env{status: 200, body: %{"access_token" => "fake_token"}}

        %{method: :get, url: "https://api.sandbox.eduplaces.dev/idm/ep/v1/schools"} ->
          %Tesla.Env{status: 200, body: ~s([{"id": "school123"}])}
      end)

      assert {:ok, [%{"id" => "school123"}]} = IDM.list_schools()
    end
  end
end

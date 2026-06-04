defmodule Lotta.Eduplaces.IDMTest do
  use ExUnit.Case, async: false
  import Mox

  alias Lotta.Eduplaces.IDM

  setup :verify_on_exit!

  describe "IDM module integration tests" do
    setup do
      Application.put_env(
        :lotta,
        :client_credential_strategy_module,
        Lotta.Eduplaces.ClientCredentialStrategyMock
      )

      Application.put_env(:lotta, :oauth2_client_module, Lotta.Eduplaces.OAuth2ClientMock)

      on_exit(fn ->
        Application.delete_env(:lotta, :client_credential_strategy_module)
        Application.delete_env(:lotta, :oauth2_client_module)
      end)

      stub(Lotta.Eduplaces.ClientCredentialStrategyMock, :client, fn -> %OAuth2.Client{} end)
      :ok
    end

    test "get/1 returns parsed JSON response on 200 status" do
      mock_response = %OAuth2.Response{
        status_code: 200,
        body: ~s({"id": "123", "name": "Test User"})
      }

      expect(Lotta.Eduplaces.OAuth2ClientMock, :get, fn _client, _path ->
        {:ok, mock_response}
      end)

      assert {:ok, %{"id" => "123", "name" => "Test User"}} = IDM.get("/test-path")
    end

    test "get/1 returns error on non-200 status" do
      mock_response = %OAuth2.Response{
        status_code: 404,
        body: "Not Found"
      }

      expect(Lotta.Eduplaces.OAuth2ClientMock, :get, fn _client, _path ->
        {:ok, mock_response}
      end)

      assert {:error, %{status: 404, body: "Not Found"}} = IDM.get("/test-path")
    end

    test "get/1 returns error when OAuth2 client fails" do
      expect(Lotta.Eduplaces.OAuth2ClientMock, :get, fn _client, _path ->
        {:error, :timeout}
      end)

      assert {:error, :timeout} = IDM.get("/test-path")
    end

    test "get/1 returns error when JSON parsing fails" do
      mock_response = %OAuth2.Response{
        status_code: 200,
        body: "invalid json"
      }

      expect(Lotta.Eduplaces.OAuth2ClientMock, :get, fn _client, _path ->
        {:ok, mock_response}
      end)

      assert {:error, _} = IDM.get("/test-path")
    end
  end

  describe "API method path construction" do
    setup do
      Application.put_env(
        :lotta,
        :client_credential_strategy_module,
        Lotta.Eduplaces.ClientCredentialStrategyMock
      )

      Application.put_env(:lotta, :oauth2_client_module, Lotta.Eduplaces.OAuth2ClientMock)

      on_exit(fn ->
        Application.delete_env(:lotta, :client_credential_strategy_module)
        Application.delete_env(:lotta, :oauth2_client_module)
      end)

      stub(Lotta.Eduplaces.ClientCredentialStrategyMock, :client, fn -> %OAuth2.Client{} end)
      :ok
    end

    test "get_user/1 constructs correct path for users endpoint" do
      expect(Lotta.Eduplaces.OAuth2ClientMock, :get, fn _client, path ->
        assert path == "/users/user123"
        {:ok, %OAuth2.Response{status_code: 200, body: ~s({"id": "123"})}}
      end)

      assert {:ok, %{"id" => "123"}} = IDM.get_user("user123")
    end

    test "list_users/0 constructs correct path for users endpoint" do
      expect(Lotta.Eduplaces.OAuth2ClientMock, :get, fn _client, path ->
        assert path == "/users"
        {:ok, %OAuth2.Response{status_code: 200, body: ~s([{"id": "123"}])}}
      end)

      assert {:ok, [%{"id" => "123"}]} = IDM.list_users()
    end

    test "get_school/1 constructs correct path for school endpoint" do
      expect(Lotta.Eduplaces.OAuth2ClientMock, :get, fn _client, path ->
        assert path == "/schools/school123"
        {:ok, %OAuth2.Response{status_code: 200, body: ~s({"id": "school123"})}}
      end)

      assert {:ok, %{"id" => "school123"}} = IDM.get_school("school123")
    end

    test "list_schools/0 constructs correct path for schools endpoint" do
      expect(Lotta.Eduplaces.OAuth2ClientMock, :get, fn _client, path ->
        assert path == "/schools"
        {:ok, %OAuth2.Response{status_code: 200, body: ~s([{"id": "school123"}])}}
      end)

      assert {:ok, [%{"id" => "school123"}]} = IDM.list_schools()
    end
  end
end

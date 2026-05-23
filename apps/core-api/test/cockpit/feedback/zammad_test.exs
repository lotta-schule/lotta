defmodule Cockpit.Feedback.ZammadTest do
  use ExUnit.Case, async: true

  alias Cockpit.Feedback.{Feedback, Zammad}
  alias Lotta.Tenants.Tenant

  describe "create_ticket/1" do
    test "successfully creates a ticket with all fields" do
      feedback = %Feedback{
        user: %Feedback.User{
          name: "Test User",
          email: "test@example.com"
        },
        tenant: %Tenant{
          title: "Test Tenant",
          slug: "test-tenant"
        },
        title: "Test Issue",
        message: "This is a test message"
      }

      Tesla.Mock.mock(fn %Tesla.Env{
                           method: :post,
                           url: "https://zammad.example.com/api/v1/tickets",
                           body: body_json
                         } ->
        body = Jason.decode!(body_json)
        assert body["title"] =~ "Test Tenant"
        assert body["group"] == "Users"
        assert body["customer_id"] == "guess:test@example.com"
        assert body["article"]["subject"] == "Test Issue"
        assert body["article"]["body"] == "This is a test message"
        assert body["article"]["type"] == "web"
        assert body["article"]["sender"] == "Customer"
        assert body["article"]["internal"] == false

        {:ok, %Tesla.Env{status: 201, body: %{"id" => 123}}}
      end)

      assert :ok = Zammad.create_ticket(feedback)
    end

    test "successfully creates a ticket without tenant" do
      feedback = %Feedback{
        user: %Feedback.User{
          name: "Test User",
          email: "test@example.com"
        },
        tenant: nil,
        title: "Test Issue",
        message: "This is a test message"
      }

      Tesla.Mock.mock(fn %Tesla.Env{
                           method: :post,
                           url: "https://zammad.example.com/api/v1/tickets",
                           body: body_json
                         } ->
        body = Jason.decode!(body_json)
        assert body["title"] == "Feedback"
        {:ok, %Tesla.Env{status: 201, body: %{"id" => 123}}}
      end)

      assert :ok = Zammad.create_ticket(feedback)
    end

    test "returns error when Zammad is not configured" do
      default_config = Application.get_env(:lotta, :zammad, [])
      Application.put_env(:lotta, :zammad, endpoint: nil, username: nil, password: nil)

      on_exit(fn ->
        Application.put_env(:lotta, :zammad, default_config)
      end)

      feedback = %Feedback{
        user: %Feedback.User{name: "Test", email: "test@example.com"},
        tenant: nil,
        title: "Test",
        message: "Test"
      }

      assert {:error, "Zammad is not enabled"} = Zammad.create_ticket(feedback)
    end

    test "returns error when endpoint is nil" do
      default_config = Application.get_env(:lotta, :zammad, [])

      Application.put_env(:lotta, :zammad,
        endpoint: nil,
        username: "user",
        password: "pass"
      )

      on_exit(fn ->
        Application.put_env(:lotta, :zammad, default_config)
      end)

      feedback = %Feedback{
        user: %Feedback.User{name: "Test", email: "test@example.com"},
        tenant: nil,
        title: "Test",
        message: "Test"
      }

      assert {:error, "Zammad is not enabled"} = Zammad.create_ticket(feedback)
    end

    test "returns error when Zammad returns 400" do
      feedback = %Feedback{
        user: %Feedback.User{name: "Test", email: "test@example.com"},
        tenant: nil,
        title: "Test",
        message: "Test"
      }

      Tesla.Mock.mock(fn %Tesla.Env{method: :post} ->
        {:ok,
         %Tesla.Env{
           status: 400,
           body: %{"error" => "Invalid request"}
         }}
      end)

      assert {:error, "Failed to create Zammad ticket: (400)"} = Zammad.create_ticket(feedback)
    end

    test "returns error when Zammad returns 500" do
      feedback = %Feedback{
        user: %Feedback.User{name: "Test", email: "test@example.com"},
        tenant: nil,
        title: "Test",
        message: "Test"
      }

      Tesla.Mock.mock(fn %Tesla.Env{method: :post} ->
        {:ok,
         %Tesla.Env{
           status: 500,
           body: %{"error" => "Internal server error"}
         }}
      end)

      assert {:error, "Failed to create Zammad ticket: (500)"} = Zammad.create_ticket(feedback)
    end

    test "returns error when Tesla request fails" do
      feedback = %Feedback{
        user: %Feedback.User{name: "Test", email: "test@example.com"},
        tenant: nil,
        title: "Test",
        message: "Test"
      }

      Tesla.Mock.mock(fn %Tesla.Env{method: :post} ->
        {:error, :timeout}
      end)

      assert {:error, :timeout} = Zammad.create_ticket(feedback)
    end

    test "returns error for unexpected response" do
      feedback = %Feedback{
        user: %Feedback.User{name: "Test", email: "test@example.com"},
        tenant: nil,
        title: "Test",
        message: "Test"
      }

      Tesla.Mock.mock(fn %Tesla.Env{method: :post} ->
        :unexpected_response
      end)

      assert {:error, :unexpected_response} = Zammad.create_ticket(feedback)
    end

    test "includes tenant information in ticket title when tenant is present" do
      feedback = %Feedback{
        user: %Feedback.User{name: "Test", email: "test@example.com"},
        tenant: %Tenant{
          title: "My School",
          slug: "my-school"
        },
        title: "Test",
        message: "Test"
      }

      Tesla.Mock.mock(fn %Tesla.Env{method: :post, body: body_json} ->
        body = Jason.decode!(body_json)
        # The title should include tenant information
        assert body["title"] =~ "My School"
        {:ok, %Tesla.Env{status: 201, body: %{}}}
      end)

      assert :ok = Zammad.create_ticket(feedback)
    end
  end

  describe "configuration handling" do
    test "handles partial configuration" do
      default_config = Application.get_env(:lotta, :zammad, [])

      Application.put_env(:lotta, :zammad,
        endpoint: "https://zammad.example.com",
        username: nil,
        password: "pass"
      )

      on_exit(fn ->
        Application.put_env(:lotta, :zammad, default_config)
      end)

      feedback = %Feedback{
        user: %Feedback.User{name: "Test", email: "test@example.com"},
        tenant: nil,
        title: "Test",
        message: "Test"
      }

      assert {:error, "Zammad is not enabled"} = Zammad.create_ticket(feedback)
    end
  end
end

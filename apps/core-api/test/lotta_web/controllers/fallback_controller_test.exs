defmodule LottaWeb.FallbackControllerTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Phoenix.ConnTest

  alias LottaWeb.FallbackController

  describe "call/2" do
    test "handles {:error, :bad_request}" do
      conn =
        build_conn()
        |> Map.put(:params, %{"_format" => "json"})

      result = FallbackController.call(conn, {:error, :bad_request})

      assert result.status == 400
    end

    test "handles {:error, :unauthorized}" do
      conn =
        build_conn()
        |> Map.put(:params, %{"_format" => "json"})

      result = FallbackController.call(conn, {:error, :unauthorized})

      assert result.status == 401
    end

    test "handles {:error, :not_found}" do
      conn =
        build_conn()
        |> Map.put(:params, %{"_format" => "json"})

      result = FallbackController.call(conn, {:error, :not_found})

      assert result.status == 404
    end

    test "handles {:error, message} with binary message" do
      conn =
        build_conn()
        |> Map.put(:params, %{"_format" => "json"})

      result = FallbackController.call(conn, {:error, "Custom error message"})

      assert result.status == 500
    end

    test "handles exception errors" do
      conn =
        build_conn()
        |> Map.put(:params, %{"_format" => "json"})

      error = %RuntimeError{message: "Something went wrong"}
      result = FallbackController.call(conn, error)

      assert result.status == 500
    end
  end
end

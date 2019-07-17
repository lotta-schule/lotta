defmodule ApiWeb.FileConversionController do
  use ApiWeb, :controller

  alias Api.Accounts
  alias Api.Accounts.FileConversion

  action_fallback ApiWeb.FallbackController

  def index(conn, _params) do
    file_conversions = Accounts.list_file_conversions()
    render(conn, "index.json", file_conversions: file_conversions)
  end

  def create(conn, %{"file_conversion" => file_conversion_params}) do
    with {:ok, %FileConversion{} = file_conversion} <- Accounts.create_file_conversion(file_conversion_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.file_conversion_path(conn, :show, file_conversion))
      |> render("show.json", file_conversion: file_conversion)
    end
  end

  def show(conn, %{"id" => id}) do
    file_conversion = Accounts.get_file_conversion!(id)
    render(conn, "show.json", file_conversion: file_conversion)
  end

  def update(conn, %{"id" => id, "file_conversion" => file_conversion_params}) do
    file_conversion = Accounts.get_file_conversion!(id)

    with {:ok, %FileConversion{} = file_conversion} <- Accounts.update_file_conversion(file_conversion, file_conversion_params) do
      render(conn, "show.json", file_conversion: file_conversion)
    end
  end

  def delete(conn, %{"id" => id}) do
    file_conversion = Accounts.get_file_conversion!(id)

    with {:ok, %FileConversion{}} <- Accounts.delete_file_conversion(file_conversion) do
      send_resp(conn, :no_content, "")
    end
  end
end

defmodule CockpitWeb.BankingApiController do
  use CockpitWeb, :controller

  alias Cockpit.Banking

  def ingest(conn, params) do
    case Banking.ingest_account_data(params) do
      {:ok, stats} ->
        json(conn, %{status: "success", stats: stats})

      {:error, :invalid_format} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{status: "error", reason: "Invalid JSON format. Expected accountInfo key."})

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{status: "error", reason: inspect(reason)})
    end
  end
end

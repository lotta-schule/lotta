defmodule Lotta.Eduplaces.IDM do
  @moduledoc """
  IDM client for Eduplaces. Get user information and schedule data.
  """
  alias Lotta.Tenants.Tenant

  @typedoc """
  Represents a group response from the IDM API.
  """
  @type group_response :: map()

  @doc since: "6.1.0"
  @spec get(path :: String.t()) ::
          {:ok, OAuth2.Response} | {:error, any()}
  def get(path) do
    Lotta.Eduplaces.ClientCredentialStrategy.client()
    |> OAuth2.Client.get(path)
    |> response_handler()
  end

  defp response_handler({:ok, %OAuth2.Response{status_code: 200, body: body}}),
    do: Jason.decode(body)

  defp response_handler({:ok, %OAuth2.Response{status_code: status, body: body}}),
    do: {:error, %{status: status, body: body}}

  defp response_handler({:error, reason}), do: {:error, reason}

  @doc """
  Get the current user's information.
  """
  @doc since: "6.1.0"
  @spec get_user(user_id :: String.t()) ::
          {:ok, map()} | {:error, any()}
  def get_user(user_id), do: get("/users/#{user_id}")

  @doc """
  List all available users.
  """
  @doc since: "6.1.0"
  @spec list_users() ::
          {:ok, list()} | {:error, any()}
  def list_users, do: get("/users")

  @doc """
  Get the school's information.
  """
  @doc since: "6.1.0"
  @spec get_school(school_id :: String.t()) ::
          {:ok, map()} | {:error, any()}
  def get_school(school_id), do: get("/school/#{school_id}")

  @doc """
  List all available schools.
  """
  @doc since: "6.1.0"
  @spec list_schools() ::
          {:ok, list()} | {:error, any()}
  def list_schools(), do: get("/schools")

  @doc """
  List all available groups for a given tenant.
  """
  @doc since: "6.1.0"
  @spec list_groups(Tenant.t()) ::
          {:ok, list(group_response())} | {:error, any()}
  def list_groups(%Tenant{eduplaces_id: school_id}), do: list_groups(school_id)

  @spec list_groups(binary()) ::
          {:ok, list(group_response())} | {:error, any()}
  def list_groups(school_id), do: get("/schools/#{school_id}/groups")
end

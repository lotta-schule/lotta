defmodule Api.DirectoryResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting directories
  """

  import Api.Accounts.Permissions

  alias ApiWeb.ErrorHelpers
  alias Api.Accounts
  alias Api.Repo
  alias UUID

  def list(%{parent_directory_id: parent_directory_id}, %{context: %{current_user: current_user}})
      when not is_nil(parent_directory_id) and byte_size(parent_directory_id) > 0 do
    parent_directory = Accounts.get_directory!(parent_directory_id)

    if user_can_read_directory?(current_user, parent_directory) do
      {:ok, Accounts.list_directories(parent_directory)}
    else
      {:error, "Du hast nicht die Berechtigung, diesen Ordner zu lesen."}
    end
  end

  def list(_, %{context: %{current_user: current_user}}) do
    {:ok, Accounts.list_root_directories(current_user)}
  end

  def get(%{id: id}, %{context: %{current_user: current_user}}) do
    directory = Accounts.get_directory(String.to_integer(id))

    cond do
      is_nil(directory) ->
        {:error, "Ordner nicht gefunden."}

      !user_can_read_directory?(current_user, directory) ->
        {:error, "Du hast nicht die Berechtigung, diesen Ordner zu lesen."}

      true ->
        {:ok, directory}
    end
  end

  def create(%{name: name, parent_directory_id: parent_directory_id}, %{
        context: %{current_user: current_user}
      })
      when is_binary(name) and not is_nil(parent_directory_id) do
    parent_directory = Accounts.get_directory(parent_directory_id)

    cond do
      is_nil(parent_directory) ->
        {:error, "Ordner nicht gefunden."}

      !user_can_write_directory?(current_user, parent_directory) ->
        {:error, "Du darfst diesen Ordner hier nicht erstellen."}

      true ->
        attrs = %{
          name: name,
          parent_directory_id: parent_directory.id,
          user_id: parent_directory.user_id
        }

        case Accounts.create_directory(attrs) do
          {:ok, directory} ->
            {:ok, directory}

          {:error, error} ->
            {:error,
             [
               "Fehler beim Anlegen des Ordners",
               details: ErrorHelpers.extract_error_details(error)
             ]}
        end
    end
  end

  def create(%{name: name, is_public: true}, %{context: %{current_user: current_user})
      when is_binary(name) do
    if user_is_admin?(current_user) do
      Accounts.create_directory(%{
        name: name,
        user_id: nil
      })
      |> case do
        {:ok, directory} ->
          {:ok, directory}

        {:error, error} ->
          {:error,
           [
             "Fehler beim Anlegen des Ordners",
             details: ErrorHelpers.extract_error_details(error)
           ]}
      end
    else
      {:error, "Du darfst diesen Ordner hier nicht erstellen."}
    end
  end

  def create(%{name: name}, %{context: %{current_user: current_user}})
      when is_binary(name) do
    attrs = %{
      name: name,
      user_id: current_user.id
    }

    case Accounts.create_directory(attrs) do
      {:ok, directory} ->
        {:ok, directory}

      {:error, error} ->
        {:error,
         [
           "Fehler beim Anlegen des Ordners",
           details: ErrorHelpers.extract_error_details(error)
         ]}
    end
  end

  def create(_, %{context: %{current_user: _}}),
    do: {:error, "Der Name für den neuen Ordner ist ungültig."}

  def create(_, _), do: {:error, "Nur angemeldete Nutzer dürfen Ordner erstellen."}

  def delete(%{id: id}, %{context: %{current_user: current_user}}) do
    directory = Accounts.get_directory(String.to_integer(id))

    cond do
      is_nil(directory) ->
        {:error, "Ordner nicht gefunden."}

      !user_can_write_directory?(current_user, directory) ->
        {:error, "Du darfst diesen Ordner nicht löschen."}

      directory
      |> Repo.preload([:directories, :files])
      |> Map.take([:directories, :files])
      |> Map.values()
      |> List.flatten()
      |> Kernel.length() > 0 ->
        {:error, "Es dürfen nur leere Ordner gelöscht werden."}

      true ->
        directory
        |> Accounts.delete_directory()
    end
  end

  def update(%{id: id, parent_directory_id: parent_directory_id}, _)
      when id == parent_directory_id do
    {:error, "Du kannst diesen Ordner nicht hierher verschieben."}
  end

  def update(%{id: id} = args, %{context: %{current_user: current_user}}) do
    try do
      directory =
        Accounts.get_directory!(String.to_integer(id))
        |> Repo.preload([:parent_directory])

      source_directory = directory.parent_directory

      target_directory =
        case args do
          %{parent_directory_id: target_directory_id} when is_nil(target_directory_id) ->
            nil

          %{parent_directory_id: target_directory_id} ->
            Accounts.get_directory!(String.to_integer(target_directory_id))

          _ ->
            source_directory
        end

      if user_can_write_directory?(current_user, source_directory || directory) &&
           user_can_write_directory?(current_user, target_directory || directory) do
        Accounts.update_directory(directory, Map.take(args, [:name, :parent_directory_id]))
        |> case do
          {:ok, directory} ->
            {:ok, directory}

          {:error, error} ->
            {:error,
             [
               "Fehler beim Bearbeiten des Ordners",
               details: ErrorHelpers.extract_error_details(error)
             ]}
        end
      else
        {:error, "Du darfst diesen Ordner nicht bearbeiten."}
      end
    rescue
      Ecto.NoResultsError ->
        {:error, "Datei oder Ordner nicht gefunden."}
    end
  end
end

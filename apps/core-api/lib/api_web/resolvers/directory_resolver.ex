defmodule ApiWeb.DirectoryResolver do
  @moduledoc false

  import ApiWeb.ErrorHelpers
  import Api.Accounts.Permissions

  alias ApiWeb.Context
  alias Api.Accounts
  alias Api.Accounts.User
  alias Api.Repo

  def list(%{parent_directory_id: parent_directory_id}, %{
        context: %Context{current_user: current_user}
      })
      when not is_nil(parent_directory_id) and bit_size(parent_directory_id) > 0 do
    parent_directory = Accounts.get_directory(parent_directory_id)

    cond do
      is_nil(parent_directory) ->
        {:error, "Ordner mit der id #{parent_directory_id} nicht gefunden."}

      not can_read?(current_user, parent_directory) ->
        {:error, "Du hast nicht die Rechte, diesen Ordner anzusehen."}

      true ->
        {:ok, Accounts.list_directories(parent_directory)}
    end
  end

  def list(_, %{context: %Context{current_user: current_user}}) do
    {:ok, Accounts.list_root_directories(current_user)}
  end

  def get(%{id: id}, %{context: %Context{current_user: current_user}}) do
    directory = Accounts.get_directory(String.to_integer(id))

    cond do
      is_nil(directory) ->
        {:error, "Ordner mit der id #{id} nicht gefunden."}

      not can_read?(current_user, directory) ->
        {:error, "Du hast nicht die Rechte, diesen Ordner anzusehen."}

      true ->
        {:ok, directory}
    end
  end

  def create(%{name: name}, _info) when not is_binary(name) and bit_size(name) > 0 do
    {:error, "Der Name für den neuen Ordner ist ungültig."}
  end

  def create(%{name: name, parent_directory_id: parent_directory_id}, %{
        context: %Context{current_user: current_user}
      })
      when not is_nil(parent_directory_id) do
    parent_directory = Accounts.get_directory(parent_directory_id)

    cond do
      is_nil(parent_directory) ->
        {:error, "Ordner mit der id #{parent_directory_id} nicht gefunden."}

      !can_write?(current_user, parent_directory) ->
        {:error, "Du hast nicht die Rechte, diesen Ordner zu beschreiben."}

      true ->
        Accounts.create_directory(%{
          name: name,
          parent_directory_id: parent_directory.id,
          user_id: parent_directory.user_id
        })
        |> format_errors("Erstellen des Ordners fehlgeschlagen")
    end
  end

  def create(%{name: name, is_public: true}, %{
        context: %Context{current_user: %User{is_admin?: true}}
      }) do
    Accounts.create_directory(%{
      name: name,
      user_id: nil
    })
    |> format_errors("Erstellen des Ordners fehlgeschlagen.")
  end

  def create(%{name: _name, is_public: true}, %{
        context: %Context{current_user: %User{is_admin?: false}}
      }) do
    {:error, "Du hast nicht die Rechte, diesen Ordner zu beschreiben."}
  end

  def create(%{name: name}, %{context: %Context{current_user: %{id: user_id}}}) do
    Accounts.create_directory(%{
      name: name,
      user_id: user_id
    })
    |> format_errors("Erstellen des Ordners fehlgeschlagen.")
  end

  def update(%{id: id, parent_directory_id: parent_directory_id}, _)
      when id == parent_directory_id do
    {:error, "Du kannst diesen Ordner nicht hierher verschieben."}
  end

  def update(%{id: id} = args, %{context: %Context{current_user: current_user}}) do
    directory = Accounts.get_directory(String.to_integer(id))

    if directory do
      directory =
        directory
        |> Repo.preload([:parent_directory])

      source_directory =
        directory
        |> Map.fetch!(:parent_directory)

      target_directory =
        case args do
          %{parent_directory_id: nil} ->
            nil

          %{parent_directory_id: target_directory_id} ->
            Accounts.get_directory(String.to_integer(target_directory_id))

          _ ->
            source_directory
        end

      if can_write?(current_user, source_directory || directory) &&
           can_write?(current_user, target_directory || directory) do
        directory
        |> Accounts.update_directory(Map.take(args, [:name, :parent_directory_id]))
        |> format_errors("Bearbeiten des Ordners fehlgeschlagen.")
      else
        {:error, "Du hast nicht die Rechte, diesen Ordner zu beschreiben."}
      end
    else
      {:error, "Ordner mit der id #{id} nicht gefunden."}
    end
  end

  def delete(%{id: id}, %{context: %Context{current_user: current_user}}) do
    directory = Accounts.get_directory(String.to_integer(id))

    cond do
      is_nil(directory) ->
        {:error, "Ordner mit der id #{id} nicht gefunden."}

      not can_write?(current_user, directory) ->
        {:error, "Du hast nicht die Rechte, diesen Ordner zu löschen."}

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
        |> format_errors("Erstellen des Ordners fehlgeschlagen")
    end
  end
end

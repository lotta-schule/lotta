defmodule Api.DirectoryResolver do
  use Api.ReadRepoAliaser
  alias Api.Accounts
  alias Api.Accounts.User
  alias Repo
  alias UUID

  def list(%{parent_directory_id: parent_directory_id}, %{context: %{current_user: current_user}}) when is_integer(parent_directory_id) do
    parent_directory = Accounts.get_directory!(parent_directory_id)
    if User.can_read_directory?(current_user, parent_directory) do
      {:ok, Accounts.list_directories(parent_directory)}
    else
      {:error, "Du hast nicht die Berechtigung, diesen Ordner zu lesen."}
    end
  end
  def list(_, %{context: %{current_user: current_user, tenant: tenant}}) do
    {:ok, Accounts.list_root_directories(tenant, current_user)}
  end

  def get(%{id: id}, %{context: %{current_user: current_user}}) when is_integer(id) do
    directory = Accounts.get_directory(id)
    cond do
      is_nil(directory) ->
        {:error, "Ordner nicht gefunden."}
      !User.can_read_directory?(current_user, directory) ->
        {:error, "Du hast nicht die Berechtigung, diesen Ordner zu lesen."}
      true ->
        {:ok, directory}
    end
  end

  def create(%{name: name, parent_directory_id: parent_directory_id}, %{context: %{current_user: current_user}}) when is_binary(name) and is_integer(parent_directory_id) do
    parent_directory = Accounts.get_directory(parent_directory_id)
    cond do
      is_nil(parent_directory) ->
        {:error, "Ordner nicht gefunden."}
      !User.can_write_directory?(current_user, parent_directory) ->
        {:error, "Du darfst diesen Ordner hier nicht erstellen."}
      true ->
        Accounts.create_directory(%{
          name: name,
          parent_directory_id: parent_directory.id,
          user_id: parent_directory.user_id,
          tenant_id: parent_directory.tenant_id
        })
        |> output_create_result()
    end
  end
  def create(%{name: name, is_public: true}, %{context: %{current_user: current_user, tenant: tenant}}) when is_binary(name) do
    cond do
      !User.is_admin?(current_user, tenant) ->
        {:error, "Du darfst diesen Ordner hier nicht erstellen."}
      true ->
        Accounts.create_directory(%{
          name: name,
          user_id: nil,
          tenant_id: tenant.id
        })
        |> output_create_result()
    end
  end
  def create(%{name: name}, %{context: %{current_user: current_user, tenant: tenant}}) when is_binary(name) do
    Accounts.create_directory(%{
      name: name,
      user_id: current_user.id,
      tenant_id: tenant.id
    })
    |> output_create_result()
  end
  def create(_, %{context: %{current_user: _, tenant: _}}), do: {:error, "Der Name für den neuen Ordner ist ungültig."}
  def create(_, _), do: {:error, "Nur angemeldete Nutzer dürfen Ordner erstellen."}

  defp output_create_result({:error, changeset}), do: {:error, message: "Fehler beim Erstellen des Ordners", details: error_details(changeset)}
  defp output_create_result(result), do: result

  def delete(%{id: id}, %{context: %{current_user: current_user}}) when is_integer(id) do
    directory = Accounts.get_directory(id)
    cond do
      is_nil(directory) ->
        {:error, "Ordner nicht gefunden."}
      !User.can_write_directory?(current_user, directory) ->
        {:error, "Du darfst diesen Ordner nicht löschen."}
      directory
      |> ReadRepo.preload([:directories, :files])
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

  def update(%{id: id, parent_directory_id: parent_directory_id}, _) when is_integer(id) and is_integer(parent_directory_id) and id == parent_directory_id do
    {:error, "Du kannst diesen Ordner nicht hierher verschieben."}
  end
  def update(%{id: id} = args, %{context: %{current_user: current_user}}) do
    try do
      directory =
        Accounts.get_directory!(id)
        |> ReadRepo.preload([:tenant, :parent_directory])
      source_directory = directory.parent_directory
      target_directory =
        with %{parent_directory_id: target_directory_id} <- args do
          if is_nil(target_directory_id), do: nil, else: Accounts.get_directory!(target_directory_id)
        else
          _ ->
            source_directory
        end
      if User.can_write_directory?(current_user, source_directory || directory) && User.can_write_directory?(current_user, target_directory || directory) do
        Accounts.update_directory(directory, Map.take(args, [:name, :parent_directory_id]))
        |> case do
          {:error, changeset} ->
            {
              :error,
              message: "Fehler beim Speichern des Ordners",
              details: error_details(changeset)
            }
          result ->
            result
        end
      else
        {:error, "Du darfst diesen Ordner nicht bearbeiten."}        
      end
    rescue
      Ecto.NoResultsError ->
        {:error, "Datei oder Ordner nicht gefunden."}
    end
  end

  defp error_details(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(&ApiWeb.ErrorHelpers.translate_error/1)
  end

end
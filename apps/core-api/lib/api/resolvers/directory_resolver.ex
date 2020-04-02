defmodule Api.DirectoryResolver do
  use Api.ReadRepoAliaser
  alias Api.Accounts
  alias Api.Accounts.{Directory,User}
  alias Api.Tenants.Tenant
  alias Api.UploadService
  alias Api.MediaConversionPublisherWorker
  alias Repo
  alias UUID

  def list(%{parent_directory_id: parent_directory_id}, %{context: %{current_user: current_user, tenant: tenant}}) when is_integer(parent_directory_id) do
    parent_directory = Accounts.get_directory!(parent_directory_id)
    {:ok, Accounts.list_directories(parent_directory)}
  end
  def list(_, %{context: %{current_user: current_user, tenant: tenant}}) do
    {:ok, Accounts.list_root_directories(tenant, current_user)}
  end

  def get(%{id: id}, %{context: %{context: %{current_user: current_user, tenant: tenant}}}) when is_integer(id) do
    directory =
      Accounts.get_directory(id)
      |> ReadRepo.preload([:user, :tenant])
    if directory.user != nil && directory.user.id == current_user.id do
      directory
    else
      {:error, "Du darfst diesen Ordner nicht abrufen."}
    end
  end

  def create(%{name: name, parent_directory_id: parent_directory_id}, %{context: %{current_user: current_user, tenant: tenant}}) when is_binary(name) and is_integer(parent_directory_id) do
    case Accounts.get_directory(parent_directory_id) do
      nil ->
        {:error, "Ordner wurde nicht gefunden."}
      directory ->
        directory = ReadRepo.preload(directory, [:user, :tenant])
        if directory.user.id != current_user.id || directory.tenant.id != tenant.id do
          {:error, "Du darfst diesen Ordner hier nicht erstellen."}
        else
          Accounts.create_directory(%{
            name: name,
            parent_directory_id: directory.id,
            user_id: current_user.id,
            tenant_id: tenant.id
          })
        end
    end
  end
  def create(%{name: name}, %{context: %{current_user: current_user, tenant: tenant}}) when is_binary(name) do
    Accounts.create_directory(%{
      name: name,
      user_id: current_user.id,
      tenant_id: tenant.id
    })
  end
  def create(_, %{context: %{current_user: _, tenant: _}}), do: {:error, "Der Name für den neuen Ordner ist ungültig."}
  def create(_, _), do: {:error, "Nur angemeldete Nutzer dürfen Ordner erstellen."}

  def update(%{id: id} = args, %{context: %{current_user: current_user}}) do
    try do
      directory =
        Accounts.get_directory!(id)
        |> ReadRepo.preload([:tenant, :parent_directory])
      source_directory = directory.parent_directory
      target_directory =
        with %{parent_directory_id: target_directory_id} <- args do
          Accounts.get_directory!(target_directory_id)
        else
          _ ->
            source_directory
        end
      if User.can_write_directory?(current_user, source_directory || directory) && User.can_write_directory?(current_user, target_directory || directory) do
        Accounts.update_directory(directory, Map.take(args, [:name, :parent_directory_id]))
      else
        {:error, "Du darfst diesen Ordner nicht verschieben."}        
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
defmodule Api.Repo.Migrations.CreateTableDirectories do
  use Ecto.Migration
  import Ecto.Query

  def up do
    create table(:directories) do
      add(:parent_directory_id, references(:directories, on_delete: :delete_all))
      add(:name, :string)
      add(:user_id, references(:users, on_delete: :nothing))
      add(:tenant_id, references(:tenants, on_delete: :nothing))
      add(:group_id, references(:user_groups, on_delete: :nothing))

      timestamps()
    end

    alter table(:files) do
      add(:parent_directory_id, references(:directories, on_delete: :delete_all))
    end

    create(index(:directories, [:user_id, :tenant_id]))
    create(index(:directories, [:user_id, :tenant_id, :parent_directory_id]))
    create(index(:directories, [:group_id]))
    create(index(:directories, [:parent_directory_id]))

    create(unique_index(:directories, [:name, :parent_directory_id, :user_id, :tenant_id]))

    create(index(:files, [:parent_directory_id]))

    flush()

    tenants = Api.Repo.all(from(t in Api.Tenants.Tenant))

    Api.Repo.all(from(u in Api.Accounts.User))
    |> Enum.map(fn user ->
      Enum.map(tenants, fn tenant ->
        Enum.map(
          [
            %Api.Accounts.Directory{name: "Mein Profil", user_id: user.id, tenant_id: tenant.id},
            %Api.Accounts.Directory{name: "Meine Bilder", user_id: user.id, tenant_id: tenant.id},
            %Api.Accounts.Directory{
              name: "Meine Dokumente",
              user_id: user.id,
              tenant_id: tenant.id
            },
            %Api.Accounts.Directory{name: "Meine Videos", user_id: user.id, tenant_id: tenant.id},
            %Api.Accounts.Directory{
              name: "Meine Tondokumente",
              user_id: user.id,
              tenant_id: tenant.id
            }
          ],
          &Api.Repo.insert!/1
        )
      end)
    end)

    Enum.map(tenants, fn tenant ->
      Api.Repo.insert!(%Api.Accounts.Directory{name: "schulweite Dateien", tenant_id: tenant.id})
    end)

    Api.Repo.all(
      from(f in Api.Accounts.File,
        select: %{
          id: f.id,
          is_public: f.is_public,
          tenant_id: f.tenant_id,
          file_type: f.file_type,
          user_id: f.user_id
        }
      )
    )
    |> Enum.map(fn file ->
      root_directory =
        if file.is_public do
          Api.Repo.one!(
            from(d in Api.Accounts.Directory,
              where:
                d.tenant_id == ^file.tenant_id and is_nil(d.user_id) and
                  d.name == "schulweite Dateien"
            )
          )
        else
          file_type =
            case file.file_type do
              "image" ->
                "Meine Bilder"

              "video" ->
                "Meine Videos"

              "audio" ->
                "Meine Tondokumente"

              _ ->
                "Meine Dokumente"
            end

          Api.Repo.one!(
            from(d in Api.Accounts.Directory,
              where:
                d.tenant_id == ^file.tenant_id and d.user_id == ^file.user_id and
                  d.name == ^file_type
            )
          )
        end

      parent_directory =
        file.path
        |> String.split("/")
        |> Enum.filter(&(String.length(&1) > 0))
        |> Enum.reduce(root_directory, fn dirname, parent_directory ->
          query =
            from(d in Api.Accounts.Directory)
            |> where([d], d.name == ^dirname and d.tenant_id == ^file.tenant_id)
            |> (fn query ->
                  query =
                    case file.is_public do
                      true -> where(query, [d], is_nil(d.user_id))
                      false -> where(query, [d], not is_nil(d.user_id))
                    end

                  query =
                    case parent_directory do
                      %{id: parent_directory_id} ->
                        where(query, [d], d.parent_directory_id == ^parent_directory_id)

                      _ ->
                        where(query, [d], is_nil(d.parent_directory_id))
                    end

                  query
                end).()

          case Api.Repo.one(query) do
            nil ->
              Api.Repo.insert!(%Api.Accounts.Directory{
                parent_directory_id: parent_directory.id,
                name: dirname,
                tenant_id: file.tenant_id,
                user_id: if(file.is_public == true, do: nil, else: file.user_id)
              })

            dir ->
              dir
          end
        end)

      file
      |> Ecto.Changeset.change(parent_directory_id: parent_directory.id)
      |> Api.Repo.update()
    end)
  end

  def down do
    drop(index(:files, [:parent_directory_id]))

    alter table(:files) do
      remove(:parent_directory_id)
    end

    drop(table(:directories))
  end
end

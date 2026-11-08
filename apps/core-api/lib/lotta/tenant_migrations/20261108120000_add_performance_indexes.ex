defmodule Lotta.Repo.TenantMigrations.AddPerformanceIndexes do
  @moduledoc false

  # - RemoveTenantColumns (20200823093017) dropped `tenant_id` from `files` and
  #   `directories`, and Postgres silently dropped every index containing it,
  #   which left `files.user_id` and `directories.user_id` unindexed.
  # - `enrollment_tokens` is queried with the array overlap operator (`&&`),
  #   which a btree index cannot serve; a GIN index can.
  # - Published article listings filter on `published` and sort by `updated_at`.

  use Ecto.Migration

  def up do
    create_if_not_exists(index(:files, [:user_id]))
    create_if_not_exists(index(:directories, [:user_id, :parent_directory_id]))

    drop_if_exists(index(:user_groups, [:enrollment_tokens]))
    create(index(:user_groups, [:enrollment_tokens], using: "GIN"))

    drop_if_exists(index(:users, [:enrollment_tokens]))
    create(index(:users, [:enrollment_tokens], using: "GIN"))

    create_if_not_exists(
      index(:articles, [:published, "updated_at DESC"],
        name: :articles_published_updated_at_index
      )
    )

    create_if_not_exists(
      index(:articles, [:category_id, :published, "updated_at DESC"],
        name: :articles_category_id_published_updated_at_index
      )
    )
  end

  def down do
    drop_if_exists(
      index(:articles, [:category_id, :published, :updated_at],
        name: :articles_category_id_published_updated_at_index
      )
    )

    drop_if_exists(
      index(:articles, [:published, :updated_at], name: :articles_published_updated_at_index)
    )

    drop_if_exists(index(:users, [:enrollment_tokens]))
    create(index(:users, [:enrollment_tokens]))

    drop_if_exists(index(:user_groups, [:enrollment_tokens]))
    create(index(:user_groups, [:enrollment_tokens]))

    drop_if_exists(index(:directories, [:user_id, :parent_directory_id]))
    drop_if_exists(index(:files, [:user_id]))
  end
end

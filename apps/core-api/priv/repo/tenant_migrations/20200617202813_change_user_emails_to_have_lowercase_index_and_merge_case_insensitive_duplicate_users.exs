defmodule Lotta.Repo.TenantMigrations.ChangeUserEmailsToHaveLowercaseIndex do
  use Ecto.Migration
  import Ecto.Query
  alias Lotta.Repo
  alias Lotta.Accounts.User

  def up do
    # Bevor we can add the index, we have to merge all the users
    # who are case-insensitive-doubles
    {:ok, %{rows: duplicates}} =
      Lotta.Repo.query("""
        SELECT id, nickname, name, inserted_at, email, last_seen FROM #{prefix()}.users  WHERE UPPER(email) IN (
          SELECT UPPER(email) FROM #{prefix()}.users GROUP BY UPPER(email) HAVING COUNT(*) > 1
        ) ORDER BY UPPER(email), last_seen DESC;
      """)

    users_grouped =
      duplicates
      |> Enum.map(fn [id | _others] ->
        Lotta.Repo.get!(User, id)
      end)
      |> Enum.group_by(&String.downcase(&1.email))
      |> Map.values()

    Enum.map(users_grouped, fn users ->
      [keep_user | del_users] =
        users
        |> Enum.sort_by(fn %{last_seen: last_seen, updated_at: updated_at} ->
          d = last_seen || updated_at
          {d.year, d.month, d.day, d.hour, d.minute, d.second}
        end)
        |> Enum.reverse()

      IO.inspect("Accounts von #{keep_user.email} werden zusammengeführt ...")

      IO.inspect(
        "Es werden dafür die Accounts #{Enum.join(Enum.map(del_users, & &1.email), ", ")} entfernt," <>
          "aber ihre Formulareingaben, Beiträge, Dateien und Ordner, Gruppenzugehörigkeiten und Einschreibeschlüssel zusammengeführt."
      )

      del_users = Enum.map(del_users, & &1.id)

      {n, _} =
        Repo.update_all(
          from(repo in "content_module_results",
            where: repo.user_id in ^del_users
          ),
          set: [user_id: keep_user.id]
        )

      IO.puts("removed #{n} content_module_results")

      {n, _} =
        Repo.update_all(
          from(repo in "blocked_tenants",
            where: repo.user_id in ^del_users
          ),
          set: [user_id: keep_user.id]
        )

      IO.puts("removed #{n} blocked_tenants")

      # Must take care not to add a same user twice to an article, so first getting the valid user's articles
      keepers_article_ids =
        Repo.all(
          from(repo in "article_users",
            select: repo.article_id,
            where: repo.user_id == ^keep_user.id
          )
        )

      {n, _} =
        Repo.update_all(
          from(repo in "article_users",
            where: repo.user_id in ^del_users and repo.article_id not in ^keepers_article_ids
          ),
          set: [user_id: keep_user.id]
        )

      IO.puts("removed #{n} article_users")

      {files_count, _} =
        Repo.update_all(
          from(repo in "files",
            where: repo.user_id in ^del_users
          ),
          set: [user_id: keep_user.id]
        )

      IO.puts("removed #{files_count} files")

      if files_count > 0 do
        {n, _} =
          Repo.update_all(
            from(repo in "directories",
              where: repo.user_id in ^del_users
            ),
            set: [user_id: keep_user.id]
          )

        IO.puts("removed #{n} directories")
      end

      # Same as with articles, make sure not to add someone twice
      keepers_user_groups =
        Repo.all(
          from(repo in "user_user_group",
            select: repo.user_group_id,
            where: repo.user_id == ^keep_user.id
          )
        )

      {n, _} =
        Repo.update_all(
          from(repo in "user_user_group",
            where: repo.user_id in ^del_users and repo.user_group_id not in ^keepers_user_groups
          ),
          set: [user_id: keep_user.id]
        )

      IO.puts("removed #{n} user_user_group")

      # Same as with articles, make sure not to add someone twice
      keepers_user_enrollment_tokens =
        Repo.all(
          from(repo in "users_enrollment_tokens",
            select: repo.enrollment_token,
            where: repo.user_id == ^keep_user.id
          )
        )

      {n, _} =
        Repo.update_all(
          from(repo in "users_enrollment_tokens",
            where:
              repo.user_id in ^del_users and
                repo.enrollment_token not in ^keepers_user_enrollment_tokens
          ),
          set: [user_id: keep_user.id]
        )

      IO.puts("removed #{n} users_enrollment_tokens")

      # now remove every instance of one of the three model that COULD have been left over
      Repo.delete_all(from(repo in "article_users", where: repo.user_id in ^del_users))
      Repo.delete_all(from(repo in "user_user_group", where: repo.user_id in ^del_users))
      Repo.delete_all(from(repo in "users_enrollment_tokens", where: repo.user_id in ^del_users))

      IO.inspect("Now delete the users")
      Repo.delete_all(from(repo in "directories", where: repo.user_id in ^del_users))
      Repo.delete_all(from(u in User, where: u.id in ^del_users))
      IO.inspect("done.")
    end)

    flush()

    drop(unique_index(:users, [:email]))
    create(unique_index(:users, ["(lower(email))"], name: "users__lower_email_index"))
  end

  def down do
    drop(unique_index(:users, ["(lower(email))"], name: "users__lower_email_index"))
    create(unique_index(:users, [:email]))
  end
end

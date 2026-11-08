defmodule Lotta.BatchedLoadingTest do
  @moduledoc "Results of the batched loaders used by the GraphQL resolvers."

  use Lotta.DataCase, async: false

  import Lotta.Factory

  alias Lotta.{Accounts, Repo, Storage}
  alias Lotta.Accounts.UserGroup
  alias Lotta.Worker.Conversion

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)
    :ok
  end

  describe "Storage.get_paths/3" do
    test "matches get_path/2 for files and directories at different depths" do
      user = insert(:user)
      root = insert(:directory, user_id: user.id)
      child = insert(:directory, user_id: user.id, parent_directory_id: root.id)
      grandchild = insert(:directory, user_id: user.id, parent_directory_id: child.id)

      items = [
        insert(:file, user_id: user.id, parent_directory_id: grandchild.id),
        insert(:file, user_id: user.id, parent_directory_id: root.id),
        grandchild,
        root
      ]

      paths = Storage.get_paths(items, user.id, @prefix)

      for item <- items do
        assert Enum.map(paths[{item.__struct__, item.id}], & &1.id) ==
                 Enum.map(Storage.get_path(item, user), & &1.id)
      end

      assert Enum.map(paths[{Storage.File, hd(items).id}], & &1.id) ==
               [root.id, child.id, grandchild.id]

      assert paths[{Storage.Directory, root.id}] == []
    end

    test "stops at another user's private directory" do
      owner = insert(:user)
      other = insert(:user)
      private = insert(:directory, user_id: owner.id)
      public = insert(:directory, parent_directory_id: private.id)
      file = insert(:file, user_id: other.id, parent_directory_id: public.id)

      paths = Storage.get_paths([file], other.id, @prefix)

      assert Enum.map(paths[{Storage.File, file.id}], & &1.id) == [public.id]
    end

    test "rejects prefixes that are not plain identifiers" do
      file = insert(:file, parent_directory_id: insert(:directory).id)

      assert_raise ArgumentError, fn ->
        Storage.get_paths([file], nil, ~s(tenant_test"; drop table users; --))
      end
    end
  end

  describe "Accounts.list_user_groups/1 and list_groups_for_users/2" do
    setup do
      assigned = insert(:group, enrollment_tokens: [])
      by_token = insert(:group, enrollment_tokens: ["token-a"])
      both = insert(:group, enrollment_tokens: ["token-b"])
      unrelated = insert(:group, enrollment_tokens: ["token-x"])

      user =
        insert(:user, enrollment_tokens: ["token-a", "token-b"])
        |> Repo.preload(:groups)
        |> Ecto.Changeset.change()
        |> Ecto.Changeset.put_assoc(:groups, [assigned, both])
        |> Repo.update!()
        |> Map.put(:groups, %Ecto.Association.NotLoaded{})

      {:ok, user: user, assigned: assigned, by_token: by_token, both: both, unrelated: unrelated}
    end

    test "returns assigned and enrollment-token groups, each group once", ctx do
      {assigned, all} = Accounts.list_user_groups(ctx.user)

      assert ids(assigned) == ids([ctx.assigned, ctx.both])
      assert ids(all) == ids([ctx.assigned, ctx.by_token, ctx.both])
    end

    test "loads the groups of many users at once", ctx do
      user_without_groups = insert(:user, enrollment_tokens: [])

      result = Accounts.list_groups_for_users([ctx.user, user_without_groups, ctx.user], @prefix)

      assert ids(result[ctx.user.id].assigned) == ids([ctx.assigned, ctx.both])
      assert ids(result[ctx.user.id].dynamic) == ids([ctx.by_token, ctx.both])
      assert result[user_without_groups.id] == %{assigned: [], dynamic: []}
    end
  end

  describe "Conversion.get_current_jobs_for_files/1" do
    test "returns the unfinished conversion jobs per file" do
      [file1, file2, file3] = for _ <- 1..3, do: insert(:file)

      insert_job(file1, "available")
      insert_job(file1, "completed")
      insert_job(file2, "executing")

      jobs = Conversion.get_current_jobs_for_files([file1, file2, file3])

      assert [%{state: "available"}] = jobs[file1.id]
      assert [%{state: "executing"}] = jobs[file2.id]
      refute Map.has_key?(jobs, file3.id)
    end
  end

  defp ids(groups), do: groups |> Enum.map(& &1.id) |> Enum.sort()

  defp insert_job(file, state) do
    %{"prefix" => @prefix, "file_id" => file.id, "format_category" => "videoplay"}
    |> Oban.Job.new(worker: Conversion, queue: :media_conversion)
    |> Ecto.Changeset.put_change(:state, state)
    |> Repo.insert!(prefix: "oban")
  end
end

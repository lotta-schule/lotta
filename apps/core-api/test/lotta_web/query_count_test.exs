defmodule LottaWeb.QueryCountTest do
  @moduledoc """
  N+1 regression tests: the number of database queries of a GraphQL request
  must not grow with the number of rows in the response.
  """

  use LottaWeb.ConnCase, async: false

  import Ecto.Query
  import Lotta.Factory

  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Content.ArticleReaction
  alias Lotta.Storage.RemoteStorageEntity
  alias LottaWeb.Auth.AccessToken

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    admin =
      Repo.one!(from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: @prefix
      )

    {:ok, jwt, _} = AccessToken.encode_and_sign(admin, %{tid: tenant.id})
    groups = Repo.all(from(g in UserGroup, limit: 2), prefix: @prefix)

    {:ok, admin: admin, jwt: jwt, groups: groups}
  end

  describe "page data" do
    @query """
    query PageData($categoryId: ID) {
      currentUser { id groups { id } assignedGroups { id } }
      categories { id groups { id } widgets { id groups { id } } }
      articles(categoryId: $categoryId) { id groups { id } reactionCounts { type count } }
    }
    """

    test "categories, widgets, articles and reactions are batched", ctx do
      home = insert(:homepage_category, groups: ctx.groups)

      seed = fn count ->
        for _ <- 1..count do
          insert(:category, groups: ctx.groups, widgets: [insert(:widget, groups: ctx.groups)])
          article = insert(:article, category: home, groups: ctx.groups)

          Repo.insert!(
            %ArticleReaction{article_id: article.id, user_id: ctx.admin.id, type: "HEART"},
            prefix: @prefix
          )
        end
      end

      variables = %{categoryId: to_string(home.id)}

      seed.(2)
      {few, data} = count_queries(ctx.jwt, @query, variables)
      assert length(data["articles"]) == 2

      seed.(8)
      {many, data} = count_queries(ctx.jwt, @query, variables)
      assert length(data["articles"]) == 10

      assert Enum.all?(
               data["articles"],
               &(&1["reactionCounts"] == [%{"type" => "HEART", "count" => 1}])
             )

      # (The first request can make one more query: it updates the user's last_seen.)
      assert many <= few
    end
  end

  describe "user lists" do
    @query """
    query SearchUsers($groups: [SelectUserGroupInput]) {
      searchUsers(groups: $groups) { id groups { id } assignedGroups { id } }
    }
    """

    test "groups of other users are batched", %{groups: [group | _]} = ctx do
      variables = %{groups: [%{id: to_string(group.id)}]}

      seed = fn count ->
        for _ <- 1..count do
          user = insert(:user)
          {:ok, _} = Lotta.Accounts.update_user(user, %{groups: [group]})
        end
      end

      seed.(2)
      {few, data} = count_queries(ctx.jwt, @query, variables)
      seed.(8)
      {many, more_data} = count_queries(ctx.jwt, @query, variables)

      assert length(more_data["searchUsers"]) == length(data["searchUsers"]) + 8
      # (The first request can make one more query: it updates the user's last_seen.)
      assert many <= few
    end
  end

  describe "file lists" do
    @query """
    query Files($dir: ID) {
      files(parentDirectoryId: $dir) {
        id path { id } remoteLocation formats { name } usage { __typename }
      }
      directories(parentDirectoryId: $dir) { id path { id } }
    }
    """

    test "path, remote location, formats and usage are batched", ctx do
      root = insert(:directory, user_id: ctx.admin.id)
      parent = insert(:directory, user_id: ctx.admin.id, parent_directory_id: root.id)

      seed = fn count ->
        for i <- 1..count do
          insert(:directory, user_id: ctx.admin.id, parent_directory_id: parent.id)

          entity =
            Repo.insert!(%RemoteStorageEntity{store_name: "minio", path: "count/#{i}"},
              prefix: @prefix
            )

          {file_type, mime_type} =
            if rem(i, 2) == 0, do: {"video", "video/mp4"}, else: {"image", "image/jpeg"}

          insert(:file,
            user_id: ctx.admin.id,
            parent_directory_id: parent.id,
            remote_storage_entity_id: entity.id,
            file_type: file_type,
            mime_type: mime_type
          )
        end
      end

      variables = %{dir: parent.id}

      seed.(2)
      {few, data} = count_queries(ctx.jwt, @query, variables)

      assert Enum.all?(
               data["files"],
               &(Enum.map(&1["path"], fn d -> d["id"] end) == [root.id, parent.id])
             )

      seed.(8)
      {many, data} = count_queries(ctx.jwt, @query, variables)
      assert length(data["files"]) == 10

      # (The first request can make one more query: it updates the user's last_seen.)
      assert many <= few
    end
  end

  defp count_queries(jwt, query, variables) do
    test_pid = self()
    handler_id = {__MODULE__, make_ref()}

    :telemetry.attach(
      handler_id,
      [:lotta, :repo, :query],
      fn _event, _measurements, _meta, _config -> send(test_pid, :query) end,
      nil
    )

    res =
      build_conn()
      |> put_req_header("tenant", "slug:test")
      |> put_req_header("authorization", "Bearer #{jwt}")
      |> post("/api", query: query, variables: variables)
      |> json_response(200)

    :telemetry.detach(handler_id)
    refute res["errors"], inspect(res["errors"])

    {drain_queries(0), res["data"]}
  end

  defp drain_queries(count) do
    receive do
      :query -> drain_queries(count + 1)
    after
      0 -> count
    end
  end
end

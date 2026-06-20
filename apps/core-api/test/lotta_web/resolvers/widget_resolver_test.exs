defmodule LottaWeb.WidgetResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase, async: true

  import Ecto.Query
  import Lotta.Factory

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.UserGroup

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    admin = insert(:admin_user)

    lehrer_group =
      Repo.one!(from(g in UserGroup, where: g.name == ^"Lehrer"), prefix: tenant.prefix)

    verwaltung_group =
      Repo.one!(from(g in UserGroup, where: g.name == ^"Verwaltung"), prefix: tenant.prefix)

    schueler_group =
      Repo.one!(from(g in UserGroup, where: g.name == ^"Schüler"), prefix: tenant.prefix)

    user = insert(:user) |> with_groups([lehrer_group])

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)
    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    homepage = insert(:homepage_category)

    widget1 = insert(:widget, title: "Kalender", type: "calendar")

    widget2 =
      insert(:widget, title: "Kalender", type: "calendar")
      |> with_groups([verwaltung_group, lehrer_group])

    widget3 =
      insert(:widget, title: "Kalender", type: "calendar")
      |> with_groups([verwaltung_group, lehrer_group])

    homepage
    |> Repo.preload(:widgets)
    |> Ecto.Changeset.change()
    |> Ecto.Changeset.put_assoc(:widgets, [widget1, widget2, widget3])
    |> Repo.update!()

    {:ok,
     %{
       admin_account: admin,
       admin_jwt: admin_jwt,
       user_account: user,
       user_jwt: user_jwt,
       widget: widget1,
       homepage: homepage,
       schueler_group: schueler_group
     }}
  end

  describe "widgets query" do
    @query """
    {
      widgets {
        title
        type
        groups {
          name
        }
      }
    }
    """

    test "returns widgets if user is admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "widgets" => [
                   %{"groups" => [], "title" => "Kalender", "type" => "CALENDAR"},
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Kalender",
                     "type" => "CALENDAR"
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Kalender",
                     "type" => "CALENDAR"
                   }
                 ]
               }
             }
    end

    test "returns widgets if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "widgets" => [
                   %{"groups" => [], "title" => "Kalender", "type" => "CALENDAR"},
                   %{
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Kalender",
                     "type" => "CALENDAR"
                   },
                   %{
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Kalender",
                     "type" => "CALENDAR"
                   }
                 ]
               }
             }
    end

    test "returns widgets if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "widgets" => [
                   %{"groups" => [], "title" => "Kalender", "type" => "CALENDAR"}
                 ]
               }
             }
    end
  end

  describe "widgets query with categoryId" do
    @query """
    query GetWidgets($categoryId: ID!) {
      widgets(categoryId: $categoryId) {
        title
        type
        groups {
          name
        }
      }
    }
    """

    test "returns widgets if user is admin", %{admin_jwt: admin_jwt, homepage: homepage} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query, variables: %{categoryId: homepage.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "widgets" => [
                   %{"groups" => [], "title" => "Kalender", "type" => "CALENDAR"},
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Kalender",
                     "type" => "CALENDAR"
                   },
                   %{
                     "groups" => [%{"name" => "Verwaltung"}, %{"name" => "Lehrer"}],
                     "title" => "Kalender",
                     "type" => "CALENDAR"
                   }
                 ]
               }
             }
    end

    test "returns widgets if user is not admin", %{user_jwt: user_jwt, homepage: homepage} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query, variables: %{categoryId: homepage.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "widgets" => [
                   %{"groups" => [], "title" => "Kalender", "type" => "CALENDAR"},
                   %{
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Kalender",
                     "type" => "CALENDAR"
                   },
                   %{
                     "groups" => [%{"name" => "Lehrer"}],
                     "title" => "Kalender",
                     "type" => "CALENDAR"
                   }
                 ]
               }
             }
    end

    test "returns widgets if user is not logged in", %{homepage: homepage} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query, variables: %{categoryId: homepage.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "widgets" => [
                   %{"groups" => [], "title" => "Kalender", "type" => "CALENDAR"}
                 ]
               }
             }
    end
  end

  describe "category widgets field (batched)" do
    # Exercises LottaWeb.CategoryResolver.resolve_widgets/2, which batches the
    # per-category widget lookups into a single query. Asserts that each
    # category receives its own widgets (no cross-category bleed) and that the
    # per-user group visibility is preserved.
    @query """
    {
      categories {
        id
        widgets {
          title
        }
      }
    }
    """

    test "resolves every category's widgets with a single batched query", %{
      admin_jwt: admin_jwt,
      homepage: homepage
    } do
      # A second category with its own widget, so the test exercises grouping
      # across multiple categories (cross-category isolation) rather than a
      # single one.
      other_category = insert(:category, title: "Zweite Kategorie")
      other_widget = insert(:widget, title: "Anderes Widget", type: "calendar")

      other_category
      |> Repo.preload(:widgets)
      |> Ecto.Changeset.change()
      |> Ecto.Changeset.put_assoc(:widgets, [other_widget])
      |> Repo.update!()

      # Capture every query that hits the widgets table whose parameters contain
      # *both* category ids in a single list. Under the batched resolver this
      # fires exactly once; an N+1 resolver could never put both ids in one query.
      # Filtering on the two freshly-inserted ids keeps this immune to queries
      # from other concurrently-running async tests.
      test_pid = self()
      handler_id = "batched-widgets-query-#{System.unique_integer([:positive])}"

      :telemetry.attach(
        handler_id,
        [:lotta, :repo, :query],
        fn _event, _measurements, metadata, _config ->
          if metadata[:source] == "widgets" and
               Enum.any?(metadata[:params] || [], fn param ->
                 is_list(param) and homepage.id in param and other_category.id in param
               end) do
            send(test_pid, :batched_widgets_query)
          end
        end,
        nil
      )

      on_exit(fn -> :telemetry.detach(handler_id) end)

      categories =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)
        |> get_in(["data", "categories"])

      widgets_for = fn category_id ->
        categories
        |> Enum.find(&(&1["id"] == to_string(category_id)))
        |> Map.get("widgets")
      end

      # each category receives its own widgets, with no cross-category bleed
      assert length(widgets_for.(homepage.id)) == 3
      assert widgets_for.(other_category.id) == [%{"title" => "Anderes Widget"}]

      # all categories were resolved in one query rather than one-per-category
      assert_received :batched_widgets_query
      refute_received :batched_widgets_query
    end

    test "hides group-restricted widgets from an anonymous user", %{homepage: homepage} do
      homepage_widgets =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)
        |> get_in(["data", "categories"])
        |> Enum.find(&(&1["id"] == to_string(homepage.id)))
        |> Map.get("widgets")

      # only the unrestricted widget is visible without authentication
      assert length(homepage_widgets) == 1
    end
  end

  describe "createWidget mutation" do
    @query """
    mutation createWidget($title: String!, $type: WidgetType!) {
      createWidget (title: $title, type: $type) {
        title
        type
      }
    }
    """

    test "creates a widget if user is admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{title: "New Widget", type: "CALENDAR"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createWidget" => %{
                   "title" => "New Widget",
                   "type" => "CALENDAR"
                 }
               }
             }
    end

    test "returns an error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{title: "New Widget", type: "CALENDAR"})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["createWidget"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{title: "New Widget", type: "CALENDAR"})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["createWidget"]
                 }
               ]
             } = res
    end
  end

  describe "updateWidget mutation" do
    @query """
    mutation updateWidget($id: ID!, $widget: WidgetInput!) {
      updateWidget (id: $id, widget: $widget) {
        title
        type
        groups {
          id
        }
      }
    }
    """

    test "updates a widget if user is admin", %{
      admin_jwt: admin_jwt,
      widget: widget,
      schueler_group: schueler_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: widget.id,
            widget: %{
              title: "Changed Widget",
              groups: Enum.map([schueler_group], &Map.take(&1, [:id]))
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "updateWidget" => %{
                   "title" => "Changed Widget",
                   "type" => "CALENDAR",
                   "groups" => [%{"id" => id}]
                 }
               }
             } = res

      assert id == "#{schueler_group.id}"
    end

    test "returns an error if user is not admin", %{
      user_jwt: user_jwt,
      widget: widget,
      schueler_group: schueler_group
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: widget.id,
            widget: %{
              title: "Changed Widget",
              groups: Enum.map([schueler_group], &Map.take(&1, [:id]))
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["updateWidget"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in", %{widget: widget} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{id: widget.id, widget: %{title: "Changed Widget"}}
        )
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["updateWidget"]
                 }
               ]
             } = res
    end
  end

  describe "deleteWidget mutation" do
    @query """
    mutation deleteWidget($id: ID!) {
      deleteWidget (id: $id) {
        id
      }
    }
    """

    test "deletes a widget if user is admin", %{admin_jwt: admin_jwt, widget: widget} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: widget.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteWidget" => %{
                   "id" => Integer.to_string(widget.id)
                 }
               }
             }
    end

    test "returns an error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["deleteWidget"]
                 }
               ]
             } = res
    end

    test "returns an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["deleteWidget"]
                 }
               ]
             } = res
    end
  end
end

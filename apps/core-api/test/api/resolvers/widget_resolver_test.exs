defmodule Api.WidgetResolverTest do
  @moduledoc """
    Test Module for WidgetResolver
  """

  use ApiWeb.ConnCase
  import Ecto.Query
  alias Api.Repo.Seeder
  alias Api.Guardian
  alias Api.Repo
  alias Api.Tenants
  alias Api.Tenants.{Category, Widget}
  alias Api.Accounts.{User}

  setup do
    Seeder.seed()

    web_tenant = Tenants.get_tenant_by_slug!("web")
    admin = Repo.get_by!(User, email: "alexis.rinaldoni@lotta.schule")
    user = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")
    {:ok, admin_jwt, _} = Guardian.encode_and_sign(admin, %{email: admin.email, name: admin.name})
    {:ok, user_jwt, _} = Guardian.encode_and_sign(user, %{email: user.email, name: user.name})
    web_tenant_id = web_tenant.id

    widget =
      Repo.one!(
        from w in Widget,
          where: w.tenant_id == ^web_tenant_id,
          limit: 1
      )

    homepage =
      Repo.one!(
        from c in Category,
          where: c.tenant_id == ^web_tenant_id and c.title == "Start" and c.is_homepage == true,
          limit: 1
      )

    {:ok,
     %{
       web_tenant: web_tenant,
       admin_account: admin,
       admin_jwt: admin_jwt,
       user_account: user,
       user_jwt: user_jwt,
       widget: widget,
       homepage: homepage
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
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
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

    test "returns widgets if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
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

    test "returns widgets if user is not logged in", %{homepage: homepage} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{title: "New Widget", type: "CALENDAR"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createWidget" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Nur Administratoren dürfen Widgets erstellen.",
                   "path" => ["createWidget"]
                 }
               ]
             }
    end

    test "returns an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> post("/api", query: @query, variables: %{title: "New Widget", type: "CALENDAR"})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "createWidget" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Nur Administratoren dürfen Widgets erstellen.",
                   "path" => ["createWidget"]
                 }
               ]
             }
    end
  end

  describe "updateWidget mutation" do
    @query """
    mutation updateWidget($id: ID!, $widget: WidgetInput!) {
      updateWidget (id: $id, widget: $widget) {
        title
        type
      }
    }
    """

    test "creates a widget if user is admin", %{admin_jwt: admin_jwt, widget: widget} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: widget.id, widget: %{title: "Changed Widget"}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateWidget" => %{
                   "title" => "Changed Widget",
                   "type" => "CALENDAR"
                 }
               }
             }
    end

    test "returns an error if user is not admin", %{user_jwt: user_jwt, widget: widget} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{id: widget.id, widget: %{title: "Changed Widget"}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateWidget" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Nur Administratoren dürfen Widgets bearbeiten.",
                   "path" => ["updateWidget"]
                 }
               ]
             }
    end

    test "returns an error if user is not logged in", %{widget: widget} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> post("/api",
          query: @query,
          variables: %{id: widget.id, widget: %{title: "Changed Widget"}}
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateWidget" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Nur Administratoren dürfen Widgets bearbeiten.",
                   "path" => ["updateWidget"]
                 }
               ]
             }
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
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: widget.id})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteWidget" => %{
                   "id" => widget.id
                 }
               }
             }
    end

    test "returns an error if user is not admin", %{user_jwt: user_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteWidget" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Nur Administratoren dürfen Marginalen löschen.",
                   "path" => ["deleteWidget"]
                 }
               ]
             }
    end

    test "returns an error if user is not logged in" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:web")
        |> post("/api", query: @query, variables: %{id: 0})
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "deleteWidget" => nil
               },
               "errors" => [
                 %{
                   "locations" => [%{"column" => 0, "line" => 2}],
                   "message" => "Nur Administratoren dürfen Marginalen löschen.",
                   "path" => ["deleteWidget"]
                 }
               ]
             }
    end
  end
end

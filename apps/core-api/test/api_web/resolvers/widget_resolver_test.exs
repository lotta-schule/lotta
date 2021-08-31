defmodule LottaWeb.WidgetResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Tenants.{Category, Widget}

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    admin =
      Repo.one!(from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: tenant.prefix
      )

    user =
      Repo.one!(from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule"),
        prefix: tenant.prefix
      )

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    widget = Repo.one!(from(Widget, limit: 1), prefix: tenant.prefix)

    schueler_group =
      Repo.one!(from(g in UserGroup, where: g.name == ^"Schüler"), prefix: tenant.prefix)

    homepage = Repo.one!(from(c in Category, where: c.is_homepage == true), prefix: tenant.prefix)

    {:ok,
     %{
       admin_account: admin,
       admin_jwt: admin_jwt,
       user_account: user,
       user_jwt: user_jwt,
       widget: widget,
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
               "data" => %{
                 "createWidget" => nil
               },
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
               "data" => %{
                 "createWidget" => nil
               },
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
               "data" => %{
                 "updateWidget" => nil
               },
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
               "data" => %{
                 "updateWidget" => nil
               },
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
               "data" => %{
                 "deleteWidget" => nil
               },
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
               "data" => %{
                 "deleteWidget" => nil
               },
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

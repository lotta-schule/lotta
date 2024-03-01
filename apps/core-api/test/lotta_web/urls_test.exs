defmodule LottaWeb.UrlsTest do
  @moduledoc false

  use Lotta.DataCase

  import Ecto.Query

  alias Lotta.Tenants
  alias Lotta.Accounts.User
  alias Lotta.Content.Article
  alias Lotta.Tenants.Category
  alias LottaWeb.Urls

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_slug("test")

    category = Repo.one!(from(c in Category, where: c.title == ^"Fächer"), prefix: @prefix)

    article =
      Repo.one!(from(a in Article, where: a.title == ^"Der Podcast zum WB 2"), prefix: @prefix)

    user = Repo.one!(from(u in User, where: u.email == ^"maxi@lotta.schule"), prefix: @prefix)

    {:ok,
     %{
       tenant: tenant,
       article: article,
       category: category,
       user: user
     }}
  end

  describe "urls" do
    test "should return the correct tenant base uri", %{tenant: t} do
      assert %URI{host: "test.lotta.schule"} = Urls.get_tenant_uri(t)
    end

    test "should return the correct tenant base url", %{tenant: t} do
      assert "https://test.lotta.schule" = Urls.get_tenant_url(t)
    end

    test "should return the correct article path", %{article: a} do
      assert Urls.get_article_path(a) =~ ~r/\/a\/\d+-Der-Podcast-zum-WB-2/
    end

    test "should return the correct article uri", %{article: a} do
      assert %URI{host: "test.lotta.schule", path: path} = Urls.get_article_uri(a)
      assert path =~ ~r/\/a\/\d+-Der-Podcast-zum-WB-2/
    end

    test "should return the correct article url", %{article: a} do
      assert Urls.get_article_url(a) =~
               ~r/https:\/\/test.lotta.schule\/a\/\d+-Der-Podcast-zum-WB-2/
    end

    test "should return the correct password reset uri", %{user: u} do
      token = "abcdef"

      assert %URI{
               host: "test.lotta.schule",
               path: "/password/reset",
               query: query
             } = Urls.get_password_reset_uri(u, token)

      assert %{"e" => "bWF4aUBsb3R0YS5zY2h1bGU=", "t" => "abcdef"} = URI.decode_query(query)
    end

    test "should return the correct password reset url", %{user: u} do
      token = "abcdef"

      assert %{
               scheme: "https",
               host: "test.lotta.schule",
               path: "/password/reset",
               query: query
             } = URI.parse(Urls.get_password_reset_url(u, token))

      assert %{"e" => "bWF4aUBsb3R0YS5zY2h1bGU=", "t" => "abcdef"} = URI.decode_query(query)
    end

    test "should return the correct hostname", %{tenant: t} do
      assert Urls.get_tenant_host(t) == "test.lotta.schule"
    end
  end
end

defmodule LottaWeb.UrlsTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Lotta.Factory

  alias Lotta.Tenants
  alias LottaWeb.Urls

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    tenant = Tenants.get_tenant_by_slug("test")

    article = insert(:article, title: "Der Podcast zum WB 2")

    user = insert(:user, email: "url-maxi@lotta.schule", name: "Max Mustermann", nickname: "MaXi")

    {:ok,
     %{
       tenant: tenant,
       article: article,
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

      assert %{"e" => "dXJsLW1heGlAbG90dGEuc2NodWxl", "t" => "abcdef"} = URI.decode_query(query)
    end

    test "should return the correct password reset url", %{user: u} do
      token = "abcdef"

      assert %{
               scheme: "https",
               host: "test.lotta.schule",
               path: "/password/reset",
               query: query
             } = URI.parse(Urls.get_password_reset_url(u, token))

      assert %{"e" => "dXJsLW1heGlAbG90dGEuc2NodWxl", "t" => "abcdef"} = URI.decode_query(query)
    end

    test "should return the correct hostname", %{tenant: t} do
      assert Urls.get_tenant_host(t) == "test.lotta.schule"
    end
  end
end

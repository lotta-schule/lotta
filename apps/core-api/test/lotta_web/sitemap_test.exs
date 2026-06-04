defmodule LottaWeb.SitemapTest do
  @moduledoc false
  use LottaWeb.ConnCase, async: false

  import Lotta.Factory

  alias Lotta.Repo

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    insert(:category, title: "Start")
    insert(:category, title: "Podcast")
    insert(:category, title: "Sport")
    insert(:category, title: "Offene Kunst AG")
    insert(:category, title: "Kunst")
    insert(:category, title: "Schülerzeitung")
    insert(:category, title: "Projekt")
    insert(:category, title: "Oskar Reime Chor")
    insert(:category, title: "Schüler-Radio")
    insert(:category, title: "Galerien")
    insert(:category, title: "Impressum")
    article_category = insert(:category, title: "Oskar")

    insert(:article,
      title: "And the oskar goes to ...",
      published: true,
      category_id: article_category.id,
      inserted_at: ~U[2019-09-01 10:00:00Z],
      updated_at: ~U[2019-09-01 10:00:00Z]
    )

    insert(:article,
      title: "Landesfinale Volleyball WK IV",
      published: true,
      category_id: article_category.id,
      inserted_at: ~U[2019-09-01 11:00:00Z],
      updated_at: ~U[2019-09-01 11:00:00Z]
    )

    insert(:article,
      title: "\u{201E}Nipple Jesus\u{201D}- eine extreme Erfahrung",
      published: true,
      category_id: article_category.id,
      inserted_at: ~U[2019-09-01 12:00:00Z],
      updated_at: ~U[2019-09-01 12:00:00Z]
    )

    insert(:article,
      title: "Beitrag Projekt 1",
      published: true,
      category_id: article_category.id,
      inserted_at: ~U[2019-09-01 13:00:00Z],
      updated_at: ~U[2019-09-01 13:00:00Z]
    )

    insert(:article,
      title: "Beitrag Projekt 2",
      published: true,
      category_id: article_category.id,
      inserted_at: ~U[2019-09-01 14:00:00Z],
      updated_at: ~U[2019-09-01 14:00:00Z]
    )

    insert(:article,
      title: "Beitrag Projekt 3",
      published: true,
      category_id: article_category.id,
      inserted_at: ~U[2019-09-01 15:00:00Z],
      updated_at: ~U[2019-09-01 15:00:00Z]
    )

    :ok
  end

  describe "sitemaps" do
    test "returns an index sitemap" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/data/sitemap.xml")
        |> response(200)

      assert res =~
               "<?xml version=\"1.0\" encoding=\"UTF-8\"?><sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">"

      assert res =~
               "<loc>\n\t\t\thttps://www.example.com/sitemap.xml?categories\n\t\t</loc>\n\t\t<loc>https://www.example.com/sitemap.xml?articles&amp;date=2019-08-01</loc>"
    end

    test "returns categories sitemap" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/data/sitemap.xml?categories")
        |> response(200)

      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Start<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Podcast<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Sport<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Offene-Kunst-AG<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Kunst<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Schulerzeitung<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Projekt<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Oskar-Reime-Chor<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Schuler-Radio<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Galerien<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Impressum<\/loc>/
    end

    test "returns articles sitemap" do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/data/sitemap.xml?articles&date=#{Date.to_iso8601(~D[2019-09-01])}")
        |> response(200)

      assert res =~
               "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:n=\"http://www.google.com/schemas/sitemap-news/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">"

      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-And-the-oskar-goes-to-...<\/loc>/

      assert res =~
               ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Landesfinale-Volleyball-WK-IV<\/loc>/

      assert res =~
               ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Nipple-Jesus"-eine-extreme-Erfahrung<\/loc>/

      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Beitrag-Projekt-1<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Beitrag-Projekt-2<\/loc>/
      assert res =~ ~r/<loc>https:\/\/www\.example\.com\/c\/\d+-Beitrag-Projekt-3<\/loc>/
    end
  end
end

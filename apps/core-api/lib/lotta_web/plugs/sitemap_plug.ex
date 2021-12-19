defmodule LottaWeb.SitemapPlug do
  @moduledoc """
    Phoenix Plug which returns a valid XML sitemap
  """

  import Plug.Conn
  import Ecto.Query
  alias Lotta.{Repo, Slugifier, Storage, Tenants}
  alias Lotta.Content.Article

  def init(opts), do: opts

  defguardp is_empty(subject) when is_nil(subject) or subject == ""

  def call(conn, _) do
    query_params =
      conn
      |> fetch_query_params()
      |> Map.fetch!(:params)

    conn
    |> put_resp_content_type("application/xml")
    |> send_resp(
      200,
      case query_params do
        %{"categories" => categories} when is_empty(categories) ->
          get_categories_body(conn)

        %{"articles" => articles, "date" => date} when is_empty(articles) ->
          get_articles_body(conn, Date.from_iso8601!(date))

        _ ->
          get_index_body(conn)
      end
    )
  end

  defp get_categories_body(conn) do
    categories = Tenants.list_categories(nil)

    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" <>
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:n=\"http://www.google.com/schemas/sitemap-news/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n" <>
      Enum.map_join(categories, fn category ->
        "\t<url>\n" <>
          "\t\t<loc>https://#{conn.host}/c/#{category.id}-#{Slugifier.slugify_string(category.title)}</loc>\n" <>
          "\t\t<lastmod>#{category.updated_at}</lastmod>\n" <>
          "\t</url>\n"
      end) <>
      "</urlset>"
  end

  defp get_articles_body(conn, date) do
    query = Article.get_published_articles_query()

    articles =
      from(
        a in query,
        where: fragment("?::date", a.inserted_at) == ^date
      )
      |> Repo.all()

    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" <>
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:n=\"http://www.google.com/schemas/sitemap-news/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n" <>
      Enum.map_join(articles, fn article ->
        article = Repo.preload(article, :preview_image_file)

        "\t<url>\n" <>
          "\t\t<loc>https://#{conn.host}/c/#{article.id}-#{Slugifier.slugify_string(article.title)}</loc>\n" <>
          "\t\t<lastmod>#{article.updated_at}</lastmod>\n" <>
          case article do
            %{preview_image_file: file} ->
              "\t\t<image:image>\n" <>
                "\t\t\t<image:loc>#{Storage.get_http_url(file)}</image:loc>\n" <>
                "\t\t</image:image>\n"

            _ ->
              ""
          end <>
          "\t</url>\n"
      end) <>
      "</urlset>"
  end

  defp get_index_body(conn) do
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" <>
      "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" <>
      "\t<sitemap>\n" <>
      "\t\t<loc>\n" <>
      "\t\t\thttps://" <>
      conn.host <>
      "/sitemap.xml?categories\n" <>
      "\t\t</loc>\n" <>
      Enum.map_join(Date.range(~D[2019-08-01], Date.utc_today()), fn date ->
        "\t\t<loc>https://#{conn.host}/sitemap.xml?articles&amp;date=#{Date.to_iso8601(date)}</loc>\n"
      end) <>
      "\t</sitemap>\n" <>
      "</sitemapindex>"
  end
end

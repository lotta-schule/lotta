defmodule ApiWeb.SitemapPlug do
  import Plug.Conn
  import Ecto.Query
  alias Api.Tenants
  alias Api.Tenants.Tenant
  alias Api.Content

  def init(opts), do: opts
  def call(conn, _) do
    tenant =
      with ["slug:" <> slug] <- get_req_header(conn, "tenant") do
        Tenants.get_tenant_by_slug(slug)
      else
        _ -> case get_req_header(conn, "host") do
          [host] ->
            Tenants.get_tenant_by_origin("https://" <> host)
          _ ->
            # only for testing
            Tenants.get_tenant_by_slug("ehrenberg")
        end
      end

    case tenant do
      nil ->
        conn
        |> put_resp_content_type("text/plain")
        |> send_resp(404, "Not Found")
      tenant ->
        query_params = conn
          |> fetch_query_params()
          |> Map.fetch!(:params)
        case query_params do
          %{"categories" => nil} ->
            conn
            |> get_categories(tenant)
          %{"articles" => nil, "date" => date} ->
            conn
            |> get_articles(tenant, Date.from_iso8601!(date))
          _ ->
            conn
            |> get_index()
        end
        
    end
  end

  defp get_categories(conn, %Tenant{} = tenant) do
    categories = tenant
      |> Tenants.list_categories_by_tenant(nil)

    conn
    |> send_resp(
      200,
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" <>
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:n=\"http://www.google.com/schemas/sitemap-news/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n" <>
      (categories
      |> Enum.map(fn category ->
        "\t<url>\n" <>
        "\t\t<loc>https://#{conn.host}/c/#{category.id}-#{Api.Slugifier.slugify_string(category.title)}</loc>\n" <>
        "\t\t<lastmod>#{category.updated_at}</lastmod>\n" <>
        "\t</url>\n"
      end)
      |> Enum.join("")) <>
      "</urlset>"
    )
  end

  defp get_articles(conn, %Tenant{} = tenant, date) do
    query = tenant
      |> Content.list_public_articles(nil)
    articles = from(
      a in query,
      where: fragment("?::date", a.inserted_at) == ^date
    )
    |> Api.Repo.all()

    conn
    |> send_resp(
      200,
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" <>
      "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:n=\"http://www.google.com/schemas/sitemap-news/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n" <>
      (articles
      |> Enum.map(fn article ->
        article = Api.Repo.preload(article, :preview_image_file)
        "\t<url>\n" <>
        "\t\t<loc>https://#{conn.host}/c/#{article.id}-#{Api.Slugifier.slugify_string(article.title)}</loc>\n" <>
        "\t\t<lastmod>#{article.updated_at}</lastmod>\n" <>
        (with %{preview_image_file: %{remote_location: image_location}} <- article do
            "\t\t<image:image>\n" <>
            "\t\t\t<image:loc>#{image_location}</image:loc>\n" <>
            "\t\t</image:image>\n"
        else
          _ -> ""
        end) <>
        "\t</url>\n"
      end)
      |> Enum.join("")) <>
      "</urlset>"
    )
  end

  defp get_index(conn) do
    conn
    |> send_resp(
      200,
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" <>
      "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" <>
      "\t<sitemap>\n" <>
      "\t\t<loc>\n" <>
      "\t\t\thttps://" <> conn.host <> "/sitemap.xml?categories\n" <>
      "\t\t</loc>\n" <>
      (Date.range(~D[2019-08-01], Date.utc_today())
      |> Enum.map(fn date ->
        "\t\t<loc>https://#{conn.host}/sitemap.xml?articles&amp;date=#{Date.to_iso8601(date)}</loc>\n"
      end)
      |> Enum.join("")) <>
      "\t</sitemap>\n" <>
      "</sitemapindex>"
    )
  end
end
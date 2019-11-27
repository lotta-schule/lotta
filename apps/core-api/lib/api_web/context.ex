defmodule ApiWeb.Context do
  @behaviour Plug

  import Plug.Conn

  alias Api.{Guardian, Accounts, Tenants, Repo}

  def init(opts), do: opts

  def call(conn, _) do
    conn
    |> Absinthe.Plug.put_options(context: build_absinthe_context(conn))
  end

  def build_absinthe_context(conn, context \\ %{}) do
    context
    |> put_user(conn)
    |> put_tenant(conn)
  end

  defp put_user(context, conn) do
    authorization_header = get_req_header(conn, "authorization")
    with ["Bearer " <> token] <- authorization_header,
        {:ok, current_user, _claims} <- Guardian.resource_from_token(token) do
      current_user =
        Repo.get(Accounts.User, current_user.id)
        |> Repo.preload([:groups, :avatar_image_file])
      Task.start_link(fn ->
        current_user
        |> Repo.preload(:tenant)
        |> Accounts.see_user()
      end)
      Map.put(context, :current_user, current_user)
    else
      _ ->
        context
    end
  end

  defp put_tenant(context, conn) do
    tenant = tenant_by_slug_header(conn) || tenant_by_origin_header(conn)
    if !is_nil(tenant), do: Map.put(context, :tenant, tenant), else: context
  end

  defp tenant_by_slug_header(conn) do
    with ["slug:" <> slug] <- get_req_header(conn, "tenant") do
      Tenants.get_tenant_by_slug(slug)
    else
      _ ->
        nil
    end
  end
  
  defp tenant_by_origin_header(conn) do
    with [origin] <- get_req_header(conn, "origin"),
        %URI{host: host} <- URI.parse(origin),
        false <- is_nil(host) do
      case Tenants.get_tenant_by_custom_domain_host(host) do
        nil ->
          IO.inspect("custom domain is not found with #{host}. Trying to recognize lotta slug")
          base_url_without_port = Regex.replace(~r/:\d*$/, Application.fetch_env!(:api, :base_url), "")
          with {:ok, regex} <- Regex.compile("^(?<slug>.*)#{Regex.escape(base_url_without_port)}"),
              %{"slug" => slug} <- Regex.named_captures(regex, host) do
            Tenants.get_tenant_by_slug(slug)
          else
            error ->
              IO.inspect(error)
              IO.inspect("tenant not found by slug or host, host is #{host}")
              nil
          end
        tenant ->
          tenant
      end
    else
      error ->
        IO.inspect("could not parse origin header")
        IO.inspect(error)
        nil
    end
  end
end
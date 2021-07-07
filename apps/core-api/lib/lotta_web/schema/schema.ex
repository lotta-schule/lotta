defmodule LottaWeb.Schema do
  @moduledoc false

  use Absinthe.Schema

  import_types(Absinthe.Plug.Types)
  import_types(Absinthe.Type.Custom)
  import_types(__MODULE__.CustomTypes.Json)

  import_types(__MODULE__.Tenants)
  import_types(__MODULE__.Tenants.{Category, Usage, Tenant, Widget})
  import_types(__MODULE__.Accounts)
  import_types(__MODULE__.Accounts.{File, User})
  import_types(__MODULE__.Contents)
  import_types(__MODULE__.Contents.Article)
  import_types(__MODULE__.Messages)
  import_types(__MODULE__.Messages.Message)
  import_types(__MODULE__.Schedule)
  import_types(__MODULE__.Calendar)
  import_types(__MODULE__.Search)

  query do
    import_fields(:accounts_queries)
    import_fields(:tenants_queries)
    import_fields(:contents_queries)
    import_fields(:messages_queries)
    import_fields(:schedule_queries)
    import_fields(:calendar_queries)
    import_fields(:search_queries)
  end

  mutation do
    import_fields(:accounts_mutations)
    import_fields(:messages_mutations)
    import_fields(:tenants_mutations)
    import_fields(:contents_mutations)
  end

  subscription do
    import_fields(:messages_subscriptions)
    import_fields(:contents_subscriptions)
  end

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(Lotta.Content, Lotta.Content.data())
      |> Dataloader.add_source(Lotta.Tenants, Lotta.Tenants.data())
      |> Dataloader.add_source(Lotta.Accounts, Lotta.Accounts.data())
      |> Dataloader.add_source(Lotta.Storage, Lotta.Storage.data())

    Map.put(ctx, :loader, loader)
  end

  # I leave it here for quick reference how to add middleware
  # def middleware(middleware, _field, %{identifier: :mutation}) do
  #   middleware ++ [LottaWeb.Schema.Middleware.HandleChangesetErrors]
  # end

  def middleware(middleware, _field, %{identifier: :mutation}) do
    middleware
  end

  def middleware(middleware, _field, _object), do: middleware

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end
end

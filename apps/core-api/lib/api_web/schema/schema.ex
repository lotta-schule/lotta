defmodule ApiWeb.Schema do
  @moduledoc false

  use Absinthe.Schema

  import_types(Absinthe.Plug.Types)
  import_types(Absinthe.Type.Custom)
  import_types(__MODULE__.CustomTypes.Json)

  import_types(__MODULE__.System)
  import_types(__MODULE__.System.{Category, Usage, System, Widget})
  import_types(__MODULE__.Accounts)
  import_types(__MODULE__.Accounts.{File, User})
  import_types(__MODULE__.Contents)
  import_types(__MODULE__.Contents.Article)
  import_types(__MODULE__.Schedule)
  import_types(__MODULE__.Calendar)
  import_types(__MODULE__.Search)

  query do
    import_fields(:accounts_queries)
    import_fields(:system_queries)
    import_fields(:contents_queries)
    import_fields(:schedule_queries)
    import_fields(:calendar_queries)
    import_fields(:search_queries)
  end

  mutation do
    import_fields(:accounts_mutations)
    import_fields(:system_mutations)
    import_fields(:contents_mutations)
  end

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(Api.Content, Api.Content.data())
      |> Dataloader.add_source(Api.System, Api.System.data())
      |> Dataloader.add_source(Api.Accounts, Api.Accounts.data())

    Map.put(ctx, :loader, loader)
  end

  # I leave it here for quick reference how to add middleware
  # def middleware(middleware, _field, %{identifier: :mutation}) do
  #   middleware ++ [ApiWeb.Schema.Middleware.HandleChangesetErrors]
  # end

  def middleware(middleware, _field, _object), do: middleware

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end
end

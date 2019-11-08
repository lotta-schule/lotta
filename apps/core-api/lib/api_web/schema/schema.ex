defmodule ApiWeb.Schema do
  use Absinthe.Schema
  import Absinthe.Resolution.Helpers, only: [dataloader: 1]
  import_types Absinthe.Plug.Types
  import_types ApiWeb.Schema.Types.JSON
  import_types ApiWeb.Schema.Types.LottaId
  import_types Absinthe.Type.Custom
  import_types __MODULE__.TenantsTypes
  import_types __MODULE__.AccountsTypes
  import_types __MODULE__.ContentsTypes
  import_types __MODULE__.ScheduleTypes
  import_types __MODULE__.CalendarTypes

  query do

    import_fields :accounts_queries
    import_fields :tenants_queries
    import_fields :contents_queries
    import_fields :schedule_queries
    import_fields :calendar_queries
  end

  mutation do
    import_fields :accounts_mutations
    import_fields :tenants_mutations
    import_fields :contents_mutations
  end

  def context(ctx) do
    loader =
      Dataloader.new
      |> Dataloader.add_source(Api.Content, Api.Content.data())
      |> Dataloader.add_source(Api.Tenants, Api.Tenants.data(ctx))
      |> Dataloader.add_source(Api.Accounts, Api.Accounts.data())

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end
end
defmodule ApiWeb.Schema do
  use Absinthe.Schema
  import_types Absinthe.Plug.Types
  import_types ApiWeb.Schema.Types
  import_types __MODULE__.TenantsTypes
  import_types __MODULE__.AccountsTypes
  import_types __MODULE__.ContentsTypes
  import_types __MODULE__.ScheduleTypes

  query do

    import_fields :accounts_queries
    import_fields :tenants_queries
    import_fields :contents_queries
    import_fields :schedule_queries

    field :calendar, list_of(:calendar_event) do
      arg :url, :string
      resolve &Api.CalendarResolver.get/2
    end
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
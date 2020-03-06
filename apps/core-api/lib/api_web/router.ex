defmodule ApiWeb.Router do
  use ApiWeb, :router
  if Application.get_env(:honeybadger, :api_key) do
    use Honeybadger.Plug
  end

  pipeline :auth do
    plug Guardian.Plug.Pipeline,
      module: Api.Guardian,
      error_handler: Api.Guardian.AuthErrorHandler

    # plug Guardian.Plug.VerifySession, %{"typ" => "access"}
    # plug Guardian.Plug.VerifyCookie, %{"typ" => "access"}
    # plug Guardian.Plug.LoadResource
    plug ApiWeb.Context
  end

  scope "/api" do
    pipe_through :auth

    forward "/", Absinthe.Plug,
      schema: ApiWeb.Schema,
      before_send: {ApiWeb.AbsintheHooks, :before_send}
  end

  scope "/_debug" do
    # health endpoint
    forward "/health", ApiWeb.HealthPlug
  end

  forward "/sitemap.xml", ApiWeb.SitemapPlug

  forward "/graphiql", Absinthe.Plug.GraphiQL,
    schema: ApiWeb.Schema

end

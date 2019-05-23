defmodule ApiWeb.Router do
  use ApiWeb, :router

  forward "/api", Absinthe.Plug, schema: ApiWeb.Schema
  forward "/graphiql", Absinthe.Plug.GraphiQL, schema: ApiWeb.Schema

end

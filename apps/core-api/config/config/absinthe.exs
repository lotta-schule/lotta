import Config

config :absinthe_graphql_ws, :json_library, Jason

if config_env() == :dev do
  config :absinthe, Absinthe.Logger, pipeline: true
end

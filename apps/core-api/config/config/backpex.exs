import Config

config :backpex, :pubsub_server, Lotta.PubSub

config :backpex,
  translator_function: {CockpitWeb.CoreComponents, :translate_backpex},
  error_translator_function: {CockpitWeb.CoreComponents, :translate_error}

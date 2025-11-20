import Config

config :backpex, :pubsub_server, Lotta.PubSub

config :backpex,
  translator_function: {LottaWeb.CoreComponents, :translate_backpex},
  error_translator_function: {LottaWeb.CoreComponents, :translate_error}

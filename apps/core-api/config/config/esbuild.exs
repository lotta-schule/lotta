import Config

config :esbuild,
  version: "0.27.0",
  lotta: [
    args: ~w(
      js/lotta.js
      --bundle
      --target=es2016
      --outdir=../priv/static/assets/js
    ),
    env: %{"NODE_PATH" => Path.expand("../../deps", __DIR__)},
    cd: Path.expand("../../assets", __DIR__)
  ],
  cockpit: [
    args: ~w(
      js/cockpit.js
      --bundle
      --target=es2016
      --outdir=../priv/static/assets/js
      --external:/images/*
    ),
    env: %{"NODE_PATH" => Path.expand("../../deps", __DIR__)},
    cd: Path.expand("../../assets", __DIR__)
  ]

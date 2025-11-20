import Config

config :tailwind,
  version: "4.1.10",
  lotta: [
    args: ~w(
      --input=assets/css/app.css
      --output=priv/static/assets/css/app.css
    ),
    cd: Path.expand("../..", __DIR__)
  ]

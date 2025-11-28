import Config

config :tailwind,
  version: "4.1.10",
  cockpit: [
    args: ~w(
      --input=assets/css/cockpit.css
      --output=priv/static/assets/css/cockpit.css
    ),
    cd: Path.expand("../..", __DIR__)
  ]

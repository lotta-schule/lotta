defmodule Lotta.MixProject do
  use Mix.Project

  def project do
    [
      app: :lotta,
      version: "6.1.5",
      name: "Lotta API Server",
      source_url: "https://github.com/lotta-schule/core",
      homepage_url: "https://lotta.schule",
      elixir: "~> 1.18",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: Mix.compilers() ++ [:phoenix_live_view, :rambo],
      listeners: [Phoenix.CodeReloader],
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      releases: [
        lotta: [
          include_executables_for: [:unix],
          applications: [opentelemetry_exporter: :permanent, opentelemetry: :temporary]
        ]
      ],
      test_coverage: [
        tool: ExCoveralls,
        output: "coverage"
      ],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.json": :test,
        "coveralls.detail": :test,
        "coveralls.post": :test,
        "coveralls.html": :test
      ],
      docs: [
        main: "Lotta",
        logo: "priv/static/logo.png",
        extras: ["README.md"]
      ],
      dialyzer: []
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Lotta.Application, []},
      extra_applications: [
        :logger,
        :runtime_tools,
        :crypto,
        :ssl,
        :inets,
        :con_cache,
        :timex,
        :os_mon
      ]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "priv/repo/seeder", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.8"},
      {:phoenix_pubsub, "~> 2.1"},
      {:phoenix_live_dashboard, "~> 0.8"},
      {:phoenix_live_view, "~> 1.1.0"},
      {:phoenix_ecto, "~> 4.2"},
      {:phoenix_html, "~> 4.2"},
      {:phoenix_html_helpers, "~> 1.0"},
      {:phoenix_view, "~> 2.0"},
      {:ecto_sql, "~> 3.6"},
      {:ecto_psql_extras, "~> 0.6"},
      {:absinthe, "~> 1.7.5"},
      {:absinthe_plug, "~> 1.5"},
      {:absinthe_phoenix, "~> 2.0"},
      {:absinthe_graphql_ws, github: "geometerio/absinthe_graphql_ws"},
      {:dataloader, "~> 2.0"},
      {:corsica, "~> 2.1.2"},
      {:postgrex, ">= 0.0.0"},
      {:gettext, "~> 0.26.0"},
      {:jason, "~> 1.4.0"},
      {:bandit, "~> 1.0"},
      {:oauth2, "~> 2.1"},
      {:argon2_elixir, "~> 4.0"},
      {:bcrypt_elixir, "~> 3.0"},
      {:guardian, "~> 2.4.0"},
      {:ex_aws, "~> 2.1"},
      {:ex_aws_s3, "~> 2.1"},
      {:hackney, "~> 1.20"},
      {:finch, "~> 0.19"},
      {:tesla, "~> 1.15"},
      {:sweet_xml, "~> 0.7"},
      {:poison, "~> 6.0"},
      {:qr_code, "~> 3.2.0"},
      {:chromic_pdf, "~> 1.17.0"},
      {:uuid, "~> 1.1.8"},
      {:bamboo, "~> 2.0"},
      {:bamboo_phoenix, "~> 1.0"},
      {:ex_ical, "~> 0.2.0"},
      {:pigeon, "~> 2.0.1"},
      {:goth, "~> 1.4.3"},
      {:timex, "~> 3.7"},
      {:sentry, "~> 11.0"},
      {:redix, "~> 1.0"},
      {:con_cache, "~> 1.0"},
      {:libcluster, "~> 3.2"},
      {:file_type, "~> 0.1"},
      {:image, "~> 0.55"},
      {:exile, "~> 0.12.0"},
      {:ffmpex, "~> 0.11"},
      {:oban, "~> 2.19"},
      {:oban_web, "~> 2.11"},
      {:backpex, "~> 0.16.3"},
      # Test
      {:ex_machina, "~> 2.8.0", only: :test},
      {:excoveralls, "~> 0.14", only: :test},
      {:junit_formatter, "~> 3.2", only: :test},
      {:mock, "~> 0.3", only: :test},
      # Development
      {:phoenix_live_reload, "~> 1.6", only: :dev},
      {:esbuild, "~> 0.10", runtime: Mix.env() == :dev},
      {:tailwind, "~> 0.3", runtime: Mix.env() == :dev},
      {:heroicons,
       github: "tailwindlabs/heroicons",
       tag: "v2.2.0",
       sparse: "optimized",
       app: false,
       compile: false,
       depth: 1},
      {:credo, "~> 1.5", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.0", only: [:dev, :test], runtime: false},
      {:ex_doc, "~> 0.24", only: [:dev, :test], runtime: false},
      # Telemetry & OpenTelemetry
      {:tcp_health_check, "~> 0.1.0"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_metrics_prometheus, "~> 1.1.0"},
      {:telemetry_poller, "~> 1.1"},
      {:opentelemetry, "~> 1.2"},
      {:opentelemetry_api, "~> 1.3"},
      {:opentelemetry_absinthe, "~> 2.3"},
      {:opentelemetry_bandit, "~> 0.2"},
      {:opentelemetry_ecto, "~> 1.2"},
      {:opentelemetry_exporter, "~> 1.6"},
      {:opentelemetry_oban, "~> 1.1"},
      {:opentelemetry_phoenix, "~> 2.0"},
      {:opentelemetry_tesla, "~> 2.4.0"},
      {:opentelemetry_semantic_conventions, "~> 1.27", override: true},
      {:kadabra, github: "ptitmouton/kadabra", branch: "otp-28-support", override: true}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "assets.setup", "assets.build"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.reset", "test"],
      translations: [
        "gettext.extract",
        "gettext.merge priv/gettext/de/LC_MESSAGES/default.po priv/gettext/default.pot"
      ],
      sentry_recompile: ["compile", "deps.compile sentry --force"],
      "assets.setup": ["tailwind.install --if-missing", "esbuild.install --if-missing"],
      "assets.build": ["compile", "tailwind lotta", "esbuild lotta"],
      "assets.deploy": [
        "tailwind lotta --minify",
        "esbuild lotta --minify",
        "phx.digest"
      ],
      precommit: ["compile --warning-as-errors", "deps.unlock --unused", "format", "test"]
    ]
  end
end

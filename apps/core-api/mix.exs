defmodule Lotta.MixProject do
  use Mix.Project

  def project do
    [
      app: :lotta,
      version: "4.1.2",
      name: "Lotta API Server",
      source_url: "https://github.com/lotta-schule/core",
      homepage_url: "https://lotta.schule",
      elixir: "~> 1.14",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      releases: [
        lotta: [
          include_executables_for: [:unix],
          applications: [opentelemetry_exporter: :permanent, opentelemetry: :temporary]
        ]
      ],
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.detail": :test,
        "coveralls.post": :test,
        "coveralls.html": :test
      ],
      docs: [
        main: "Lotta",
        logo: "priv/static/logo.png",
        extras: ["README.md"]
      ],
      dialyzer: [plt_add_deps: :transitive]
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
        :amqp,
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
  defp elixirc_paths(_), do: ["lib", "priv/repo/seeder"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.7.7"},
      {:phoenix_pubsub, "~> 2.1"},
      {:phoenix_live_dashboard, "~> 0.8"},
      {:phoenix_ecto, "~> 4.2"},
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
      {:gettext, "~> 0.22.3"},
      {:jason, "~> 1.4.0"},
      {:plug_cowboy, "~> 2.4"},
      {:comeonin, "~> 5.3.1"},
      {:argon2_elixir, "~> 3.0"},
      {:bcrypt_elixir, "~> 3.0"},
      {:guardian, "~> 2.2"},
      {:ex_aws, "~> 2.1"},
      {:ex_aws_s3, "~> 2.1"},
      {:hackney, "~> 1.15"},
      {:httpoison, "~> 2.1"},
      {:tesla, "~> 1.5"},
      {:sweet_xml, "~> 0.7"},
      {:poison, "~> 5.0"},
      {:uuid, "~> 1.1.8"},
      {:bamboo, "~> 2.0"},
      {:bamboo_phoenix, "~> 1.0"},
      {:gen_rmq, "~> 4.0"},
      {:ex_ical, "~> 0.2.0"},
      {:pigeon, github: "codedge-llc/pigeon"},
      {:timex, "~> 3.7"},
      {:sentry, "~> 8.1"},
      {:redix, "~> 1.0"},
      {:con_cache, "~> 1.0"},
      # Test
      {:mock, "~> 0.3", only: :test},
      {:excoveralls, "~> 0.14", only: :test},
      {:junit_formatter, "~> 3.2", only: :test},
      # Prod
      {:libcluster, "~> 3.2"},
      # Development
      {:credo, "~> 1.5", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.0", only: :dev, runtime: false},
      {:ex_doc, "~> 0.24", only: [:dev, :test], runtime: false},
      # OpenTelemetry
      {:opentelemetry, "~> 1.2"},
      {:opentelemetry_api, "~> 1.2"},
      {:opentelemetry_absinthe, "~> 2.0"},
      {:opentelemetry_cowboy, "~> 0.1"},
      {:opentelemetry_ecto, "~> 1.1"},
      {:opentelemetry_exporter, "~> 1.6"},
      {:opentelemetry_phoenix, "~> 1.1"},
      {:opentelemetry_redix, "~> 0.1"},
      {:opentelemetry_tesla, "~> 2.2"}
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
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.reset", "test"],
      sentry_recompile: ["compile", "deps.compile sentry --force"]
    ]
  end
end

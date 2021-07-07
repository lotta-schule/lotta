defmodule Lotta.MixProject do
  use Mix.Project

  def project do
    [
      app: :lotta,
      version: "2.5.13",
      name: "Lotta API Server",
      source_url: "https://gitlab.com/medienportal/api-server",
      homepage_url: "https://lotta.schule",
      elixir: "~> 1.12",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix, :gettext] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      releases: [
        lotta: [
          include_executables_for: [:unix]
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
        :lager,
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
      {:phoenix, "~> 1.5.3"},
      {:phoenix_pubsub, "~> 2.0.0"},
      {:phoenix_ecto, "~> 4.2"},
      {:ecto_sql, "~> 3.6"},
      {:absinthe, "~> 1.6.3", override: true},
      {:absinthe_plug, "~> 1.5"},
      {:absinthe_phoenix, "~> 2.0"},
      {:dataloader, "~> 1.0.7"},
      {:corsica, "~> 1.1.3"},
      {:postgrex, ">= 0.0.0"},
      {:gettext, "~> 0.18.0"},
      {:jason, "~> 1.2.0"},
      {:plug_cowboy, "~> 2.4"},
      {:comeonin, "~> 5.3.1"},
      {:argon2_elixir, "~> 2.4.0"},
      {:bcrypt_elixir, "~> 2.3.0"},
      {:guardian, "~> 2.1.1"},
      {:ex_aws, "~> 2.1"},
      {:ex_aws_s3, "~> 2.1"},
      {:hackney, "~> 1.15"},
      {:sweet_xml, "~> 0.6.6"},
      {:poison, "~> 4.0.1"},
      {:uuid, "~> 1.1.8"},
      {:bamboo, "~> 2.0"},
      {:bamboo_phoenix, "~> 1.0"},
      {:gen_rmq, "~> 3.0.0"},
      {:ex_ical, "~> 0.2.0"},
      {:timex, "~> 3.7"},
      {:sentry, "~> 8.0"},
      {:redix, "~> 1.0"},
      {:con_cache, "~> 1.0"},
      {:elasticsearch, "~> 1.0"},
      # Test
      {:mock, "~> 0.3", only: :test},
      {:junit_formatter, "~> 3.2", only: :test},
      # Prod
      {:libcluster, "~> 3.2", only: :prod},
      # Development
      {:credo, "~> 1.5", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.0", only: :dev, runtime: false},
      {:ex_doc, "~> 0.24", only: :dev, runtime: false},
      # live dashboard
      {:telemetry_poller, "~> 0.5"},
      {:telemetry_metrics, "~> 0.6"},
      {:phoenix_live_dashboard, "~> 0.4"},
      # test
      {:excoveralls, "~> 0.14", only: :test}
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
      test: ["ecto.reset", "test"]
    ]
  end
end

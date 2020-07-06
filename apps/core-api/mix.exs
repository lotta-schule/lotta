defmodule Api.MixProject do
  use Mix.Project

  def project do
    [
      app: :api,
      version: "1.8.0",
      elixir: "~> 1.10",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix, :gettext] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      releases: [
        api: [
          include_executables_for: [:unix]
        ]
      ],
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.detail": :test,
        "coveralls.post": :test,
        "coveralls.html": :test
      ]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Api.Application, []},
      extra_applications: [
        :honeybadger,
        :lager,
        :logger,
        :runtime_tools,
        :amqp,
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
      {:credo, "~> 1.4", only: [:dev, :test], runtime: false},
      {:phoenix, "~> 1.5.1"},
      {:phoenix_pubsub, "~> 2.0.0"},
      {:phoenix_ecto, "~> 4.1"},
      {:ecto_sql, "~> 3.4.2"},
      {:absinthe, "~> 1.5"},
      {:absinthe_plug, "~> 1.5"},
      {:dataloader, "~> 1.0.7"},
      {:corsica, "~> 1.1.3"},
      {:postgrex, ">= 0.0.0"},
      {:gettext, "~> 0.17.4"},
      {:jason, "~> 1.2.0"},
      {:plug_cowboy, "~> 2.3.0"},
      {:comeonin, "~> 5.3.1"},
      {:bcrypt_elixir, "~> 2.2.0"},
      {:guardian, "~> 2.1.1"},
      {:ex_aws, "~> 2.1.3"},
      {:ex_aws_s3, "~> 2.0.2"},
      {:hackney, "~> 1.15"},
      {:sweet_xml, "~> 0.6.6"},
      {:poison, "~> 4.0.1"},
      {:uuid, "~> 1.1.8"},
      {:gen_rmq, "~> 2.6.0"},
      {:ex_ical, "~> 0.2.0"},
      {:timex, "~> 3.0"},
      {:honeybadger, "~> 0.14.0"},
      {:redix, ">= 0.0.0"},
      {:con_cache, "~> 0.14"},
      {:elasticsearch, "~> 1.0.0"},
      # live dashboard
      {:telemetry_poller, "~> 0.4"},
      {:telemetry_metrics, "~> 0.4"},
      {:phoenix_live_dashboard, "~> 0.1"},
      # test
      {:excoveralls, "~> 0.12", only: :test}
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
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end

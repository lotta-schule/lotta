defmodule Api.MixProject do
  use Mix.Project

  def project do
    [
      app: :api,
      version: "1.1.0",
      elixir: "~> 1.9",
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
      ],
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Api.Application, []},
      extra_applications: [:honeybadger, :lager, :logger, :runtime_tools, :amqp, :ssl, :inets, :con_cache]
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
      {:phoenix, "~> 1.4.6"},
      {:phoenix_pubsub, "~> 1.1"},
      {:phoenix_ecto, "~> 4.0"},
      {:ecto_sql, "~> 3.0"},
      {:absinthe, "~> 1.4.16"},
      {:absinthe_plug, "~> 1.4.7"},
      {:dataloader, "~> 1.0.0"},
      {:cors_plug, "~> 2.0.0"},
      {:postgrex, ">= 0.0.0"},
      {:gettext, "~> 0.11"},
      {:jason, "~> 1.0"},
      {:plug_cowboy, "~> 2.0"},
      {:comeonin, "~> 5.1.2"},
      {:bcrypt_elixir, "~> 2.0.3"},
      {:guardian, "~> 1.2.1"},
      {:ex_aws, "~> 2.1"},
      {:ex_aws_s3, "~> 2.0"},
      {:hackney, "~> 1.12"},
      {:sweet_xml, "~> 0.6"},
      {:poison, "~> 4.0"},
      {:uuid, "~> 1.1"},
      {:amqp, "~> 1.2"},
      {:ex_ical, "~> 0.2.0"},
      {:honeybadger, "~> 0.13.0"},
      {:redix, ">= 0.0.0"},
      {:con_cache, "~> 0.14"},
      #test
      {:excoveralls, "~> 0.11", only: :test}
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

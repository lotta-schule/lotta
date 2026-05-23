# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

import_config("config/absinthe.exs")
import_config("config/backpex.exs")
import_config("config/cockpit.exs")
import_config("config/esbuild.exs")
import_config("config/tailwind.exs")
import_config("config/argon2.exs")
import_config("config/lotta_web_endpoint.exs")
import_config("config/gettext.exs")
import_config("config/junit.exs")
import_config("config/logger.exs")
import_config("config/oban.exs")
import_config("config/otel.exs")
import_config("config/phoenix.exs")
import_config("config/repo.exs")
import_config("config/tesla.exs")
# must come *after* Tesla
import_config("config/oauth2.exs")
import_config("config/tzdata.exs")
#
import_config("config/plans.exs")
import_config("config/billing.exs")

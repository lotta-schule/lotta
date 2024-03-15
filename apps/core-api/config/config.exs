# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

import_config("config/absinthe.exs")
import_config("config/argon2.exs")
import_config("config/endpoint.exs")
import_config("config/logger.exs")
import_config("config/phoenix.exs")
import_config("config/tesla.exs")
import_config("config/repo.exs")
import_config("config/gettext.exs")
import_config("config/junit.exs")

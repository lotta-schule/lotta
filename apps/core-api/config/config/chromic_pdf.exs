import Config

config :lotta, ChromicPDF, discard_stderr: config_env() == :prod

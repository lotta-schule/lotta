import Config

config :argon2_elixir,
  argon2_type: 1

if config_env() == :test do
  config :argon2_elixir,
    t_cost: 1,
    m_cost: 8
end

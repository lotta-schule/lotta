import Config

config :lotta, :idm_module, Lotta.Eduplaces.IDM
config :lotta, :auth_code_strategy_module, Lotta.Eduplaces.AuthCodeStrategy

if config_env() == :test do
  config :lotta, :idm_module, Lotta.Eduplaces.IDMMock
  config :lotta, :auth_code_strategy_module, Lotta.Eduplaces.AuthCodeStrategyMock
end

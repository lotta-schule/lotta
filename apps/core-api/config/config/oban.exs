import Config

if Mix.env() == :test do
  config :lotta, Oban, testing: :inline
end

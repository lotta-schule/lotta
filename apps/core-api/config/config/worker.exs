import Config

config :lotta, :default_content_module, Lotta.Tenants.DefaultContent
config :lotta, :analytics_module, Lotta.Analytics

config :lotta,
       :slack_module,
       Lotta.Administration.Notification.Slack

config :lotta, :tenants_usage_module, Lotta.Tenants
config :lotta, :billings_module, Lotta.Billings
config :lotta, :usage_query_module, Lotta.Tenants.Usage
config :lotta, :tenants_admin_module, Lotta.Tenants
config :lotta, :storage_module, Lotta.Storage
config :lotta, :accounts_group_module, Lotta.Accounts

if config_env() == :test do
  config :lotta, :default_content_module, Lotta.Tenants.DefaultContentMock
  config :lotta, :analytics_module, Lotta.AnalyticsMock
  config :lotta, :slack_module, Lotta.Administration.Notification.SlackMock
  config :lotta, :tenants_usage_module, Lotta.TenantsUsageMock
  config :lotta, :billings_module, Lotta.BillingsMock
  config :lotta, :usage_query_module, Lotta.Tenants.UsageMock
  config :lotta, :tenants_admin_module, Lotta.TenantsAdminMock
  # storage_module uses real Lotta.Storage in tests to avoid cascading stubs
  config :lotta, :accounts_group_module, Lotta.AccountsGroupMock
end

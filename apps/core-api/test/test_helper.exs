Application.ensure_all_started(:ex_machina)

ExUnit.configure(formatters: [JUnitFormatter, ExUnit.CLIFormatter])

Ecto.Adapters.SQL.Sandbox.mode(Lotta.Repo, :manual)

Mox.defmock(Lotta.Eduplaces.IDMMock, for: Lotta.Eduplaces.IDMBehaviour)
Mox.defmock(Lotta.Eduplaces.AuthCodeStrategyMock, for: Lotta.Eduplaces.AuthCodeStrategyBehaviour)
Mox.defmock(LottaWeb.UrlsMock, for: LottaWeb.UrlsBehaviour)
Mox.defmock(Lotta.Tenants.DefaultContentMock, for: Lotta.Tenants.DefaultContentBehaviour)
Mox.defmock(Lotta.AnalyticsMock, for: Lotta.AnalyticsBehaviour)

Mox.defmock(Lotta.Administration.Notification.SlackMock,
  for: Lotta.Administration.Notification.SlackBehaviour
)

Mox.defmock(Lotta.TenantsUsageMock, for: Lotta.TenantsUsageBehaviour)
Mox.defmock(Lotta.BillingsMock, for: Lotta.BillingsWorkerBehaviour)
Mox.defmock(Lotta.Tenants.UsageMock, for: Lotta.Tenants.UsageQueryBehaviour)
Mox.defmock(Lotta.TenantsAdminMock, for: Lotta.Tenants.AdminBehaviour)
Mox.defmock(Lotta.StorageMock, for: Lotta.StorageBehaviour)
Mox.defmock(Lotta.AccountsGroupMock, for: Lotta.AccountsGroupBehaviour)
Mox.defmock(Lotta.Storage.RemoteStorage.StrategyMock, for: Lotta.Storage.RemoteStorage.Strategy)
Mox.defmock(Lotta.ExileMock, for: Lotta.ExileBehaviour)
Mox.defmock(Lotta.ImageMock, for: Lotta.ImageBehaviour)

Mox.defmock(Lotta.Eduplaces.ClientCredentialStrategyMock,
  for: Lotta.Eduplaces.ClientCredentialStrategyBehaviour
)

Mox.defmock(Lotta.Eduplaces.OAuth2ClientMock, for: Lotta.Eduplaces.OAuth2ClientBehaviour)
Mox.defmock(Lotta.Eduplaces.JOSEJWTMock, for: Lotta.Eduplaces.JOSEJWTBehaviour)
Mox.defmock(Lotta.ChromicPDFMock, for: Lotta.ChromicPDFBehaviour)

ExUnit.start()

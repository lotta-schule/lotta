# Technical Debt: Migrate `Mock` / `:meck` to `Mox`

## Summary

18 test files use `import Mock` + `with_mock/3` from the [`mock`](https://hex.pm/packages/mock) package,
which is backed by Erlang's `:meck`. This patches BEAM modules **globally** at the node level, which
means any test file containing `with_mock` **cannot be marked `async: true`** without risking
intermittent test failures across the suite.

## Why this was not tackled in the main optimization plan

Migrating to `Mox` requires adding `@behaviour` and `@callback` declarations to the **production
modules** that are currently being mocked. None of those modules have behaviours today. Adding
behaviours is an intentional production architecture decision, not a test-only change. It was
deferred to keep the optimization plan focused on test infrastructure.

## Affected files (18 total)

| File                                                     | Mocked module(s)                   |
| -------------------------------------------------------- | ---------------------------------- |
| `test/cockpit_web/live/tenant_live_test.exs`             | (inspect to confirm)               |
| `test/cockpit_web/item_actions/delete_tenant_test.exs`   | (inspect to confirm)               |
| `test/lotta_web/controllers/oauth_contoller_test.exs`    | `Lotta.Eduplaces.AuthCodeStrategy` |
| `test/lotta_web/resolvers/file_resolver_test.exs`        | (inspect to confirm)               |
| `test/lotta/tenants_test.exs`                            | `Lotta.Accounts`                   |
| `test/lotta/push_notification_test.exs`                  | (inspect to confirm)               |
| `test/lotta_web/controllers/storage_controller_test.exs` | (inspect to confirm)               |
| `test/lotta/eduplaces/auth_code_strategy_test.exs`       | (inspect to confirm)               |
| `test/lotta/eduplaces/idm_test.exs`                      | (inspect to confirm)               |
| `test/lotta/eduplaces/syncer_test.exs`                   | `Lotta.Eduplaces.IDM`              |
| `test/lotta/storage/image_processor_test.exs`            | (inspect to confirm)               |
| `test/lotta/storage/remote_storage_test.exs`             | (inspect to confirm)               |
| `test/lotta/storage/file_data_test.exs`                  | (inspect to confirm)               |
| `test/lotta/administration/notification/slack_test.exs`  | (inspect to confirm)               |
| `test/lotta/billings/invoice_test.exs`                   | (inspect to confirm)               |
| `test/lotta/worker/tenant_test.exs`                      | (inspect to confirm)               |
| `test/lotta/worker/media_conversion_test.exs`            | (inspect to confirm)               |
| `test/lotta/worker/conversion_test.exs`                  | (inspect to confirm)               |

## What needs to happen

### Step 1 — Add `mox` to dependencies

In `mix.exs`:

```elixir
{:mox, "~> 1.0", only: :test}
```

Remove `{:mock, ...}` only after all files are migrated.

### Step 2 — Define behaviours in production modules

For each distinct module being mocked, add a behaviour. Example for `Lotta.Eduplaces.IDM`:

```elixir
# In lib/lotta/eduplaces/idm.ex
@behaviour Lotta.Eduplaces.IDMBehaviour

# New file: lib/lotta/eduplaces/idm_behaviour.ex
defmodule Lotta.Eduplaces.IDMBehaviour do
  @callback list_groups(tenant :: term()) :: {:ok, list()} | {:error, term()}
  @callback get_group(group :: term()) :: {:ok, map()} | {:error, term()}
  # ... etc
end
```

### Step 3 — Declare mocks in `test/test_helper.exs`

```elixir
Mox.defmock(Lotta.Eduplaces.IDMMock, for: Lotta.Eduplaces.IDMBehaviour)
# ... one line per mocked module
```

### Step 4 — Wire mock into config for test env

```elixir
# config/test.exs
config :lotta, :idm_module, Lotta.Eduplaces.IDMMock
```

```elixir
# production code calls Application.get_env(:lotta, :idm_module, Lotta.Eduplaces.IDM)
```

### Step 5 — Replace `with_mock` call sites

Before (meck):

```elixir
with_mock IDM,
  list_groups: fn _tenant -> {:ok, [...]} end do
  # ...
end
```

After (Mox):

```elixir
Mox.expect(IDMMock, :list_groups, fn _tenant -> {:ok, [...]} end)
# ... call the function under test
```

### Step 6 — Mark migrated files `async: true`

Once a file uses only Mox (no `with_mock`), add `async: true` to `use Lotta.DataCase`.

## Constraints and gotchas

- `Mox.expect/3` is **process-local by default** — safe for async. Use `Mox.allow/3` if spawned
  processes need to call the mock.
- `Mox.stub/3` (not `expect`) is appropriate for mocks where the number of calls is not asserted.
- If a module is mocked in `setup` rather than inside a test, prefer `stub` over `expect`.
- `:passthrough` behaviour (currently used in some `with_mock` calls) has no direct Mox equivalent —
  you need to explicitly delegate to the real implementation in the stub/expect body if needed.
- The `mock` package can stay in deps temporarily during the migration; just stop importing it in
  migrated files.

## Priority order for migration

Start with the most isolated mocks first (fewest callbacks, no passthrough):

1. `Lotta.Eduplaces.IDM` — used in `syncer_test.exs`, well-scoped module
2. `Lotta.Eduplaces.AuthCodeStrategy` — used in oauth controller tests
3. Storage-related mocks — `image_processor_test.exs`, `remote_storage_test.exs`, `file_data_test.exs`
4. `Lotta.Accounts` passthrough mock in `tenants_test.exs` — most complex, do last

## Acceptance criteria

- [ ] `mock` package removed from `mix.exs`
- [ ] All 18 files use `Mox` instead of `with_mock`
- [ ] All 18 files marked `async: true`
- [ ] No global `:meck` patches remain in the test suite

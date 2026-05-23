defmodule Cockpit.Feedback.Feedback do
  @moduledoc """
  A struct representing feedback to be sent to Zammad
  """
  alias Lotta.Tenants.Tenant

  defstruct [:user, :tenant, :title, :message]

  defmodule User do
    @moduledoc """
    A struct representing the user submitting feedback
    """
    defstruct([:email, :name])
  end

  @type t() :: %__MODULE__{
          user: User.t(),
          tenant: Tenant.t() | nil,
          title: String.t() | nil,
          message: String.t()
        }

  @spec new([{:name, String.t()}, {:email, String.t()}, {:message, String.t()}]) :: t()
  def new(opts \\ []) do
    user = %User{
      name: Keyword.get(opts, :name, ""),
      email: Keyword.get(opts, :email, "")
    }

    %__MODULE__{user: user, message: Keyword.get(opts, :message, "")}
  end

  def set_tenant(%__MODULE__{} = feedback, tenant) do
    %__MODULE__{feedback | tenant: tenant}
  end

  def set_title(%__MODULE__{} = feedback, title) do
    %__MODULE__{feedback | title: title}
  end

  def set_message(%__MODULE__{} = feedback, message) do
    %__MODULE__{feedback | message: message}
  end
end

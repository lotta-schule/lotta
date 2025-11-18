defmodule Lotta.Tenants.Tenant do
  @moduledoc """
    Ecto Schema for tenants
  """
  alias Lotta.Tenants

  use Ecto.Schema

  import Ecto.Changeset

  @type id() :: pos_integer()

  @type stats() :: %{
          user_count: pos_integer(),
          article_count: pos_integer(),
          category_count: pos_integer(),
          file_count: pos_integer()
        }

  @type configuration() :: %{
          custom_theme: map() | nil,
          user_max_storage_config: String.t() | nil,
          is_email_registration_enabled: boolean() | nil
        }

  @type empty() :: %__MODULE__{
          slug: String.t(),
          title: String.t()
        }

  @type t() :: %__MODULE__{
          id: id(),
          title: String.t(),
          address: String.t() | nil,
          type: String.t() | nil,
          eduplaces_id: String.t() | nil,
          slug: String.t(),
          prefix: String.t(),
          configuration: configuration(),
          logo_image_file_id: Lotta.Storage.File.id() | nil,
          background_image_file_id: Lotta.Storage.File.id() | nil,
          state: :init | :active | :readonly,
          current_plan_name: String.t() | nil,
          current_plan_expires_at: Date.t() | nil,
          next_plan_name: String.t() | nil,
          customer_no: String.t() | nil,
          billing_address: String.t() | nil,
          contact_name: String.t() | nil,
          contact_email: String.t() | nil,
          contact_phone: String.t() | nil
        }

  schema "tenants" do
    field(:title, :string)
    field(:slug, :string)
    field(:prefix, :string)
    field(:address, :string)
    field(:type, :string)
    field(:state, Ecto.Enum, values: [:init, :active, :readonly], default: :init)

    embeds_one(:configuration, TenantConfiguration, primary_key: false, on_replace: :delete) do
      field(:custom_theme, :map)
      field(:user_max_storage_config, :string)
      field(:is_email_registration_enabled, :boolean, default: true)
    end

    # These fields are not used in the public schema, but in
    # the tenant's own database prefix.
    # Therefore, they are not represented by an Ecto association.
    field(:logo_image_file_id, :binary_id)
    field(:background_image_file_id, :binary_id)

    field(:eduplaces_id, :string, default: nil)

    # Billing fields
    field(:current_plan_name, :string)
    field(:current_plan_expires_at, :date)
    field(:next_plan_name, :string)
    field(:customer_no, :string)
    field(:billing_address, :string)
    field(:contact_name, :string)
    field(:contact_email, :string)
    field(:contact_phone, :string)

    has_many(:custom_domains, Lotta.Tenants.CustomDomain)
    has_many(:additional_items, Lotta.Billings.AdditionalItem)
    has_many(:invoices, Lotta.Billings.Invoice)

    timestamps()
  end

  @doc """
  Changeset to be used for tenant creation.
  """
  @doc since: "2.6.0"
  @spec create_changeset(map()) :: Ecto.Changeset.t()
  def create_changeset(attrs) do
    %__MODULE__{}
    |> cast(attrs, [:title, :slug, :address, :type, :eduplaces_id])
    |> validate_required([:title])
    |> maybe_gen_slug()
    |> validate_required([:slug])
    |> unique_constraint(:slug)
    |> assign_default_plan()
  end

  @doc """
  Changeset to be used for Updating tenant.
  """
  @doc since: "2.6.0"
  @spec update_changeset(t(), map()) :: Ecto.Changeset.t()
  def update_changeset(tenant, attrs) do
    tenant
    |> cast(attrs, [
      :title,
      :address,
      :type,
      :logo_image_file_id,
      :background_image_file_id,
      :customer_no,
      :billing_address,
      :contact_name,
      :contact_email,
      :contact_phone
    ])
    |> validate_required([:title, :slug, :prefix])
    |> unique_constraint(:slug)
    |> maybe_put_embed(:configuration, attrs[:configuration])
  end

  defp maybe_put_embed(changeset, :configuration, nil), do: changeset

  defp maybe_put_embed(changeset, :configuration, attrs),
    do: put_embed(changeset, :configuration, attrs)

  defp maybe_gen_slug(changeset) do
    case get_field(changeset, :slug) do
      nil ->
        title = get_field(changeset, :title) || ""

        slug =
          title |> String.downcase() |> String.replace(~r/[^a-z0-9]+/u, "-") |> String.trim("-")

        put_change(changeset, :slug, slug)

      _ ->
        changeset
    end
  end

  def generate_slug(title) do
    base_slug =
      title
      |> String.downcase()
      |> String.replace(~r/[^a-z0-9]+/u, "-")
      |> String.trim("-")

    Enum.reduce_while(1..1000, nil, fn i, _acc ->
      slug = if i == 1, do: base_slug, else: "#{base_slug}-#{i}"

      if Tenants.slug_available?(slug),
        do: {:halt, slug},
        else: {:cont, nil}
    end)
  end

  defp assign_default_plan(changeset) do
    with {plan_name, _plan} <- Lotta.Billings.Plans.get_default() do
      expires_at = Lotta.Billings.Plans.calculate_expiration(plan_name)
      next_plan = Lotta.Billings.Plans.get_next_plan_name(plan_name)

      changeset
      |> put_change(:current_plan_name, plan_name)
      |> put_change(:current_plan_expires_at, expires_at)
      |> put_change(:next_plan_name, next_plan)
    end
  end
end

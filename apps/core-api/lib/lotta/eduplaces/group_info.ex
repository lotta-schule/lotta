defmodule Lotta.Eduplaces.GroupInfo do
  @moduledoc """
  Represents information about a Eduplaces Group retrieved from Eduplaces.
  """
  defstruct [:id, :name]

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t()
        }
  def from_jwt_info(%{
        "id" => id,
        "name" => name
      }) do
    %__MODULE__{
      id: id,
      name: name
    }
  end
end

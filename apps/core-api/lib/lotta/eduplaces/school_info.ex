defmodule Lotta.Eduplaces.SchoolInfo do
  @moduledoc """
  Represents information about a Eduplaces school retrieved from Eduplaces.
  """
  defstruct [:id, :name, :official_id, :schooling_level]

  @type t :: %__MODULE__{
          id: String.t(),
          name: String.t(),
          official_id: String.t() | nil,
          schooling_level: String.t()
        }

  def from_jwt_info(
        %{
          "school" => school_id,
          "school_name" => school_name,
          "schooling_level" => schooling_level
        } = jwt_info
      ) do
    school_official_id = jwt_info["school_official_id"] || jwt_info["school"] || nil

    %__MODULE__{
      id: school_id,
      name: school_name,
      official_id: school_official_id,
      schooling_level: schooling_level
    }
  end
end

defmodule Lotta.ChromicPDFBehaviour do
  @moduledoc false
  @callback print_to_pdf(term(), keyword()) :: {:ok, binary()} | {:error, any()}
end

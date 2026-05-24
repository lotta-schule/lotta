defmodule Lotta.ChromicPDFBehaviour do
  @callback print_to_pdf(term(), keyword()) :: {:ok, binary()} | {:error, any()}
end

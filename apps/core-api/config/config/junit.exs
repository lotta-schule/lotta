import Config

if config_env() == :test do
  config :junit_formatter,
    print_report_file: true,
    include_filename?: true,
    include_file_line?: true
end

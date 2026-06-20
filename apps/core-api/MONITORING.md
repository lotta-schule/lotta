# Local Monitoring Stack

This directory includes a complete observability stack for local development, mirroring the production infrastructure.

## Services

| Service    | Port  | Description                                    |
| ---------- | ----- | ---------------------------------------------- |
| Grafana    | 3080  | Visualization dashboard (admin/admin)          |
| Prometheus | 9090  | Metrics storage and querying                   |
| Loki       | 3100  | Log aggregation                                |
| Tempo      | 3200  | Distributed tracing backend                    |
| Alloy      | 12345 | Observability pipeline (OTLP receiver on 4317) |

## Quick Start

```bash
docker-compose -f docker-compose.services.yaml up -d grafana alloy tempo prometheus loki
```

Access Grafana at http://localhost:3080 (admin/admin)

## Architecture

The stack closely matches the production infrastructure defined in `/infrastructure/terraform`:

- **Alloy** replaces the production k8s-monitoring helm chart for local development
- **Tail-based sampling** configuration mirrors production (100% staging, slow traces >2s, errors, 1% baseline)
- **OTLP endpoints** for trace ingestion (gRPC: 4317, HTTP: 4318)
- **Automatic datasource provisioning** in Grafana

## Sending Telemetry

### Traces (OTLP)

Configure your application to send OTLP traces to:

- gRPC: `localhost:4317`
- HTTP: `localhost:4318`

For the core-api (Elixir/OpenTelemetry), add to your config:

```elixir
config :opentelemetry, traces_exporter: :otlp
config :opentelemetry_exporter,
  otlp_endpoint: "http://localhost:4317",
  otlp_headers: []
```

### Metrics

The core-api exposes Prometheus metrics on port 9567. Prometheus is configured to scrape:

- `host.docker.internal:9567` (core-api metrics)
- All container metrics via Alloy's Docker discovery

### Logs

Alloy automatically collects Docker container logs via the Docker socket and forwards them to Loki.

## Dashboards

Three dashboards are provisioned automatically:

1. **Platform Health** - Overall system health, request rates, resource usage
2. **Webapp Health** - Application-specific metrics (latency, errors)
3. **Errors and Traces** - Error logs and trace correlation

## Data Retention

- **Tempo**: 48 hours (configured in tempo.yaml)
- **Prometheus**: Local storage in `./_data/prometheus`
- **Loki**: 168 hours / 7 days (configured in loki.yaml)

## Production Parity

| Component     | Production                    | Local Development      |
| ------------- | ----------------------------- | ---------------------- |
| Tracing       | Scaleway Cockpit (Tempo)      | Local Tempo            |
| Metrics       | Scaleway Cockpit (Prometheus) | Local Prometheus       |
| Logs          | Scaleway Cockpit (Loki)       | Local Loki             |
| Pipeline      | Alloy (k8s-monitoring chart)  | Alloy (docker-compose) |
| Sampling      | Tail-based (policies)         | Same policies          |
| Visualization | Scaleway Grafana              | Self-hosted Grafana    |

## Troubleshooting

### Alloy not collecting traces

Ensure the Docker socket is accessible:

```bash
ls -la /var/run/docker.sock
```

### Prometheus not scraping core-api

The `host.docker.internal` hostname is used to reach the host machine. On Linux, you may need to add:

```yaml
extra_hosts:
  - 'host.docker.internal:host-gateway'
```

### Grafana datasources not appearing

Check the provisioning logs:

```bash
docker-compose logs grafana | grep -i provision
```

## Cleanup

Remove all monitoring data:

```bash
rm -rf ./_data/{tempo,prometheus,loki,grafana}
```

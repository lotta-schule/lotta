# Api

API written for Lotta API Server

Phoenix, Elixir & Absinthe

## Setup

Make sure to have docker installed.
Then, copy the `.env.sample` to `.env`, and replace the values by values
for a real s3-compatible store (you can use s3 itself,
or digitalocean for example.
You could also start a minIO server via docker
(TODO: that would be useful to add to standard developer setup))

Then, install dependencies:

```bash
make dependencies
```

Then, migrate the database and add the seeds:
Just run

```bash
make setup_db
```

## Start


```bash
make start
```

## Develop

```bash
# start the dev server
make start

# execute tests
make tests

# execute tests
mix doc

# install dependencies
make dependencies

# Setup Database
make setup_db

# Migrate Database
make migrate_db
```

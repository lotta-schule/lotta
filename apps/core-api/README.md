# Api

API written for Lotta API Server

Phoenix, Elixir & Absinthe



## Setup

Before the first start, you'll have to install the dependencies:

```bash
docker-compose run app mix do deps.get, compile
```

Then, migrate the database and add the seeds:
Just run

```bash
docker-compose run app mix ecto.setup
```

## Start


```bash
docker-compose up
```

Now you can visit [`localhost:4000`](http://localhost:4000/graphiql) for GraphiQL browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: http://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Mailing list: http://groups.google.com/group/phoenix-talk
  * Source: https://github.com/phoenixframework/phoenix

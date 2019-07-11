## Veil Market Creation

Adapted from Veil's market creation interface, this tool lets you easily create and update draft markets, and activate them when they're ready.

Use it here: [https://create.veil.co](https://create.veil.co)

### Development

To run locally, you must clone this repo and install the dependencies (we prefer using [yarn](https://yarnpkg.com/en/)):

```bash
git clone https://github.com/veilco/veil-market-creation.git
cd veil-market-creation
yarn
cp .env.example .env
```

You'll need an Ethereum node to connect to, so update the `ETHEREUM_HTTP` variable in `.env` to a publicly-accessible Ethereum node RPC URL (such as an [Infura](https://infura.io/) or [Alchemy](https://alchemyapi.io/) endpoint).

You'll also need a local PostgreSQL database named `veil_market_creation` with a `veil` user (or you can tweak `knexfile.js` to match your environment).

Once you have that, you can start the backend endpoint (powered by GraphQL):

```bash
yarn migrate
yarn dev:api
```

And in a separate terminal, start the frontend server:

```bash
yarn dev:web
```

You should be able to head to `localhost:9000` to see the app.

### Deploy to Heroku

To deploy to heroku, you'll need to create an app, attach a database, and set a few configuration variables.

```bash
heroku apps:create veil-market-creation
heroku git:remote -a veil-market-creation
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NETWORK_ID=1 ETHEREUM_HTTP=[YOUR_ETHEREUM_ENDPOINT] AUGUR_NODE_URL=ws://predictions.market:9001 YARN_PRODUCTION=true
git push heroku master
heroku ps:scale worker=1
```

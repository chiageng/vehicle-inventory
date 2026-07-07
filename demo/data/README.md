# Local data store

The interactive preview persists data in JSON files (created automatically on first run):

| File | Purpose |
|------|---------|
| `users.json` | User accounts |
| `conversations.json` | Buyer–seller message threads |
| `marketplace.json` | Vehicles, listings, photos, valuations |

To restore the default sample dataset, run `npm run reset-data` from the `demo/` folder and restart the dev server.

These files are not committed to git.

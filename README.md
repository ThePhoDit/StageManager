# Stage Manager for Discord

Easily manage who speaks next in your stage channel by the order members raised their hands. You can also add priority roles (every three priority speakers a regular one is picked).

## Commands

- `v!start` when no audience member is speaking.
- `v!next` when an audience member is speaking.

## How to setup?

1. Clone the repo.
2. Create a `.env` file and add your bot's token.
```env
TOKEN=YOUR_TOKEN_GOES_HERE
```
3. Edit the fields __prefix__ and __priorityRoles__ from the `index.js` file as stated there.
4. Run `npm install` .
5. Run the file with `node .` .
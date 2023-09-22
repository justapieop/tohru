# tohru

A music Discord bot. Crafted with DiscordJS

Thank you for using our bot. Here is some details about Tohru:

- Many features that are often paid on other bots are no-cost here.

- You can modify and propose changes to the bot.

- Cute: It's Tohru.

## Contributing

You are free to contribute to the source code as long as it bugs free and
maintainable.

## Building and Deploying

There are two ways you can build and deploy the bot on your premises.

### System requirements

- Any OSes that support NodeJS 18 or later
- NodeJS 18 or later
- Git
- Docker (If you are going to deploy on Docker)

### Manual Build

First, clone the repository:

```bash
git clone https://github.com/justapieop/tohru
```

Open a terminal session with the current working directory being the root
directory of this project:

```bash
cd tohru
```

Install all dependencies:

```bash
npm install
```

Build the project

```bash
npm run build
```

Or if you already have global Typescript compiler

```bash
tsc
```

Create a file named `.env` and fill in the variable having the same outline to
the `.env.example` file.

Run the bot:

```bash
npm run start
```

### Docker

Assuming that you already have cloned the repository and had a terminal session
with the working directory being the root of this project, together with the
pre-populated `.env` file that are also within the project's root directory,
building with Docker is fairly simple.

Build the Docker image:

```bash
docker build -t tohru:latest .
```

- Note: There is also a prebuilt image on the `Packages` section. To pull this,
  use:

```bash
docker pull ghcr.io/justapieop/tohru:main
```

Enter the command below:

```bash
docker run --env-file .env tohru:latest
```

Or

```bash
docker run --env-file .env ghcr.io/justapieop/tohru:main
```

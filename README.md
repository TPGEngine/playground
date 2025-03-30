<div align="center">
<h3 align="center">TPG Playground</h3>

  <p align="center">
    Interactive web platform for evolving policies with Tangled Program Graphs in MuJoCo environments.
    <br />
    <a href="https://github.com/tpgengine/playground">github.com/tpgengine/playground</a>
  </p>
</div>

## Table of Contents

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

The TPG Playground is an interactive web interface designed for experimenting with Tangled Program Graphs (TPG) in various MuJoCo environments. This platform allows users to evolve policies, visualize the learning process, and gain insights into the behavior of TPG agents. It provides a user-friendly environment for researchers, developers, and enthusiasts to explore the capabilities of TPG in reinforcement learning tasks.

### Key Features

- **Interactive Environment Selection:** Choose from a variety of MuJoCo environments to train and test TPG agents.
- **Real-time Visualization:** Observe the agent's behavior in the selected environment during the evolution process.
- **Policy Evolution:** Evolve policies using the TPG algorithm directly within the web interface.
- **Experiment Tracking:** Track and visualize training experiments, including generation number, fitness scores, and other relevant metrics.
- **WebRTC Integration:** Utilizes WebRTC for real-time video streaming of the agent's visualization.
- **WebSocket Communication:** Implements WebSocket for signaling and communication between the client and server.
- **Responsive Design:** Provides a seamless experience across different devices and screen sizes.

## Built With

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [TypeScript](https://www.typescriptlang.org/) - A superset of JavaScript which primarily provides static typing.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS
- [Framer Motion](https://www.framer.com/motion/) - A production-ready motion library for React
- [@tanstack/react-query](https://tanstack.com/query/latest) - Powerful asynchronous state management for React
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper for the browser

## Getting Started

To get started with the TPG Playground, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (version >= 18)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/tpgengine/playground.git
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Start the backend signaling server - ensure that you have the [tpg]{https://github.com/TPGEngine/tpg.git} repo fully setup with `uv` installed

   ```sh
   git checkout feat/tpg-web
   cd src/src/api
   uv sync
   uv run fastapi dev
   ```

This will start the application in development mode. Open your browser and navigate to `http://localhost:8080` to view the TPG Playground.

## Acknowledgments

- This README was created using [gitreadme.dev](https://gitreadme.dev) — an AI tool that looks at your entire codebase to instantly generate high-quality README files.
- Special thanks to the creators and maintainers of the open-source libraries used in this project.

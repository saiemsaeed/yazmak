# Yazmak

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A minimalist web-based text editor built with React, featuring Vim keybindings.

## Overview

Yazmak is a modern, lightweight text editor designed for simplicity and ease of use. Built as a single-page application using React, Yazmak provides a clean interface for distraction-free writing and coding.

## Features

- 🚀 Modern, responsive web interface
- ⌨️ Vim keybindings for efficient text editing
- 📱 Works in any modern web browser
- 🎨 Minimalist design philosophy
- ⚡ Fast and lightweight performance

# Yazmak

A minimalist web-based text editor built with React, featuring Vim keybindings.

## Installation

```bash
npm install yazmak
# or
yarn add yazmak
```

## Contribution

```bash
# Clone the repository
git clone https://github.com/saiemsaeed/yazmak.git

# Navigate to the project directory
cd yazmak

# Install dependencies
yarn install

# Start the development server
yarn dev
```

## Usage

```jsx
import { CustomEditor } from "yazmak";
import "yazmak/style.css"; // Important: import the styles

function App() {
  return (
    <CustomEditor
      initialText="# Hello World"
      lineRenderer={(line) => line}
      config={{ showLineNumbers: true }}
    />
  );
}
```

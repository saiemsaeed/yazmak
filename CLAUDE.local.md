# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yazmak is a minimalist web-based text editor React component with optional Vim keybindings. It's published as an NPM package and focuses on providing a customizable, extensible editor experience.

## Development Commands

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build the package for distribution
yarn build

# Preview production build
yarn preview

# Run linting
yarn lint

# Type checking (part of build process)
yarn tsc -b
```

## Architecture Overview

The editor is built as a React component with a focus on modularity and extensibility:

1. **Main Component**: `CustomEditor.tsx` - The core editor component that manages state, handles user input, and coordinates all editor functionality.

2. **Key Systems**:
   - **Vim Mode**: Optional Vim keybindings with NORMAL/INSERT mode support (see `constants/vim-key-bindings.ts`)
   - **Custom Line Rendering**: Extensible line rendering system allowing custom components per line
   - **Theme System**: CSS-based theming with multiple built-in themes in `src/themes/`
   - **Cursor Management**: Sophisticated cursor positioning and movement logic in `helpers/cursor-handler.ts`

3. **State Management**: 
   - Editor state is managed locally within the CustomEditor component
   - Uses React hooks for state management
   - Supports controlled component pattern via `value` and `onChange` props

4. **Key Type Definitions**:
   - `EditorState` (types.ts): Core editor state including lines, cursor position, mode
   - `KeyBinding` (types/key-bindings.ts): Keyboard shortcut definitions
   - Handler types in `types/handlers.ts` for various editor operations

## Package Distribution

This is distributed as an NPM package. When making changes:

1. The package exports both the component and CSS files
2. TypeScript declarations are auto-generated during build
3. Vite library mode is configured to bundle as ES modules
4. CSS is included in the main bundle (not code-split)

## Code Style Guidelines

1. **TypeScript**: Strict mode is enabled. Ensure all code passes type checking.
2. **React**: Use functional components with hooks
3. **CSS**: Component styles in `CustomEditor.css`, theme styles in `themes/`
4. **Exports**: Main exports are defined in `src/index.ts`

## Testing

**Note**: No test framework is currently set up. When implementing tests, consider adding Vitest (compatible with Vite) or Jest.

## Key Implementation Details

1. **Line Management**: Lines are stored as an array of strings in state. Each line is rendered independently.
2. **Cursor Position**: Managed as `{line: number, col: number}` with bounds checking
3. **Vim Mode**: When enabled, intercepts keyboard events and processes them according to Vim keybindings
4. **Clipboard**: Custom clipboard handling in `helpers/clipboard.ts` for copy/paste operations
5. **Selection**: Text selection logic in `helpers/selection.ts` handles visual selection mode

## Common Tasks

### Adding a New Vim Command
1. Add the keybinding definition to `constants/vim-key-bindings.ts`
2. Implement the handler function if needed
3. Test in both NORMAL and INSERT modes

### Adding a New Theme
1. Create a new CSS file in `src/themes/`
2. Follow the CSS variable pattern from existing themes
3. Import and export from the main index.ts if needed

### Modifying Editor Behavior
1. Most behavior is controlled through the CustomEditor component
2. Helper functions in `src/helpers/` handle specific operations
3. Ensure TypeScript types are updated for any new props or state
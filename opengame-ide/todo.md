# OpenGame IDE - Project TODO

## Database & Backend Infrastructure
- [x] Create database schema for projects, sessions, and API settings
- [x] Implement API key encryption and secure storage
- [x] Create tRPC procedures for project CRUD operations
- [x] Create tRPC procedures for session management
- [x] Create tRPC procedures for API settings management

## LLM Integration & Streaming
- [x] Implement LLM provider abstraction (OpenAI, Anthropic, Gemini)
- [x] Create streaming endpoint for LLM chat responses
- [x] Implement token-by-token streaming to frontend
- [x] Add error handling and retry logic for LLM calls
- [x] Create tRPC procedure for chat message submission with streaming

## Frontend - Layout & IDE Structure
- [x] Design and implement dark theme CSS variables
- [x] Create main IDE layout component with resizable panels
- [x] Implement responsive sidebar for projects/sessions
- [x] Create header with project title and settings button
- [ ] Set up panel resizing and layout persistence

## Frontend - API Settings Panel
- [x] Create API settings modal/panel component
- [x] Implement form fields for OpenAI API key
- [x] Implement form fields for Anthropic API key
- [x] Implement form fields for Gemini API key
- [x] Add model selector dropdown
- [x] Implement secure key storage and validation
- [x] Add visual feedback for saved settings

## Frontend - Chat Interface
- [x] Create chat message component with markdown rendering
- [x] Implement chat input field with send button
- [x] Add message history display with scrolling
- [x] Implement streaming message display (token-by-token)
- [x] Add user/assistant message differentiation styling
- [ ] Implement chat clearing and session management

## Frontend - Code Editor
- [ ] Integrate Monaco Editor or similar syntax highlighting library
- [x] Implement code editor panel with language detection
- [x] Add code copy button
- [x] Implement code editing with change tracking
- [ ] Add syntax highlighting for HTML/CSS/JavaScript
- [ ] Create code formatting options

## Frontend - Game Preview (iframe)
- [x] Create iframe preview panel component
- [x] Implement sandbox security for iframe
- [x] Add "Запустить игру" button to render game code
- [ ] Implement error boundary for preview failures
- [ ] Add preview refresh and clear buttons
- [ ] Implement console output display

## Frontend - Project/Session Sidebar
- [x] Create sidebar component with project list
- [x] Implement session/project switching
- [x] Add create new project button
- [ ] Implement project deletion with confirmation
- [ ] Add project rename functionality
- [ ] Implement project search/filter
- [ ] Add last modified timestamp display

## Frontend - Integration & Polish
- [ ] Connect chat to LLM streaming endpoint
- [x] Connect code editor to extracted game code
- [x] Connect "Запустить игру" button to iframe preview
- [ ] Implement auto-save for projects and sessions
- [x] Add loading states and spinners
- [ ] Implement error notifications and toasts
- [ ] Add keyboard shortcuts for common actions

## Testing & Deployment
- [x] Write vitest tests for backend procedures
- [ ] Write vitest tests for LLM streaming logic
- [ ] Test chat streaming with different LLM providers
- [ ] Test game preview rendering in iframe
- [ ] Test project save/load functionality
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance optimization and monitoring
- [ ] Create deployment checkpoint

## Completed

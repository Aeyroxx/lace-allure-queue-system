<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Lace and Allure Queue System - Development Guidelines

This is a Node.js web application for managing order queues in a retail environment, specifically designed for Lace and Allure business operations.

## Project Structure
- `server.js` - Main Express.js server with Socket.io for real-time updates
- `views/` - EJS templates for the web interface
- `public/` - Static assets (CSS, JavaScript, sounds)
- `data/` - JSON-based data storage for products and queue items

## Key Features
- Real-time queue management with Socket.io
- Order status tracking (pending, in-progress, done, next-day)
- Product management system for admins
- Follow-up system for orders
- Sound notifications for new items
- Responsive Bootstrap-based UI

## Development Guidelines

### Code Style
- Use ES6+ features where appropriate
- Follow camelCase naming convention
- Use async/await for asynchronous operations
- Add comprehensive error handling
- Include JSDoc comments for complex functions

### Architecture Patterns
- MVC pattern with Express.js
- Client-side JavaScript classes for each page (QueueManager, AdminManager, etc.)
- RESTful API endpoints for CRUD operations
- Socket.io for real-time communication

### Data Management
- JSON files for simple data persistence
- UUIDs for unique identifiers
- Timestamp tracking for created/updated dates
- Input validation on both client and server

### UI/UX Guidelines
- Bootstrap 5 for responsive design
- Font Awesome icons for visual consistency
- Toast notifications for user feedback
- Loading states for better UX
- Accessibility considerations (ARIA labels, keyboard navigation)

### Security Considerations
- Input sanitization and validation
- CORS configuration
- Rate limiting (consider implementing)
- Environment variables for configuration

When making changes:
1. Maintain consistency with existing code patterns
2. Test real-time functionality with multiple browser tabs
3. Ensure mobile responsiveness
4. Add appropriate error handling
5. Update documentation as needed

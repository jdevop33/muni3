# CouncilInsight Developer Guide

This document provides detailed information for developers working on the CouncilInsight codebase, including architecture decisions, code conventions, and development workflows.

## Table of Contents

- [Architecture Decisions](#architecture-decisions)
- [Code Organization](#code-organization)
- [Code Conventions](#code-conventions)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Testing Strategy](#testing-strategy)
- [Common Development Tasks](#common-development-tasks)
- [Performance Considerations](#performance-considerations)

## Architecture Decisions

### Dual-Deployment Architecture

CouncilInsight uses a dual-deployment architecture to separate concerns:

1. **Web Application (Vercel)**: Handles the user interface and API serving
2. **Data Ingestion (Cloud Run)**: Handles web scraping and data collection

This separation allows each service to be optimized for its specific role while sharing data through a common PostgreSQL database.

### Backend API Design

The backend follows a layered architecture:

1. **Routes Layer** (`server/routes.ts`): Handles HTTP requests and responses
2. **Storage Layer** (`server/storage.ts`): Provides data access abstraction
3. **Database Layer** (`server/db.ts`): Manages direct database connections

This separation allows for:
- Easy unit testing by mocking lower layers
- Swapping implementations (e.g., from in-memory to PostgreSQL)
- Consistent data access patterns

### Frontend Architecture

The frontend follows a component-based architecture with:

1. **Pages**: Top-level components that represent routes
2. **UI Components**: Reusable components for interface elements
3. **Hooks**: Custom React hooks for shared logic
4. **API Integration**: TanStack Query for data fetching and caching

## Code Organization

### Project Structure Rationale

- `client/`: Contains all frontend code
- `server/`: Contains all backend code
- `shared/`: Contains code shared between frontend and backend
- `maxun/`: Contains the data ingestion service

This separation allows for:
- Clear responsibility boundaries
- Parallel development of frontend and backend
- Simplified deployment pipelines

### Import Conventions

Follow these import conventions:

1. For client-side code:
   - Use `@/` imports for components, hooks, and utilities
   - Example: `import Button from '@/components/ui/button'`

2. For shared code:
   - Use absolute imports
   - Example: `import { User } from '@shared/schema'`

3. For server-side code:
   - Use relative imports within the server directory
   - Example: `import { db } from './db'`

## Code Conventions

### TypeScript Best Practices

1. **Type Everything**:
   - Define interfaces/types for all data structures
   - Use proper return types for functions
   - Avoid using `any` type

2. **Use Zod for Validation**:
   - Define schemas in `shared/schema.ts`
   - Use `zod` for runtime validation
   - Use `drizzle-zod` for database schema validation

3. **Nullability**:
   - Be explicit about null/undefined values
   - Use optional chaining (`?.`) for potentially null values
   - Use nullish coalescing (`??`) for default values

### React Component Structure

1. **Functional Components**:
   - Use function components with hooks
   - Define proper prop types with interfaces
   - Use destructuring for props

   ```tsx
   interface ButtonProps {
     variant?: 'primary' | 'secondary';
     children: React.ReactNode;
     onClick?: () => void;
   }

   export function Button({ 
     variant = 'primary', 
     children, 
     onClick 
   }: ButtonProps) {
     // Component implementation
   }
   ```

2. **Custom Hooks**:
   - Extract reusable logic into custom hooks
   - Prefix hooks with `use` (e.g., `useAuth`, `useTopics`)
   - Return object with named properties for clarity

3. **Component Organization**:
   - One component per file (except for small helper components)
   - Group related components in folders
   - Use index files for exporting multiple components

## State Management

### TanStack Query for Server State

CouncilInsight uses TanStack Query (React Query) for server state management.

1. **Queries**:
   - Define query keys using descriptive arrays: `['meetings', id]`
   - Set appropriate caching and stale time settings
   - Handle loading and error states consistently

   ```tsx
   const { data, isLoading, error } = useQuery({
     queryKey: ['meetings', id],
     queryFn: () => fetch(`/api/meetings/${id}`).then(res => res.json())
   });
   ```

2. **Mutations**:
   - Use mutations for data changes
   - Invalidate relevant queries after mutation
   - Implement optimistic updates for better UX

   ```tsx
   const queryClient = useQueryClient();
   
   const mutation = useMutation({
     mutationFn: (newMeeting) => {
       return fetch('/api/meetings', {
         method: 'POST',
         body: JSON.stringify(newMeeting)
       }).then(res => res.json());
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['meetings'] });
     }
   });
   ```

### Local State Management

For UI state, use React's built-in hooks:

1. **useState**: For simple component state
2. **useReducer**: For complex state logic
3. **useContext**: For shared state across components

Avoid using global state management libraries unless necessary.

## Data Flow

### Frontend to Backend Flow

1. User interacts with the UI
2. TanStack Query creates API request
3. Express route handler processes request
4. Storage layer accesses or modifies data
5. Response is sent back to frontend
6. TanStack Query updates cache and triggers re-render

### Data Ingestion Flow

1. Maxun robot scrapes data from source
2. Robot processes and structures the data
3. Data is sent to the database
4. Web application reads the updated data through API calls

## Testing Strategy

### Frontend Testing

1. **Component Tests**:
   - Test individual components in isolation
   - Use React Testing Library for component tests
   - Focus on user interactions and accessibility

2. **Integration Tests**:
   - Test interactions between multiple components
   - Mock API responses using MSW
   - Verify correct state updates and UI changes

### Backend Testing

1. **Unit Tests**:
   - Test individual functions and utilities
   - Mock dependencies for isolation
   - Focus on edge cases and error handling

2. **API Tests**:
   - Test API endpoints with supertest
   - Verify correct responses and status codes
   - Test authentication and authorization

### Database Testing

1. **Schema Tests**:
   - Verify database schema migrations
   - Test data integrity constraints
   - Use test database for isolation

## Common Development Tasks

### Adding a New Feature

1. **Define Requirements**:
   - Understand what the feature needs to accomplish
   - Identify affected components and data models

2. **Backend Changes**:
   - Update database schema if needed
   - Add new API endpoints
   - Implement storage layer methods

3. **Frontend Changes**:
   - Create UI components
   - Implement data fetching with TanStack Query
   - Add navigation and routing

4. **Testing**:
   - Write tests for new functionality
   - Verify integration with existing features

### Adding a New Page

1. Create a new file in `client/src/pages/`
2. Define the page component with appropriate hooks and data fetching
3. Add the route in `client/src/App.tsx`
4. Add navigation link in the sidebar or header

Example:
```tsx
// client/src/pages/new-page.tsx
import { useQuery } from '@tanstack/react-query';

export default function NewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['new-data'],
    queryFn: () => fetch('/api/new-endpoint').then(res => res.json())
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>New Page</h1>
      {/* Page content */}
    </div>
  );
}

// In App.tsx
<Route path="/new-page" component={NewPage} />
```

### Adding a New API Endpoint

1. Define the endpoint in `server/routes.ts`
2. Implement the required storage methods in `server/storage.ts`
3. Update database schema if needed in `shared/schema.ts`
4. Add the corresponding frontend query or mutation

Example:
```ts
// In routes.ts
app.get('/api/new-endpoint', async (req, res) => {
  try {
    const data = await storage.getNewData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// In storage.ts
async getNewData(): Promise<NewData[]> {
  // Implementation
}
```

### Adding a New Data Model

1. Define the table schema in `shared/schema.ts`
2. Create the insert schema using Drizzle Zod
3. Define TypeScript types for the model
4. Add relations to other tables if needed
5. Implement storage methods for CRUD operations
6. Create API endpoints for the new model

Example:
```ts
// In schema.ts
export const newModel = pgTable('new_model', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const insertNewModelSchema = createInsertSchema(newModel).omit({
  id: true
});

export type InsertNewModel = z.infer<typeof insertNewModelSchema>;
export type NewModel = typeof newModel.$inferSelect;

// Define relations
export const newModelRelations = relations(newModel, ({ one }) => ({
  relatedModel: one(anotherModel, {
    fields: [newModel.relatedId],
    references: [anotherModel.id]
  })
}));
```

## Performance Considerations

### Frontend Performance

1. **Memoization**:
   - Use `React.memo` for expensive components
   - Use `useMemo` for expensive calculations
   - Use `useCallback` for functions passed as props

2. **Query Optimization**:
   - Set appropriate caching settings for TanStack Query
   - Use query prefetching for anticipated data needs
   - Implement pagination for large data sets

3. **Component Design**:
   - Avoid unnecessary re-renders
   - Use virtualization for long lists
   - Lazy load components and routes

### Backend Performance

1. **Database Queries**:
   - Use proper indexes for frequently queried fields
   - Optimize complex queries
   - Use pagination for large result sets

2. **API Design**:
   - Return only needed data
   - Implement caching where appropriate
   - Use compression for response payloads

3. **Authentication**:
   - Use efficient token validation
   - Cache user permissions where possible

---

## Advanced Topics

### Working with Maxun Robots

Maxun robots are defined in JavaScript files that specify how to scrape and process data from websites.

To create a new robot:

1. Create a new file in `maxun/robots/`
2. Define the robot configuration and scraping logic
3. Test the robot locally
4. Deploy the robot with the Maxun service

Example robot structure:
```js
module.exports = {
  name: "Council Meeting Scraper",
  description: "Scrapes council meeting information from the municipality website",
  version: "1.0.0",
  url: "https://example.municipality.gov/meetings",
  
  async run(page, context) {
    // Navigation and scraping logic using Puppeteer
    await page.goto(this.url);
    
    // Extract data
    const meetings = await page.evaluate(() => {
      // DOM manipulation and data extraction
    });
    
    // Process and return data
    return meetings.map(meeting => ({
      title: meeting.title,
      date: new Date(meeting.date),
      // Other fields
    }));
  }
};
```

### Database Migration Strategy

CouncilInsight uses Drizzle ORM's push mechanism for database migrations:

1. Update schema definitions in `shared/schema.ts`
2. Run `npm run db:push` to apply changes to the database
3. Verify migration completed successfully

For production:
- Use `drizzle-kit generate` to create migration files
- Review migration SQL before applying
- Apply migrations during scheduled maintenance windows

### Error Handling Strategy

1. **Frontend Error Handling**:
   - Use error boundaries for React component errors
   - Handle API errors in TanStack Query with `onError` callbacks
   - Display user-friendly error messages

2. **Backend Error Handling**:
   - Use try/catch blocks in async route handlers
   - Log detailed errors for debugging
   - Return appropriate HTTP status codes and error messages

3. **Global Error Tracking**:
   - Implement error tracking service (e.g., Sentry)
   - Add context to errors for easier debugging
   - Set up alerts for critical errors

---

For additional questions or guidance, refer to the codebase and comments, or contact the project maintainers.
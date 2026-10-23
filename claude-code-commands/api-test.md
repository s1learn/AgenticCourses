# API Testing Command

Create comprehensive API tests for: $ARGUMENTS

## Testing Strategy
Test the following API endpoints and scenarios based on $ARGUMENTS:

1. **Happy Path Testing**:
   - Valid request formats
   - Expected response structures
   - Proper HTTP status codes

2. **Error Handling Testing**:
   - Invalid request payloads
   - Authentication failures
   - Authorization edge cases
   - Rate limiting scenarios

3. **Edge Cases**:
   - Boundary value testing
   - Large payload handling
   - Concurrent request handling
   - Network timeout scenarios

## Test Structure Template
Create tests in `/tests/api/{endpoint-name}.test.ts`:

```typescript
describe('{Endpoint Name} API', () => {
  describe('POST /{endpoint}', () => {
    it('should create {resource} with valid data', async () => {
      // Test implementation
    });

    it('should return 400 for invalid data', async () => {
      // Test implementation
    });

    it('should require authentication', async () => {
      // Test implementation
    });
  });

  describe('GET /{endpoint}', () => {
    it('should return {resource} list with valid auth', async () => {
      // Test implementation
    });

    it('should return 401 without authentication', async () => {
      // Test implementation
    });

    it('should handle pagination correctly', async () => {
      // Test implementation
    });
  });

  describe('PUT /{endpoint}/:id', () => {
    it('should update {resource} with valid data', async () => {
      // Test implementation
    });

    it('should return 404 for non-existent resource', async () => {
      // Test implementation
    });
  });

  describe('DELETE /{endpoint}/:id', () => {
    it('should delete {resource} successfully', async () => {
      // Test implementation
    });

    it('should return 403 for unauthorized deletion', async () => {
      // Test implementation
    });
  });
});
```

## Output Requirements
- Create test file at `/tests/api/{endpoint-name}.test.ts`
- Include a test coverage summary comment at the top of the file
- Document any mocking strategy used for external dependencies
- Ensure all tests are independently runnable (no shared mutable state)

## Completion Checklist
- [ ] All HTTP methods covered (GET, POST, PUT, DELETE)
- [ ] Authentication and authorization scenarios tested
- [ ] Input validation edge cases included
- [ ] Error responses validated (status code + response body)
- [ ] Tests are isolated and do not depend on execution order
- [ ] Mocks and fixtures documented

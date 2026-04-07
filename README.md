# open-ai-codex-platform-test

A Node.js project with comprehensive testing infrastructure.

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm

### Installation

```bash
npm install
```

## Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

## Project Structure

```
├── src/
│   ├── index.js              # Main entry point
│   ├── utils/
│   │   └── validators.js     # Input validation utilities
│   └── services/
│       ├── calculator.js     # Calculator service
│       └── dataProcessor.js  # Data processing service
├── tests/
│   ├── unit/
│   │   ├── utils/           # Unit tests for utilities
│   │   └── services/        # Unit tests for services
│   └── integration/         # Integration tests
├── .github/
│   └── workflows/
│       └── test.yml         # CI/CD pipeline
└── jest.config.js           # Jest configuration
```

## Coverage Thresholds

This project enforces minimum 80% coverage for:
- Branches
- Functions
- Lines
- Statements

See [TEST_COVERAGE_ANALYSIS.md](./TEST_COVERAGE_ANALYSIS.md) for detailed coverage recommendations.

## License

MIT

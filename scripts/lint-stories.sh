#!/bin/bash

# Script to lint Storybook stories and fix common issues
# Usage: ./scripts/lint-stories.sh

echo "🔍 Linting Storybook stories..."

# Check for incorrect imports
echo "Checking for @storybook/react imports (should be @storybook/nextjs)..."
REACT_IMPORTS=$(find components -name "*.stories.tsx" -exec grep -l "@storybook/react" {} \;)
if [ -n "$REACT_IMPORTS" ]; then
    echo "❌ Found @storybook/react imports in:"
    echo "$REACT_IMPORTS"
    echo "Run the following to fix:"
    echo "find components -name '*.stories.tsx' -exec sed -i '' 's/@storybook\/react/@storybook\/nextjs/g' {} +"
    exit 1
fi

echo "✅ All Storybook stories look good!"

# Run ESLint on story files using Next.js lint
echo "Running ESLint on story files..."
npm run lint

echo "✅ Storybook linting complete!"
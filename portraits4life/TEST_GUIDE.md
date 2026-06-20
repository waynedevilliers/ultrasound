# Test Guide - Portraits 4 Life

Comprehensive test suite covering functionality, mobile responsiveness, language switching, and form validation.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Test Files

### 1. **Header.test.tsx**
Tests for navigation, language switching, and responsive header.

**Coverage:**
- ✅ Logo and navigation rendering
- ✅ English/German language switching
- ✅ Language toggle button functionality
- ✅ Navigation links with correct locale routes
- ✅ Mobile responsiveness

**Key Tests:**
- Renders logo on desktop and mobile
- Displays correct language labels (EN/DE)
- Switches language when button clicked
- Links navigate to correct locale pages (/en/order, /de/order)

---

### 2. **Gallery.test.tsx**
Tests for gallery images, click-to-enlarge functionality, and responsiveness.

**Coverage:**
- ✅ Gallery rendering in English/German
- ✅ Image loading and display
- ✅ Click-to-enlarge modal functionality
- ✅ Mobile responsiveness and grid layout
- ✅ Hover effects and accessibility

**Key Tests:**
- Renders both gallery images correctly
- Opens fullscreen modal on image click
- Closes modal with X button or outside click
- Grid layout responsive on mobile/tablet/desktop
- Images have proper alt text for accessibility

---

### 3. **OrderForm.test.tsx**
Comprehensive tests for order form functionality, validation, and language support.

**Coverage:**
- ✅ Form field rendering (English/German)
- ✅ Input validation and required fields
- ✅ Email format validation
- ✅ Conditional field display (canvas size based on product)
- ✅ File upload handling
- ✅ Form submission and success message
- ✅ Mobile responsiveness
- ✅ Accessibility (labels, structure)

**Key Tests:**
- All required fields have validation
- Email field accepts valid email format
- Product dropdown triggers canvas size field
- File uploads work with 15MB limit
- Form shows success message on submission
- Inputs are full-width on mobile
- All inputs have associated labels

---

### 4. **Integration.test.tsx**
Full-page section integration tests covering all major components.

**Coverage:**
- ✅ Hero section (English/German)
- ✅ How It Works (3-step process)
- ✅ Pricing tiers with correct amounts
- ✅ FAQ section with expand/collapse
- ✅ Language consistency across sections
- ✅ Mobile layout responsiveness
- ✅ Accessibility and semantic HTML

**Key Tests:**
- Hero displays correct bilingual content
- Pricing shows: €30-50 digital, €69/89/119 canvas
- All FAQ questions appear in English/German
- Switching language updates all sections
- Sections have proper heading hierarchy
- Uses semantic HTML (section, main, etc.)

---

### 5. **Responsiveness.test.tsx**
Mobile-first responsive design tests covering all breakpoints.

**Coverage:**
- ✅ Mobile (375px), Tablet (768px), Desktop (1024px+)
- ✅ Responsive padding, margin, and spacing
- ✅ Grid column breakpoints
- ✅ Typography scaling
- ✅ Image responsiveness
- ✅ Form field stacking
- ✅ Navigation responsiveness
- ✅ Touch targets (48px minimum)

**Key Tests:**
- Renders correctly at 320px, 375px, 480px, 768px, 1024px, 1920px
- Padding scales: px-4 → sm:px-6 → lg:px-8
- Grid: grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3
- Typography: text-2xl → md:text-4xl → lg:text-5xl
- Buttons/links have at least 48px height for mobile touch
- Images use w-full and h-auto for responsiveness

---

## Test Statistics

| Component | Tests | Coverage |
|-----------|-------|----------|
| Header | 8 | Language, Navigation, Responsiveness |
| Gallery | 9 | Rendering, Modal, Responsiveness, Accessibility |
| OrderForm | 15 | Validation, Input Handling, File Upload, Submission |
| Integration | 13 | All sections, Language consistency, Accessibility |
| Responsiveness | 20 | Mobile-first, Breakpoints, Touch targets |
| **Total** | **65+** | **Comprehensive** |

---

## Coverage Areas

### Functionality Tests ✅
- Component rendering
- User interactions (clicks, form submission)
- Conditional rendering based on props/state
- Modal open/close
- Form validation
- Language switching

### Mobile Responsiveness Tests ✅
- Viewport sizes: 320px → 1920px
- Grid layouts
- Typography scaling
- Touch targets (minimum 48x48px)
- Navigation menus
- Form input stacking

### Language Tests ✅
- English (EN) content display
- German (DE) content display
- Language switching functionality
- Locale-specific routing (/en, /de)
- Consistency across sections

### Form Tests ✅
- Required field validation
- Email format validation
- File upload handling
- Conditional field display
- Form submission
- Success/error messages

### Accessibility Tests ✅
- Heading hierarchy (h1, h2, h3)
- Label associations with inputs
- Alt text for images
- Semantic HTML structure
- Keyboard navigation support
- ARIA attributes

---

## Running Specific Tests

```bash
# Run only Header tests
npm test Header.test.tsx

# Run only Gallery tests
npm test Gallery.test.tsx

# Run only OrderForm tests
npm test OrderForm.test.tsx

# Run only integration tests
npm test Integration.test.tsx

# Run only responsiveness tests
npm test Responsiveness.test.tsx

# Watch mode for specific file
npm test -- --watch OrderForm.test.tsx
```

---

## Test Output Example

```
PASS __tests__/Header.test.tsx (1.234s)
  Header Component
    Rendering
      ✓ should render logo (45ms)
      ✓ should render navigation links (32ms)
    Language Switching - English Page
      ✓ should display English navigation on /en route (28ms)
      ✓ should show DE button on English page (25ms)
      ✓ should switch to German when DE button clicked (38ms)
    ...

PASS __tests__/Gallery.test.tsx (2.456s)
  Gallery Component
    Rendering - English
      ✓ should render gallery section with English title (52ms)
      ✓ should render both gallery images (48ms)
    Image Click Functionality
      ✓ should open modal when image is clicked (61ms)
      ✓ should close modal when X button is clicked (55ms)
    ...

Tests: 65 passed, 65 total
Snapshots: 0 total
Time: 8.234s
```

---

## Known Issues & Fixes

### Issue: Navigation mocking in jsdom
**Solution:** Tests use jest.mock for next/navigation to avoid navigation errors

### Issue: Image component mocking
**Solution:** Next.js Image component mocked to render as HTML img tags in tests

### Issue: Window.location testing
**Solution:** Mock window.location.href for language switching tests

---

## Future Enhancements

- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility audit (axe-core)
- [ ] Screenshot testing
- [ ] API mocking for backend integration

---

## Best Practices Applied

✅ **Mobile-First Testing**: Tests cover mobile viewports first  
✅ **Bilingual Coverage**: All major tests include EN/DE variants  
✅ **Accessibility**: Tests verify semantic HTML and keyboard support  
✅ **Real User Scenarios**: Tests simulate actual user interactions  
✅ **Responsive Design**: Tests verify layouts at multiple breakpoints  
✅ **Comprehensive Coverage**: 65+ tests across all major features

---

**Last Updated:** 2026-06-20

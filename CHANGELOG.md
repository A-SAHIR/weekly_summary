# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-10-21

#### Features
- **Drag and Drop File Upload**: Enhanced file upload experience
  - Drag and drop Excel files directly into the upload zone
  - Visual feedback with border color and animation when dragging
  - File type validation on drop
  - Supports both click-to-select and drag-and-drop methods
  - Bounce animation on upload icon during drag
  - Dynamic text that changes during drag operation

- **Person Name from Excel Sheet**: The name of the Excel sheet is now used as the person's name
  - Displayed in dashboard header: "Résumé Hebdomadaire - [Person Name]"
  - Automatically extracted from the first sheet of uploaded Excel file

- **Complexity Counter Display**: Improved complexity visualization in table
  - Changed from multiple duplicate badges to counter format
  - Now displays as "2 Trivial", "3 Facile", etc.
  - Cleaner, more readable presentation
  - Automatic counting of each complexity level

- **"Moyen" Complexity Level Support**: Added medium complexity level
  - Parser updated to recognize "Moyen" keyword
  - Color scheme: "default" variant (blue badge)
  - Template Excel updated with "Moyen" examples
  - Supported format: "2 Moyen" in Excel cells

- **"Sur" Deadline State Support**: Added "on-time" deadline state
  - Parser updated to recognize "Sur" keyword
  - Color scheme: "secondary" variant
  - Works alongside "Avant" and "Après"
  - Template Excel updated with "Sur" examples
  - Supported format: "1 Sur" in Excel cells

- **Full Category Names on Chart**: Display complete category names on X-axis
  - Shows full category name instead of truncated first word
  - Better readability with -45° angle
  - Adjusted font size and height for optimal display

#### Improvements
- **X-Axis Labels on Chart**: Fixed category labels visibility
  - Labels now displayed with -45° angle for better readability
  - Full category names visible on "Tickets & Story Points" chart
  - Increased height to 80px to accommodate angled labels
  - Interval set to 0 to show all labels
  - Font size optimized to 10px for better fit

- **CSS Color System**: Replaced oklch() colors with standard hex values
  - Fixed compatibility issues with various export and screenshot tools
  - All oklch() color functions replaced with hex equivalents in globals.css and index.css
  - Improved browser compatibility and rendering consistency

#### Technical
- **WeeklyData Interface**: New data structure to encapsulate person name with ticket data
  - `WeeklyData { personName: string, tickets: TicketDataEntry[] }`
  - Better data organization and type safety
  - Facilitates person-specific features

- **Color System Update**: Migrated from oklch() to hex colors
  - Updated all CSS variables in src/styles/globals.css
  - Updated all CSS variables in src/index.css
  - Improved compatibility with standard CSS tooling
  - No visual changes, only technical implementation

- **Dependencies**:
  - `@types/react@latest` - TypeScript support for React
  - `@types/react-dom@latest` - TypeScript support for React DOM
  - Removed: `html2canvas`, `dom-to-image-more`, `@types/dom-to-image` (export feature removed)

### Changed - 2025-10-21

#### Files Modified
- `src/components/Dashboard.tsx`
  - Updated to use WeeklyData interface
  - Added person name display in header
  - Fixed X-axis labels with angle and interval properties
  - Updated complexity display to show counts instead of duplicates
  - Added support for "Moyen" complexity color
  - Added support for "Sur" deadline state color
  - Changed chart data to use full category names instead of first word only
  - Adjusted X-axis height to 80px and font size to 10px
  - Maintained original simple, clean design

- `src/components/DataEntryForm.tsx`
  - Created WeeklyData interface
  - Updated parseComplexityString to support "Moyen"
  - Updated parseDeadlineString to support "Sur"
  - Sheet name extraction and storage
  - Updated template with "Moyen" and "Sur" examples
  - Props changed to accept/return WeeklyData
  - Added drag and drop file upload functionality

- `src/App.tsx`
  - Updated to handle WeeklyData instead of TicketDataEntry[]
  - State management updated for new data structure

- `src/styles/globals.css`
  - Replaced all oklch() color functions with hex equivalents
  - Maintained visual consistency while improving compatibility

- `src/index.css`
  - Replaced all oklch() color functions with hex equivalents
  - Updated color variables for both light and dark themes

- `package.json`
  - Added @types/react and @types/react-dom dev dependencies
  - Removed html2canvas, dom-to-image-more, and @types/dom-to-image

#### Template Updates
- Excel template now includes examples with:
  - "Moyen" complexity level
  - "Sur" deadline state
  - Updated sample data for better demonstration

## [1.0.0] - Initial Release

### Features
- Excel file upload for weekly ticket data
- Dashboard visualization with charts and tables
- Support for complexity levels: Trivial, Facile, Difficile
- Support for deadline states: Avant, Après
- Story Points tracking
- Blockages counting
- Category-based ticket organization
- Pie chart for complexity distribution
- Bar chart for tickets and story points comparison
- Detailed data table view
- Excel template download
- Dark/Light theme support

---

## Notes for Developers

### Complexity Levels
Current supported levels (in order):
1. Trivial (outline variant)
2. Facile (secondary variant)
3. Moyen (default variant) - Added 2025-10-21
4. Difficile (destructive variant)

### Deadline States
Current supported states:
1. Avant (default variant)
2. Sur (secondary variant) - Added 2025-10-21
3. Après (outline variant)

### Excel Format
Required columns:
- Catégorie
- Compteur des Tickets
- Compteur de blockages
- Story Points
- Complexité (format: "2 Trivial 3 Facile 1 Moyen 1 Difficile")
- Deadline state (format: "2 Avant 1 Sur 2 Après")

**Important**: The name of the Excel sheet will be used as the person's name in the dashboard.

# Search Functionality Documentation

## Overview

The Explore page now includes a comprehensive search feature that allows users to quickly find creators by various criteria including name, bio, location, services, tags, and genres.

## Features

### 🔍 **Global Search Bar**
- **Location**: Top of the Explore page, prominently displayed
- **Functionality**: Real-time search with 300ms debounce
- **Placeholder**: "Search creators by name, tags, bio, or services..."

### 🎯 **Search Capabilities**
The search covers the following fields:
- **Creator Name** (displayName/name) - *Highest priority*
- **Bio/Description** - *Medium priority*
- **Location** - *Medium priority*
- **Genres** - *Medium priority*
- **Tags** - *Medium priority*
- **Service Titles** - *Lower priority*
- **Service Descriptions** - *Lower priority*
- **Service Categories** - *Lower priority*

### 📊 **Smart Scoring System**
- Exact word matches score higher than partial matches
- Creator names get 10x multiplier
- Bio and location get 5x and 3x multipliers respectively
- Services and tags get 2-4x multipliers
- Results are sorted by score, then rating, then review count

### 💾 **Recent Searches**
- Last 5 searches are automatically saved to localStorage
- Dropdown appears when focusing the search input
- Quick access to previous searches
- Clear all option available

### 🔄 **Real-time Updates**
- Search results update as you type (after 300ms delay)
- URL is updated with search query for bookmarking/sharing
- Loading states and skeleton screens during search
- Graceful error handling

## Usage Examples

### Example Search Queries
- `"trap"` - Find creators specializing in trap music
- `"Tokyo"` - Find creators based in Tokyo
- `"mixing mastering"` - Find creators offering mixing/mastering services
- `"hip-hop producer"` - Find hip-hop producers
- `"Sarah"` - Find creators named Sarah

### Search Tips (shown in dropdown)
- Search by creator name, tags, or bio
- Try service types like "mixing", "mastering"
- Use genre names like "hip-hop", "electronic"
- Search locations like "Tokyo", "New York"

## Technical Implementation

### Components
- `components/explore/SearchBar.tsx` - Main search input component
- Updated `src/app/explore/page.tsx` - Integration with explore page

### Utilities
- `lib/utils/filterByKeyword.ts` - Keyword filtering and scoring logic
- `lib/firestore/searchCreators.ts` - Firestore integration and data fetching

### Key Features
- **Debounced input** (300ms) to prevent excessive API calls
- **Client-side filtering** for responsive search experience
- **Firestore integration** for fetching creator and service data
- **TypeScript support** with proper interfaces
- **Error handling** with fallback states
- **Responsive design** with Tailwind CSS

## Performance Considerations

- Search is debounced to reduce API calls
- Results are limited to 50 creators maximum
- Client-side filtering after Firestore fetch for better performance
- Skeleton loading states for smooth UX
- Recent searches stored locally to reduce repeated queries

## Future Enhancements

### Possible Improvements
1. **Highlighting**: Add highlighted text for matched terms in results
2. **Auto-suggestions**: Real-time suggestions as user types
3. **Advanced filters**: Combine search with existing filter panel
4. **Search analytics**: Track popular search terms
5. **Fuzzy matching**: Handle typos and similar terms
6. **Voice search**: Speech-to-text input capability

### Firestore Optimization
Consider adding a `keywords` array field to creator documents containing:
- Lowercase versions of name, bio, location, genres, tags
- This would enable more efficient Firestore queries using `array-contains`

## Testing

### Manual Testing Scenarios
1. **Empty search** - Should show all creators
2. **Single keyword** - Should return relevant creators
3. **Multiple keywords** - Should combine scoring
4. **Location search** - Should find creators by location
5. **Service search** - Should find creators by service offerings
6. **Genre search** - Should find creators by music genre
7. **Recent searches** - Should save and recall previous searches
8. **Clear search** - Should reset to default explore view

### Validation Checklist
- ✅ Search debounces properly (300ms delay)
- ✅ Results update in real-time
- ✅ URL updates with search query
- ✅ Loading states display correctly
- ✅ Error handling works gracefully
- ✅ Recent searches are saved/loaded
- ✅ Clear search functionality works
- ✅ Search covers all specified fields
- ✅ Scoring system prioritizes correctly
- ✅ Mobile responsive design

// Test setup file to add missing toArray method to Map iterators

// Monkey-patch the Map constructor to return a Map with enhanced entries method
const OriginalMap = Map;

class EnhancedMap extends OriginalMap {
  entries() {
    const originalEntries = super.entries();
    const array = Array.from(originalEntries);
    return {
      [Symbol.iterator]: () => array[Symbol.iterator](),
      toArray: () => array,
      next: () => {
        // Just delegate to the array iterator for compatibility
        return this[Symbol.iterator]().next();
      }
    };
  }
}

// Replace the global Map with our enhanced version for tests
global.Map = EnhancedMap;
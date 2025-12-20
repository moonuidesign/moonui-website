// server-action/getAssetsItems.test.ts

/**
 * MOCK LOGIC for getAssetsItems Category Filtering
 * This test verifies the logic we intend to implement.
 */

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

// Mock Categories
const allCategories: Category[] = [
  { id: 'cat_warm', name: 'Warm', parentId: null },
  { id: 'cat_cool', name: 'Cool', parentId: null },
  { id: 'cat_conic', name: 'Conic', parentId: 'cat_warm' },
  { id: 'cat_radial', name: 'Radial', parentId: 'cat_warm' },
  { id: 'cat_blue', name: 'Blue', parentId: 'cat_cool' },
  { id: 'cat_orphan', name: 'Orphan', parentId: null },
];

function resolveCategoryIds(
  allCats: Category[],
  categorySlugs: string[],
  subCategorySlugs: string[]
): string[] {
  // 1. Resolve IDs for selected Main Categories
  const parentCats = allCats.filter(c => categorySlugs.includes(c.name));
  const parentIds = parentCats.map(c => c.id);

  // 2. Resolve IDs for selected Sub Categories
  const subCats = allCats.filter(c => subCategorySlugs.includes(c.name));
  const subIds = subCats.map(c => c.id);

  // 3. Logic:
  // If a subcategory is selected, we include it.
  // If a main category is selected:
  //    Check if ANY of its children are in the subIds list.
  //    If YES -> The user is drilling down. Include ONLY the selected children (subIds that belong to this parent).
  //    If NO  -> The user wants the whole folder. Include Parent + All its Children.

  const finalIds = new Set<string>();

  // Add explicitly selected subcategories (orphans or otherwise)
  subIds.forEach(id => finalIds.add(id));

  // Process selected parents
  parentIds.forEach(pId => {
    // Find children of this parent
    const children = allCats.filter(c => c.parentId === pId);
    const childrenIds = children.map(c => c.id);

    // Check if any child is already selected (Drill-down active for this branch)
    const hasSelectedChild = childrenIds.some(childId => subIds.includes(childId));

    if (hasSelectedChild) {
      // Drill-down mode: The parent is just a container context.
      // We do NOT add the parent ID or other children.
      // We relying on `subIds` (added above) to cover the selection.
      // (Optionally: Add the parent ID itself if items can belong to Parent directly?)
      // Let's assume items usually belong to sub-categories if they exist, or parent if generic.
      // If "Warm" has items directly, and we select "Conic", do we want Warm items?
      // Usually No. "Men's Wear > Shoes". I don't want "Generic Men's Wear" if I selected "Shoes".
    } else {
      // Broad mode: Include Parent and ALL children
      finalIds.add(pId);
      childrenIds.forEach(cid => finalIds.add(cid));
    }
  });

  return Array.from(finalIds);
}

// --- TESTS ---

function runTest(name: string, catSlugs: string[], subSlugs: string[], expectedIds: string[]) {
  const result = resolveCategoryIds(allCategories, catSlugs, subSlugs).sort();
  const expected = expectedIds.sort();
  
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${name}`);
  if (!pass) {
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Got:      ${JSON.stringify(result)}`);
  }
}

console.log('--- Running Category Logic Tests ---');

// Case 1: Select "Warm" only
runTest(
  'Select Parent Only (Warm)',
  ['Warm'], 
  [], 
  ['cat_warm', 'cat_conic', 'cat_radial']
);

// Case 2: Select "Conic" only (Sub only)
runTest(
  'Select Sub Only (Conic)',
  [], 
  ['Conic'], 
  ['cat_conic']
);

// Case 3: Select "Warm" AND "Conic" (Drill down)
runTest(
  'Drill Down (Warm + Conic)',
  ['Warm'], 
  ['Conic'], 
  ['cat_conic'] // Should NOT include cat_radial or cat_warm
);

// Case 4: Select "Warm" AND "Cool" (Multi Parent)
runTest(
  'Multi Parent (Warm + Cool)',
  ['Warm', 'Cool'], 
  [], 
  ['cat_warm', 'cat_conic', 'cat_radial', 'cat_cool', 'cat_blue']
);

// Case 5: Select "Warm", "Cool" AND "Conic" (Mixed Drill)
// Warm -> Drill down to Conic
// Cool -> Broad
runTest(
  'Mixed Drill (Warm + Cool + Conic)',
  ['Warm', 'Cool'], 
  ['Conic'], 
  ['cat_conic', 'cat_cool', 'cat_blue']
);

console.log('--- End Tests ---');

const FacetFilter = require('./FacetFilter');
const setup = require('./testData.json');
const data = setup.data;
const schema = setup.schema;

describe('FacetFilter constructor', () => {
  it('should load schema and data', () => {
    const facetFilter = new FacetFilter(schema, data);
    expect(facetFilter.data).toEqual(data);
    expect(facetFilter.schema).toEqual(schema);
  });
});

describe('FacetFilter applyTextFilter', () => {
  it('should filter correctly by a single string', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTextFilter('letter', 'A');
    expect(facetFilter.data.length).toEqual(2);
    expect(facetFilter.data[0].label).toEqual('A3');
    expect(facetFilter.data[1].label).toEqual('A6');
  });
  it('should filter correctly by an array of strings', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTextFilter('color', ['blue', 'red']);
    expect(facetFilter.data.length).toEqual(2);
    expect(facetFilter.data[0].label).toEqual('A6');
    expect(facetFilter.data[1].label).toEqual('B13');
  });
  it('should filter correctly by two filters', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTextFilter('color', ['blue', 'red']);
    facetFilter.applyTextFilter('letter', 'A');
    expect(facetFilter.data.length).toEqual(1);
    expect(facetFilter.data[0].label).toEqual('A6');
  });
});

describe('FacetFilter applyRangeFilter', () => {
  it('should filter correctly by a min and max', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyNumberFilter('number', 3, 6);
    expect(facetFilter.data.length).toEqual(2);
    expect(facetFilter.data[0].label).toEqual('A3');
    expect(facetFilter.data[1].label).toEqual('A6');
  });

  it('should filter correctly by a min but no max', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyNumberFilter('number', 3, null);
    expect(facetFilter.data.length).toEqual(3);
    expect(facetFilter.data[0].label).toEqual('A3');
    expect(facetFilter.data[1].label).toEqual('A6');
    expect(facetFilter.data[2].label).toEqual('B13');
  });

  it('should filter correctly by a max but no min', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyNumberFilter('number', null, 6);
    expect(facetFilter.data.length).toEqual(3);
    expect(facetFilter.data[0].label).toEqual('A3');
    expect(facetFilter.data[1].label).toEqual('A6');
    expect(facetFilter.data[2].label).toEqual('C2');
  });
});

// describe('FacetFilter applyTagFilter', () => {
//   it('should filter correctly on a single tag', () => {});

//   it('should filter correctly on multiple tags', () => {});

//   it('should return array length zero when no matches', () => {});
// });

describe('getKnownValues', () => {
  it('should get all text values for a text field', () => {
    const facetFilter = new FacetFilter(schema, data);
    const knownValues = facetFilter.getKnownValues('letter', 'string');
    expect(knownValues).toEqual(['A', 'B', 'C']);
  });
  it('should get all number values for a number field', () => {
    const facetFilter = new FacetFilter(schema, data);
    const knownValues = facetFilter.getKnownValues('number', 'number');
    expect(knownValues).toEqual([2, 3, 6, 13]);
  });
  // it('should get all tag values for a tag field', () => {});
});

describe('getTextFacetLabels', () => {
  it('should get all text facets, omitting displayFacet:false', () => {
    const facetFilter = new FacetFilter(schema, data);
    const facets = facetFilter.getTextFacetNames();
    expect(facets).toEqual(['letter', 'type', 'color']);
  });
});

describe('getNumberFacetLabels', () => {
  it('should get all number facets', () => {
    const facetFilter = new FacetFilter(schema, data);
    const facets = facetFilter.getNumberFacetNames();
    expect(facets).toEqual(['number']);
  });
});

// describe('createTextFacet', () => {
//   it('should create an html element for a text facet, built on known values', () => {});
// });

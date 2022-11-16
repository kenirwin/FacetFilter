const FacetFilter = require('./FacetFilter');
const setup = require('./data/testData.json');
const data = setup.data;
const schema = setup.schema;

const scantSetup = require('./data/testDataMissingValues.json');
const scantData = scantSetup.data;
const scantSchema = scantSetup.schema;

const sliderSetup = require('./data/testDataSlider.json');
const sliderData = sliderSetup.data;
const sliderSchema = sliderSetup.schema;

describe('FacetFilter constructor', () => {
  it('should load schema and data', () => {
    const facetFilter = new FacetFilter(schema, data);
    expect(facetFilter.data).toEqual(data);
    expect(facetFilter.schema).toEqual(schema);
    expect(facetFilter.originalData).toEqual(data);
    expect(facetFilter.filters).toEqual({});
  });
});

// describe('FacetFilter handleMissingValuesForField', () => {
//   it('should return empty array for missing tags', () => {
//     const facetFilter = new FacetFilter(scantSchema, scantData);
//     facetFilter.handleMissingValuesForField('dataTags', 'tag');
//     expect(facetFilter.data[0]).toHaveProperty('dataTags', []);
//   });
//   it('should add a value of "No Data" for missing string values', () => {
//     const facetFilter = new FacetFilter(scantSchema, scantData);
//     facetFilter.handleMissingValuesForField('color', 'string');
//     expect(facetFilter.data[2]).toHaveProperty('color', 'No Data');
//   });
// });
describe('FacetFilter.setFormat', () => {
  it('should set a default format if no argument', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.setFormat();
    expect(facetFilter.format).toEqual(
      '<li class="object default"><div class="datum">label: <%= label %></div><div class="datum">letter: <%= letter %></div><div class="datum">dataTags: <%= dataTags %></div><div class="datum">tags: <%= tags %></div><div class="datum">number: <%= number %></div><div class="datum">color: <%= color %></div></li>'
    );
  });
  it('should set a format if argument', () => {
    const facetFilter = new FacetFilter(schema, data);
    const format =
      '<li class="object" id="<%= object.id %>"><%= object.id %></li>';
    facetFilter.setFormat(format);
    expect(facetFilter.format).toEqual(format);
  });
});

describe('FacetFilter.reset', () => {
  it('should reset data to originalData', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.data = [];
    facetFilter.reset();
    expect(facetFilter.data).toEqual(data);
  });
});

describe('FacetFilter.addSliderRange', () => {
  it('should add a slider filter to the sliderFilters object', () => {
    const facetFilter = new FacetFilter(sliderSchema, sliderData);
    facetFilter.addSliderRange('decade', '1920s', '1930s');
    expect(facetFilter.sliderRanges.decade).toEqual({
      min: '1920s',
      max: '1930s',
    });
  });
});

describe('FacetFilter.removeSliderRange', () => {
  it('should add a slider filter to the sliderFilters object', () => {
    const facetFilter = new FacetFilter(sliderSchema, sliderData);
    facetFilter.addSliderRange('decade', '1920s', '1930s');
    facetFilter.removeSliderRange('decade');
    expect(facetFilter.sliderRanges.decade).toEqual(undefined);
  });
});

describe('FacetFilter.addTagFilter', () => {
  it('should add a tag filter', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.addTagFilter('dataTags', 'a');
    expect(facetFilter.filters.dataTags).toEqual(['a']);
  });
});

describe('FacetFilter.removeTagFilter', () => {
  it('should add a tag filter', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.addTagFilter('dataTags', 'a');
    facetFilter.addTagFilter('dataTags', 'b');
    facetFilter.removeTagFilter('dataTags', 'a');
    expect(facetFilter.filters.dataTags).toEqual(['b']);
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
  it('should filter correctly filter out strings a different value is missing from data', () => {
    const facetFilter = new FacetFilter(scantSchema, scantData);
    facetFilter.applyTextFilter('letter', 'A');
    expect(facetFilter.data.length).toEqual(2);
    expect(facetFilter.data[0].label).toEqual('A3');
    expect(facetFilter.data[1].label).toEqual('A6');
  });
});

describe('getIncludedSliderValues', () => {
  it('should return an array of values that are within the slider range', () => {
    const facetFilter = new FacetFilter(sliderSchema, sliderData);
    const values = facetFilter.getIncludedSliderValues(
      'decade',
      '1920s',
      '1930s'
    );
    expect(values).toEqual(['1920s', '1930s']);
  });
  it('should return an array of one when slider range matches that', () => {
    const facetFilter = new FacetFilter(sliderSchema, sliderData);
    const values = facetFilter.getIncludedSliderValues(
      'decade',
      '1920s',
      '1920s'
    );
    expect(values).toEqual(['1920s']);
  });
});

// describe('FacetFilter applySliderFilter', () => {
//   it('should correctly filter based on slider min/max values', () => {
//     // const facetFilter = new FacetFilter(sliderSchema, sliderData);
//     // facetFilter.addSliderFilter('decade', '1920s', '1930s');
//     // facetFilter.applySliderFilter();
//     // expect(facetFilter.data.length).toEqual(2);
//     // expect(facetFilter.data[0].label).toEqual('A3');
//     // expect(facetFilter.data[1].label).toEqual('A6');
//   });
// });

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
    expect(facetFilter.data[2].label).toEqual('U2');
  });
});

describe('applyAllTagFilters', () => {
  it('should apply a tag filter for every saved filter', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.addTagFilter('dataTags', 'curvy');
    facetFilter.addTagFilter('dataTags', 'band-names');
    facetFilter.applyAllTagFilters();
    expect(facetFilter.data.length).toEqual(1);
    expect(facetFilter.data[0].label).toEqual('U2');
  });
});
describe('FacetFilter applyTagFilter', () => {
  it('should filter correctly on a single tag', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTagFilter('dataTags', 'vowels');
    expect(facetFilter.data[0].label).toEqual('A3');
    expect(facetFilter.data[1].label).toEqual('A6');
    expect(facetFilter.data[2].label).toEqual('U2');
  });

  it('should filter correctly on multiple tags', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTagFilter('dataTags', 'vowels');
    facetFilter.applyTagFilter('dataTags', 'band-names');
    expect(facetFilter.data[0].label).toEqual('U2');
  });

  it('should filter correctly on multiple tags as an array', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTagFilter('dataTags', ['vowels', 'band-names']);
    expect(facetFilter.data[0].label).toEqual('U2');
  });

  it('should return array length zero when no matches', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTagFilter('dataTags', 'bogus');
    expect(facetFilter.data.length).toEqual(0);
  });

  it('should work when some entries lack the tag field', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTagFilter('tags', 'literature');
    expect(facetFilter.data.length).toEqual(1);
    expect(facetFilter.data[0].label).toEqual('A6');
  });
  it('should work (return empty set) when all entries lack the tag field', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.applyTagFilter('bogusTagField', 'vowels');
    expect(facetFilter.data.length).toEqual(0);
  });
});

describe('getKnownValues', () => {
  it('should get all text values for a text field', () => {
    const facetFilter = new FacetFilter(schema, data);
    const knownValues = facetFilter.getKnownValues('letter', 'string');
    expect(knownValues).toEqual(['A', 'B', 'U']);
  });
  it('should get all text values for a text field', () => {
    const facetFilter = new FacetFilter(scantSchema, scantData);
    const knownValues = facetFilter.getKnownValues('letter', 'string');
    expect(knownValues).toEqual(['A', 'B', 'U', 'X', 'No Data']);
  });
  it('should get all number values for a number field', () => {
    const facetFilter = new FacetFilter(schema, data);
    const knownValues = facetFilter.getKnownValues('number', 'number');
    expect(knownValues).toEqual([2, 3, 6, 13]);
  });
  it('should get all number values for a number field but skip null values', () => {
    const facetFilter = new FacetFilter(scantSchema, scantData);
    const knownValues = facetFilter.getKnownValues('number', 'number');
    expect(knownValues.length).toEqual(5);
    expect(knownValues).toEqual([2, 3, 6, 9, 13]);
  });
  it('should get all tag values for a tag field', () => {
    const facetFilter = new FacetFilter(schema, data);
    const knownValues = facetFilter.getKnownValues('dataTags', 'tag');
    expect(knownValues).toEqual([
      'band-names',
      'consonants',
      'curvy',
      'pointy',
      'vowels',
    ]);
  });
});

describe('countAllTags', () => {
  it('should recount totals for all tag fields', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.countAllTags();
    expect(facetFilter.tagCounts.hasOwnProperty('dataTags')).toBeTruthy();
    expect(facetFilter.tagCounts.hasOwnProperty('tags')).toBeTruthy();
  });
});

describe('countTags', () => {
  it('should get the correct counts for a tag field', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.countTags('dataTags');
    expect(facetFilter.tagCounts['dataTags']).toEqual({
      'band-names': 1,
      consonants: 1,
      curvy: 2,
      pointy: 2,
      vowels: 3,
    });
  });
});

describe('getTextFacetNames', () => {
  it('should get all text facets, omitting filterable:false', () => {
    const facetFilter = new FacetFilter(schema, data);
    const facets = facetFilter.getTextFacetNames();
    expect(facets).toEqual(['color']);
  });
});

describe('getNumberFacetNames', () => {
  it('should get all number facets', () => {
    const facetFilter = new FacetFilter(schema, data);
    const facets = facetFilter.getNumberFacetNames();
    expect(facets).toEqual(['number']);
  });
});

describe('getTagFacetNames', () => {
  it('should get all tag facets', () => {
    const facetFilter = new FacetFilter(schema, data);
    const facets = facetFilter.getTagFacetNames();
    expect(facets).toEqual(['dataTags', 'tags']);
  });
});

describe('getFacetByFieldName', () => {
  it('should get a facet by field name', () => {
    const facetFilter = new FacetFilter(schema, data);
    const facet = facetFilter.getFacetByFieldName('letter');
    expect(facet).toEqual({
      fieldName: 'letter',
      fieldType: 'string',
      sortable: true,
      filterable: false,
    });
  });
});

describe('getSortableFields', () => {
  it('should get all sortable fields', () => {
    const facetFilter = new FacetFilter(schema, data);
    const sortableFields = facetFilter.getSortableFields();
    expect(sortableFields).toEqual(['label', 'letter', 'number', 'color']);
  });
});

describe('sortDataByFacet', () => {
  it('should sort data by a text facet', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.sortDataByFacet('color');
    expect(facetFilter.data[0].label).toEqual('A6');
    expect(facetFilter.data[1].label).toEqual('A3');
    expect(facetFilter.data[2].label).toEqual('B13');
    expect(facetFilter.data[3].label).toEqual('U2');
  });
  it('should sort data by a number facet', () => {
    const facetFilter = new FacetFilter(schema, data);
    facetFilter.sortDataByFacet('number');
    expect(facetFilter.data[0].label).toEqual('U2');
    expect(facetFilter.data[1].label).toEqual('A3');
    expect(facetFilter.data[2].label).toEqual('A6');
    expect(facetFilter.data[3].label).toEqual('B13');
  });
});

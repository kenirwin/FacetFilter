const FacetFilter = require('./FacetFilter.js');
const setup = require('./data.json');
const data = setup.data;
const schema = setup.schema;
const ff = new FacetFilter(schema, data);
let tags = ff.getTagFacetNames();
tags.forEach((tag) => {
  console.log('tag: ', tag);
  ff.countTags(tag);
});

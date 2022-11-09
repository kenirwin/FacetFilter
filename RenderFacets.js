$.getJSON('data.json', function (json) {
  var conf = json;
  var facetFilter = new FacetFilter(conf.schema, conf.data);
  if (typeof itemFormat !== 'undefined') {
    facetFilter.setFormat(itemFormat);
  } else {
    facetFilter.setFormat();
  }

  let textFacets = facetFilter.getTextFacetNames();
  let numberFacets = facetFilter.getNumberFacetNames();
  let tagFacets = facetFilter.getTagFacetNames();

  numberFacets.forEach(function (facet) {
    $('#facets').append(facetFilter.generateNumberFacet(facet));
  });

  tagFacets.forEach(function (facet) {
    $('#facets').append(facetFilter.generateTagFacet(facet));
  });

  textFacets.forEach(function (facet) {
    $('#facets').append(facetFilter.generateTextFacet(facet));
  });

  displayObjects(facetFilter.data, facetFilter.format);

  $('#facets input').on('change', function () {
    filterObjectsByFacets(facetFilter);
  });

  $('#facets .facet-tag').on('click', function () {
    $(this).toggleClass('active');
    facetFilter.addTagFilter($(this).data('facet'), $(this).data('value'));
    filterObjectsByFacets(facetFilter);
    // console.log('remaining data', facetFilter.data);
  });
});

function displayObjects(data, format) {
  $('#objects').empty();
  data.forEach(function (object) {
    $('#objects').append(ejs.render(format, object));
  });
}

function updateTagFacets(facetFilter) {
  let tagFacets = facetFilter.getTagFacetNames();
  tagFacets.forEach(function (facet) {
    html = facetFilter.generateTagFacet(facet);
    $('#facets [data-facet="' + facet + '"]').html(html);
  });
}

function filterObjectsByFacets(facetFilter) {
  let tagFacets = facetFilter.getTagFacetNames();

  let textFacets = [];
  $('.facet[data-type="text"]').each(function (el) {
    textFacets.push($(this).data('facet'));
  });
  let numberFacets = [];
  $('.facet[data-type="number"]').each(function (el) {
    numberFacets.push($(this).data('facet'));
  });
  facetFilter.reset();

  facetFilter.applyAllTagFilters();

  textFacets.forEach(function (field) {
    const values = [];
    $('#facets input[data-field="' + field + '"]:checked').each(function () {
      values.push($(this).val());
    });
    facetFilter.applyTextFilter(field, values);
  });

  numberFacets.forEach(function (field) {
    let min = $('#' + field + '-min').val();
    let max = $('#' + field + '-max').val();
    // console.log(field, min, max);
    facetFilter.applyNumberFilter(field, min, max);
    // console.log(facetFilter.data);
  });

  displayObjects(facetFilter.data, facetFilter.format);

  updateTagFacets(facetFilter);
}

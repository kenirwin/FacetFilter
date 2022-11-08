$.getJSON('data.json', function (json) {
  var conf = json;
  var facetFilter = new FacetFilter(conf.schema, conf.data);
  let textFacets = facetFilter.getTextFacetNames();
  let numberFacets = facetFilter.getNumberFacetNames();

  textFacets.forEach(function (facet) {
    $('#facets').append(facetFilter.generateTextFacet(facet));
  });

  numberFacets.forEach(function (facet) {
    $('#facets').append(facetFilter.generateNumberFacet(facet));
  });

  displayObjects(facetFilter.data);

  $('#facets input').on('change', function () {
    filterObjectsByFacets(facetFilter);
  });
});

function displayObjects(data) {
  $('#objects').empty();
  data.forEach(function (object) {
    $('#objects').append(
      '<li class="object ' + object.color + '">' + object.label + '</li>'
    );
  });
}

function filterObjectsByFacets(facetFilter) {
  let textFacets = [];
  $('.facet[data-type="text"]').each(function (el) {
    textFacets.push($(this).data('facet'));
  });
  let numberFacets = [];
  $('.facet[data-type="number"]').each(function (el) {
    numberFacets.push($(this).data('facet'));
  });
  facetFilter.reset();
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
    console.log(field, min, max);
    facetFilter.applyNumberFilter(field, min, max);
    console.log(facetFilter.data);
  });

  displayObjects(facetFilter.data);
}

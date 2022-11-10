$.getJSON(dataFile, function (json) {
  var conf = json;
  var facetFilter = new FacetFilter(conf.schema, conf.data);
  if (typeof itemFormat !== 'undefined') {
    facetFilter.setFormat(itemFormat);
  } else {
    facetFilter.setFormat();
  }

  facetFilter.countAllTags();

  createSorter(facetFilter);

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

  $('#facets').append(
    '<div class="btn btn-primary form-control" id="show-all">Show All</div>'
  );
  displayObjects(facetFilter.data, facetFilter.format);
  bindControls(facetFilter);
});

function bindControls(facetFilter) {
  $('#facets input').on('change', function () {
    filterObjectsByFacets(facetFilter);
  });

  $('#facets .facet-tag').on('click', function () {
    $(this).toggleClass('active');
    facetFilter.addTagFilter($(this).data('facet'), $(this).data('value'));
    filterObjectsByFacets(facetFilter);
    // console.log('remaining data', facetFilter.data);
  });
  $('#show-all').on('click', function () {
    location.reload();
  });
  $('#sorter').on('change', function () {
    console.log('sorter changed: ', $(this).val());
    facetFilter.sortDataByFacet($(this).val());
    console.log('sorted data', facetFilter.data);
    displayObjects(facetFilter.data, facetFilter.format);
  });
}

function createSorter(facetFilter) {
  let sorters = facetFilter.getSortableFields();
  $('#facets').append(
    '<label for="sorter" class="visually-hidden">Sort By</label><span class="input-group mb-3"><span class="input-group-text" id="basic-sort"><i class="bi bi-sort-down"></i></span><select id="sorter" class="form-control"><option>Sort by:</option></select></span>'
  );
  sorters.forEach(function (field) {
    $('#sorter').append('<option value="' + field + '">' + field + '</option>');
  });
}
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

  facetFilter.countAllTags();
  console.log(facetFilter.tagCounts);
  displayObjects(facetFilter.data, facetFilter.format);
  updateTagFacets(facetFilter);
  bindControls(facetFilter);
}

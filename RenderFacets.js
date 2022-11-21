function facets(facetConf) {
  let dataFile = facetConf.dataFile;
  let facetFilter;
  if (facetConf.hasOwnProperty('schema') && facetConf.hasOwnProperty('data')) {
    facetFilter = new FacetFilter(facetConf.schema, facetConf.data);
  } else if (facetConf.hasOwnProperty('dataFile')) {
    $.ajax({
      type: 'GET',
      url: dataFile,
      dataType: 'json',
      success: function (fileContents) {
        facetFilter = new FacetFilter(fileContents.schema, fileContents.data);
      },
      async: false,
    });
  } else {
    console.error('Error: no dataFile or schema/data provided');
  }

  facetFilter.facetDivId = facetConf.facetDivId;
  facetFilter.pageConf = facetConf.pageConf;
  console.log(facetFilter.facetDivId);
  facetFilter.contentDivId = facetConf.contentDivId;

  if (typeof facetConf.itemFormat != 'undefined') {
    facetFilter.setFormat(facetConf.itemFormat);
  } else {
    facetFilter.setFormat();
  }
  // console.log(facetFilter);
  console.log('facetFilter', facetFilter);
  createFacets(facetFilter);
}

function createFacets(facetFilter) {
  facetFilter.countAllTags();

  createSorter(facetFilter);

  let textFacets = facetFilter.getTextFacetNames();
  let numberFacets = facetFilter.getNumberFacetNames();
  let tagFacets = facetFilter.getTagFacetNames();
  let sliderFacets = facetFilter.getSliderFacetNames();

  sliderFacets.forEach(function (facet) {
    $(facetFilter.facetDivId).append(facetFilter.generateSliderFacet(facet));
  });

  numberFacets.forEach(function (facet) {
    $(facetFilter.facetDivId).append(facetFilter.generateNumberFacet(facet));
  });

  tagFacets.forEach(function (facet) {
    $(facetFilter.facetDivId).append(facetFilter.generateTagFacet(facet));
  });

  textFacets.forEach(function (facet) {
    $(facetFilter.facetDivId).append(facetFilter.generateTextFacet(facet));
  });

  $(facetFilter.facetDivId).append(
    '<div class="btn btn-primary form-control" id="show-all">Show All</div>'
  );
  displayObjects(facetFilter);
  bindControls(facetFilter);
}

function bindControls(facetFilter) {
  // on form input change
  // fires when a checkbox(string) is clicked or number is changed
  $(facetFilter.facetDivId + ' input')
    .off() // remove any existing event handlers
    .on('change', function () {
      filterObjectsByFacets(facetFilter);
      // console.log('filtering', facetFilter.data);
    });

  // on click a facet tag name (tag facet)
  $(facetFilter.facetDivId + ' .facet-tag').on('click', async function () {
    $(this).toggleClass('active');
    facetFilter.addTagFilter($(this).data('facet'), $(this).data('value'));
    await filterObjectsByFacets(facetFilter);
    // console.log('remaining data', facetFilter.data);
    refocusOnFacet($(this), facetFilter);
  });
  $('#show-all').on('click', function () {
    location.reload();
  });
  $('#sorter').on('change', function () {
    // console.log('sorter changed: ', $(this).val());
    facetFilter.sortDataByFacet($(this).val());
    // console.log('sorted data', facetFilter.data);
    displayObjects(facetFilter);
  });

  // on change a slider (slider facet)
  $(document)
    .off()
    .on('facetChange', function (event, { facet, facetId, values }) {
      // console.log('facetChange', facet, facetId, values);
      facetFilter.addSliderRange(facet, values[0], values[1]);
      facetFilter.reset();
      filterObjectsByFacets(facetFilter);
      facetFilter.applyAllSliderFilters();
      displayObjects(facetFilter);
      facetFilter.countAllTags();
      updateTagFacets(facetFilter);
      bindControls(facetFilter);
      // refocusOnFacet($('this')); // need to get this from the event
    });

  // on click a facet tag name (tag facet)
  $(facetFilter.facetDivId + ' .remove-tag').on('click', function () {
    // console.log('clicked remove tag');
    facetFilter.removeTagFilter($(this).data('facet'), $(this).data('value'));
    facetFilter.reset();
    filterObjectsByFacets(facetFilter);
    displayObjects(facetFilter);
    refocusOnFacet($(this));
  });

  $(document).on('keydown', function (e) {
    // focusable =
    //   'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]';
    // switch (e.key) {
    //   case 'ArrowLeft':
    //     $(facetFilter.facetDivId).find(focusable).first().focus();
    //     break;
    //   case 'ArrowRight':
    //     $(facetFilter.contentDivId).find(focusable).first().focus();
    //     break;
    // }
  });
}

function refocusOnFacet(link, facetFilter) {
  let facet = $(link).data('facet');
  let value = $(link).data('value');
  setTimeout(function () {
    $(
      facetFilter.facetDivId +
        ' .facet-tag[data-facet="' +
        facet +
        '"][data-value="' +
        value +
        '"]'
    ).focus();
  }, 100);
}
function createSorter(facetFilter) {
  let sorters = facetFilter.getSortableFields();
  $(facetFilter.facetDivId).append(
    '<label for="sorter" class="visually-hidden">Sort By</label><span class="input-group mb-3"><span class="input-group-text" id="basic-sort"><i class="bi bi-sort-down"></i></span><select id="sorter" class="form-control"><option>Sort by:</option></select></span>'
  );
  sorters.forEach(function (field) {
    $('#sorter').append('<option value="' + field + '">' + field + '</option>');
  });
}
function displayObjects(facetFilter) {
  // console.log('populating', facetFilter.contentDivId);
  console.log(facetFilter.data);
  $(facetFilter.contentDivId).empty();
  facetFilter.data.forEach(function (object) {
    $(facetFilter.contentDivId).append(ejs.render(facetFilter.format, object));
  });
  if (typeof facetFilter.pageConf != 'undefined') {
    paginate(facetFilter.pageConf);
  }
}

function updateTagFacets(facetFilter) {
  let tagFacets = facetFilter.getTagFacetNames();
  tagFacets.forEach(function (facet) {
    html = facetFilter.generateTagFacet(facet);
    $(facetFilter.facetDivId + ' [data-facet="' + facet + '"]').html(html);
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
  facetFilter.applyAllSliderFilters();

  textFacets.forEach(function (field) {
    const values = [];
    $(
      facetFilter.facetDivId + ' input[data-field="' + field + '"]:checked'
    ).each(function () {
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
  // console.log(facetFilter.tagCounts);
  displayObjects(facetFilter);
  updateTagFacets(facetFilter);
  bindControls(facetFilter);
}

/* Keyboard navigation */

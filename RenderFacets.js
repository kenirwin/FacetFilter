function facets(facetConf) {
  let facetFilter;

  if (
    facetConf.hasOwnProperty('schemaFile') &&
    facetConf.hasOwnProperty('dataFile')
  ) {
    $.when(
      $.ajax({
        type: 'GET',
        url: facetConf.dataFile,
        dataType: 'json',
        success: function (fileContents) {
          dataJson = fileContents;
          if (facetConf.hasOwnProperty('dataObjectPath')) {
            dataJson = getNestedObject(dataJson, facetConf.dataObjectPath);
          }
        },
        async: false,
      }),
      $.ajax({
        type: 'GET',
        url: facetConf.schemaFile,
        dataType: 'json',
        success: function (fileContents) {
          schemaJson = fileContents;
        },
        async: false,
      })
    )
      .then(function () {
        if (dataJson && schemaJson) {
          facetFilter = new FacetFilter(schemaJson, dataJson);
          facetFilter.setSearchFields(facetConf.searchableFields);
          console.log(facetFilter);
          pageSetup(facetFilter, facetConf);
        } else {
          console.error('failed to load data and schema');
          console.error('dataJson', dataJson);
          console.error('schemaJson', schemaJson);
        }
      })
      .then(function () {
        urlFilters(window.location.search, facetConf);
      });
  } else if (facetConf.hasOwnProperty('dataAndSchemaFile')) {
    $.ajax({
      type: 'GET',
      url: facetConf.dataAndSchemaFile,
      dataType: 'json',
      success: function (fileContents) {
        facetFilter = new FacetFilter(fileContents.schema, fileContents.data);
        pageSetup(facetFilter, facetConf);
        facetFilter.setSearchFields(facetConf.searchableFields);
      },
      async: false,
    });
  } else {
    console.error('Error: no dataFile or schema/data provided');
  }
}

function getNestedObject(obj, path) {
  for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
    obj = obj[path[i]];
  }
  return obj;
}

function pageSetup(facetFilter, facetConf) {
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
    '<div role="button" class="btn btn-primary form-control text-white" id="show-all" tabindex="0">Show All</div>'
  );

  console.log('facetFilter', facetFilter);

  $(facetFilter.facetDivId).prepend(
    '<span id="ff-search" class="input-group mb-3"><input type="text" class="form-control" id="search" placeholder="Search"><span class="input-group-append" id="search"><button class="btn btn-outline-primary" id="search-submit" type="button"><i class="bi bi-search"></a></span></span>'
  );
  if (facetFilter.searchFields.length == 0) {
    $('#ff-search').hide();
  }

  displayObjects(facetFilter);
  bindControls(facetFilter);
}

function treatAsClick(e) {
  // return true if the event is a click or an enter-or-spacebar keypress
  return e.type == 'click' || ['Enter', ' '].includes(e.key);
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

  // on search
  $(facetFilter.facetDivId + ' #search-submit').on(
    'click',
    function (e, facetConf) {
      console.log('on search', facetConf);
      filterObjectsBySearch(facetFilter, facetConf);
    }
  );
  $(facetFilter.facetDivId + ' #search').on('keyup', function (e) {
    if (e.key === 'Enter') {
      filterObjectsBySearch(facetFilter);
    }
  });

  // on arbitrary input change
  $(facetFilter.facetDivId).bind('facetFilter.update', function () {
    filterObjectsByFacets(facetFilter);
  });

  // on click a facet tag name (tag facet)
  $(facetFilter.facetDivId + ' .facet-tag').on(
    'click keydown',
    async function (event) {
      if (treatAsClick(event)) {
        event.preventDefault();
        $(this).toggleClass('active');
        if ($(this).attr('aria-pressed') == 'true') {
          // remove tag filter
          facetFilter.removeTagFilter(
            $(this).data('facet'),
            $(this).data('value')
          );
          facetFilter.reset();
          filterObjectsByFacets(facetFilter);
          displayObjects(facetFilter);
          refocusOnFacet($(this));
        } else {
          // add tag filter
          $(this).attr('aria-pressed', 'true');
          facetFilter.addTagFilter(
            $(this).data('facet'),
            $(this).data('value')
          );
          await filterObjectsByFacets(facetFilter);
          // console.log('remaining data', facetFilter.data);
          refocusOnFacet($(this), facetFilter);
        }
      }
    }
  );

  $('#show-all').on('click keydown', function (e) {
    if (treatAsClick(e)) {
      e.preventDefault();
      location.reload();
    }
  });

  $('#sorter').on('change', function () {
    // console.log('sorter changed: ', $(this).val());
    facetFilter.sortDataByFacet($(this).val());
    // console.log('sorted data', facetFilter.data);
    displayObjects(facetFilter);
  });

  // when needed: console log the current focused element
  // document.addEventListener(
  //   'focusin',
  //   function () {
  //     console.log('focused: ', document.activeElement);
  //   },
  //   true
  // );

  $(document).on('focus');
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

  // // on click a facet tag name (tag facet)
  // $(facetFilter.facetDivId + ' .remove-tag').on('click', function () {

  // });

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
    console.log('html', html);
    $(facetFilter.facetDivId + ' [data-facet="' + facet + '"]').replaceWith(
      html
    );
  });
}

function filterObjectsBySearch(facetFilter) {
  let search = $('#search').val();
  facetFilter.reset();
  // facetFilter.applyAllTagFilters();
  // facetFilter.applyAllSliderFilters();
  facetFilter.applySearchFilter(search);
  displayObjects(facetFilter);
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

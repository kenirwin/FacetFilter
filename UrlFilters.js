function urlFilters(params, conf) {
  const urlParams = new URLSearchParams(params);
  for (const key of urlParams.keys())
    applyUrlFilter(key, urlParams.getAll(key), conf);
}

function applyUrlFilter(key, values, conf) {
  let facet = $('#facet-' + key);
  let type = facet.data('type');
  console.log(key, values, type);
  if (type == 'tag') {
    values.forEach(function (value) {
      applyTagFilter(key, value);
    });
  }
  if (type == 'text') {
    values.forEach(function (value) {
      applyCheckboxFilter(key, values[0], conf);
    });
  }
}

function applyTagFilter(facet, value) {
  //   console.log('applyTagFilter', facet, value);
  let facetId = '#facet-' + facet;
  $(facetId + ' .facet-tag[data-value="' + value + '"]').click();
}

function applyCheckboxFilter(facet, value, conf) {
  console.log('applyCheckboxFilter', facet, value);
  let facetId = '#' + facet + '-' + value;
  // $(facetId + ' .facet-checkbox[data-value="' + value + '"]').click();
  console.log('unchecking field=' + facet);
  console.log('checking' + facetId);
  $('input[data-field="' + facet + '"]').prop('checked', false);
  $(facetId).prop('checked', true);
  $(conf.facetDivId).trigger('facetFilter.update');
}

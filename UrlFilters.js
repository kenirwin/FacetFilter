function urlFilters(params) {
  const urlParams = new URLSearchParams(params);
  for (const key of urlParams.keys())
    applyUrlFilter(key, urlParams.getAll(key));
}

function applyUrlFilter(key, values) {
  let facet = $('#facet-' + key);
  let type = facet.data('type');
  console.log(key, values, type);
  if (type == 'tag') {
    values.forEach(function (value) {
      applyTagFilter(key, value);
    });
  }
}

function applyTagFilter(facet, value) {
  //   console.log('applyTagFilter', facet, value);
  let facetId = '#facet-' + facet;
  $(facetId + ' .facet-tag[data-value="' + value + '"]').click();
}

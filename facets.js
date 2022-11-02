$(document).ready(function () {
  $('input').change(function () {
    setAllToShow();
    processTextFacets();
    processNumericFacets();
    showHide();
  });
});

function setAllToShow() {
  $('#objects li').each(function () {
    $(this).attr('data-toshow', true);
  });
}
function showHide() {
  $('#objects li[data-toshow=false]').hide();
  $('#objects li[data-toshow=true]').show();
}
function processNumericFacets() {
  let numMinFacets = [];
  $('.facets-num-min').each(function () {
    console.log($(this));
    numMinFacets.push($(this).attr('data-facet'));
  });
  console.log(numMinFacets);
  numMinFacets.forEach(function (f) {
    let min = $('#' + f + '-min').val() || null;
    let max = $('#' + f + '-max').val() || null;
    console.log('min,max' + ':', min, max);
    $('#objects li').each(function () {
      let val = parseInt($(this).attr('data-' + f));
      if ((min != null && val < min) || (max != null && val > max)) {
        $(this).attr('data-toshow', false);
        console.log('hiding', $(this).text());
      }
    });
  });
}

function processTextFacets() {
  let textFacets = [];
  $('.facets-text').each(function () {
    textFacets.push($(this).attr('data-facet'));
  });
  textFacets.forEach(function (f) {
    filterOutItems = $(
      '.facets-text[data-facet=' + f + '] input[type=checkbox]:not(:checked)'
    );
    let filterOutValues = [];
    $(filterOutItems).each(function () {
      filterOutValues.push($(this).attr('id'));
    });
    attrName = 'data-' + f;
    // find hidable items
    filterOutValues.forEach(function (val) {
      $('#objects li[' + attrName + '=' + val + ']').attr('data-toshow', false);
    });
    console.log(f + ':', filterOutValues);
  });
}

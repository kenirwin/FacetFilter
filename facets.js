$(document).ready(function () {
  $.getJSON('data.json', function (json) {
    displayObjects(json.data);
  });
  $('input').change(function () {
    setAllToShow();
    processTextFacets();
    processNumericFacets();
    showHide();
  });
});

function displayObjects(data) {
  $('#objects').empty();
  data.forEach(function (object) {
    $('#objects').append(
      '<li class="object ' +
        object.color +
        '"><h3>' +
        object.label +
        '</h3></li>'
    );
  });
}

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
    numMinFacets.push($(this).attr('data-facet'));
  });
  //   console.log(numMinFacets);
  numMinFacets.forEach(function (f) {
    let min = $('#' + f + '-min').val() || null;
    let max = $('#' + f + '-max').val() || null;
    $('#objects li').each(function () {
      let val = parseInt($(this).attr('data-' + f));
      if ((min != null && val < min) || (max != null && val > max)) {
        $(this).attr('data-toshow', false);
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
    // console.log(f + ':', filterOutValues);
  });
}

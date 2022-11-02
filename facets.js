$(document).ready(function () {
  let facets = [];
  $('.facets-text').each(function () {
    facets.push($(this).attr('data-facet'));
  });

  $('input').change(function () {
    $('#objects li').each(function () {
      $(this).attr('data-toshow', true);
    });
    facets.forEach(function (f) {
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
        $('#objects li[' + attrName + '=' + val + ']').attr(
          'data-toshow',
          false
        );
      });
      $('#objects li[data-toshow=false]').hide();
      $('#objects li[data-toshow=true]').show();
      console.log(f + ':', filterOutValues);
    });
  });
});

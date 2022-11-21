function paginate({
  dataSelector,
  itemsPerPage,
  paginationDivId,
  contentDivId,
}) {
  let data = $(dataSelector);
  let pages = Math.ceil(data.length / itemsPerPage);
  console.log('items', data.length);
  console.log('pages', pages);
  createPagination(pages, paginationDivId);
  updatePageControls(1);
  showHidePageContents(contentDivId, data, 1, itemsPerPage);
  $(paginationDivId + ' .page-item').click(function (e) {
    e.preventDefault();
    let page = $(this).index() + 1;
    updatePageControls(page);
    showHidePageContents(contentDivId, data, page, itemsPerPage);
  });
}

function createPagination(pages, paginationDivId) {
  $(paginationDivId).empty();
  for (let i = 1; i <= pages; i++) {
    $(paginationDivId).append(
      `<li class="page-item"><a class="page-link" href="#">${i}</a></li>`
    );
  }
}

function updatePageControls(page) {
  $('.page-item').removeClass('active');
  $('.page-item:nth-child(' + page + ')').addClass('active');
}

function showHidePageContents(contentDivId, data, page, itemsPerPage) {
  const start = (page - 1) * itemsPerPage;
  const end = page * itemsPerPage;
  $(contentDivId + ' .object-wrapper').each(function (index) {
    console.log(index, $(this).text());
    if (index >= start && index < end) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
}

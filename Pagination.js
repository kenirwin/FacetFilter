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
    let page;
    if ($(this).hasClass('page-arrow')) {
      let activePage = Number($(paginationDivId + ' .page-item.active').text());
      console.log('activePage', activePage);
      if ($(this).find('a').data('direction') == 'next' && activePage < pages) {
        page = activePage + 1;
      } else if (
        $(this).find('a').data('direction') == 'previous' &&
        activePage > 1
      ) {
        page = activePage - 1;
      }
    } else {
      page = $(this).index(); // skip the previous button
      console.log('page', page);
    }
    updatePageControls(page);
    showHidePageContents(contentDivId, data, page, itemsPerPage);
  });
}

function createPagination(pages, paginationDivId) {
  $(paginationDivId).empty().append(`<li class="page-item page-arrow">
      <a class="page-link" data-direction="previous" href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>`);
  for (let i = 1; i <= pages; i++) {
    $(paginationDivId).append(
      `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
    );
  }
  $(paginationDivId).append(`<li class="page-item page-arrow">
      <a class="page-link" data-direction="next" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>`);
}

function updatePageControls(page) {
  page = page + 1; // skip the previous button
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

function paginate({
  dataSelector,
  itemsPerPage,
  paginationDivId,
  paginationCountId,
  contentDivId,
}) {
  let data = $(dataSelector);
  let pages = Math.ceil(data.length / itemsPerPage);
  //   console.log('items', data.length);
  //   console.log('pages', pages);
  createPagination(pages, paginationDivId, data);
  updateCount(paginationCountId, data);
  updatePageControls(1);
  showHidePageContents(contentDivId, data, 1, itemsPerPage);
  $(paginationDivId + ' .page-item').click(function (e) {
    e.preventDefault();
    let page;
    if ($(this).hasClass('page-arrow')) {
      if ($(this).find('a').data('direction') == 'next') {
        page = getNextPage();
      } else if ($(this).find('a').data('direction') == 'previous') {
        page = getPreviousPage();
      }
    } else {
      page = $(this).index(); // skip the previous button
      //   console.log('page', page);
    }
    updatePageControls(page);
    showHidePageContents(contentDivId, data, page, itemsPerPage);
  });
}

function getCurrentPage() {
  return Number($('.page-item.active').text());
}

function getTotalPages() {
  return $('.page-item').length - 2; // skip the previous and next buttons
}

function getNextPage() {
  let activePage = getCurrentPage();
  let pages = getTotalPages();
  if (activePage < pages) {
    return activePage + 1;
  } else {
    return activePage;
  }
}

function getPreviousPage() {
  let activePage = getCurrentPage();
  if (activePage > 1) {
    return activePage - 1;
  } else {
    return activePage;
  }
}

function updateCount(paginationCountId, data) {
  $(paginationCountId).text(data.length);
}
function createPagination(pages, paginationDivId, items) {
  $(paginationDivId).empty().append(`<li class="page-item page-arrow">
      <a class="page-link" data-direction="previous" href="#" aria-label="Previous Page">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>`);
  for (let i = 1; i <= pages; i++) {
    $(paginationDivId).append(
      `<li class="page-item"><a class="page-link" href="#" data-page="${i}" aria-label="Page ${i}">${i}</a></li>`
    );
  }
  $(paginationDivId).append(`<li class="page-item page-arrow">
      <a class="page-link" data-direction="next" href="#" aria-label="Next Page">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>`);
}

function updatePageControls(page) {
  //   console.log('updatePageControls', page);
  let buttonIndex = page + 1; // skip the previous button
  let numPages = getTotalPages(); // skip the previous and next buttons
  let maxButtonIndex = numPages + 1;
  nextButtonIndex = maxButtonIndex + 1;
  //   console.log('page', page, 'of', numPages);
  $('.page-item').removeClass('active').find('a').removeAttr('aria-current');
  $('.page-item:nth-child(' + buttonIndex + ')')
    .addClass('active')
    .find('a')
    .attr('aria-current', 'page');
  if (buttonIndex == 2) {
    $('.page-item:nth-child(1)')
      .addClass('disabled')
      .find('a')
      .attr('aria-disabled', 'true')
      .attr('tabindex', '-1');
  } else {
    $('.page-item:nth-child(1)')
      .removeClass('disabled')
      .find('a')
      .attr('aria-disabled', 'false')
      .attr('tabindex', '0');
  }

  //   console.log('buttonIndex', buttonIndex, 'maxButtonIndex', maxButtonIndex);
  if (buttonIndex == maxButtonIndex) {
    $('.page-item:nth-child(' + nextButtonIndex + ')')
      .addClass('disabled')
      .attr('aria-disabled', 'true')
      .attr('tabindex', '-1');
  } else {
    $('.page-item:nth-child(' + numPages + ')')
      .removeClass('disabled')
      .attr('aria-disabled', 'false')
      .attr('tabindex', '0');
  }
}

function showHidePageContents(contentDivId, data, page, itemsPerPage) {
  const start = (page - 1) * itemsPerPage;
  const end = page * itemsPerPage;
  $(contentDivId + ' .object-wrapper').each(function (index) {
    // console.log(index, $(this).text());
    if (index >= start && index < end) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
}

class FacetFilter {
  constructor(schema, data) {
    this.schema = schema;
    this.data = data;
    this.originalData = data;
    this.filters = {};
    this.tagCounts = {};
    // this.countAllTags();
  }

  setFormat(format) {
    if (format) {
      this.format = format;
    } else {
      this.format = this.defaultFormat();
    }
  }

  defaultFormat() {
    let format = '';
    this.schema.fields.forEach((field) => {
      format += `<div class="datum">${field.field}: <%= ${field.field} %></div>`;
    });
    format = `<li class="object default">${format}</li>`;
    return format;
  }

  reset() {
    this.data = this.originalData;
    // this.format = {};
    // this.countAllTags();
  }

  addTagFilter(fieldName, value) {
    if (this.filters[fieldName] == null) {
      this.filters[fieldName] = [];
    }
    this.filters[fieldName].push(value);
  }
  removeTagFilter(fieldName, value) {
    if (this.filters[fieldName] == null) {
      return;
    }
    const index = this.filters[fieldName].indexOf(value);
    if (index > -1) {
      this.filters[fieldName].splice(index, 1);
    }
  }
  applyAllTagFilters() {
    Object.keys(this.filters).forEach((filterName) => {
      this.applyTagFilter(filterName, this.filters[filterName]);
    });
  }

  applyTextFilter(filterName, values) {
    if (typeof values == 'string') {
      values = [values];
    }
    this.data = this.data.filter((item) => {
      return values.includes(item[filterName]);
    });
  }

  applyNumberFilter(filterName, min, max) {
    this.data = this.data.filter((item) => {
      if (max != null) {
        return item[filterName] >= min && item[filterName] <= max;
      }
      return item[filterName] >= min;
    });
  }

  applyTagFilter(filterName, values) {
    if (typeof values == 'string') {
      values = [values];
    }
    this.data = this.data.filter((item) => {
      if (item[filterName] == null) {
        return false;
      }
      return values.every((value) => {
        return item[filterName].includes(value);
      });
    });
  }

  compareNumbers(a, b) {
    return a - b;
  }

  getKnownValues(filterName, type) {
    let values = this.data.map((item) => {
      return item[filterName];
    });
    values = values.flat();
    if (type == 'number') {
      values = values.sort(this.compareNumbers);
    } else {
      values.sort();
    }
    return [...new Set(values)];
  }

  countAllTags() {
    this.getTagFacetNames().forEach((fieldName) => {
      this.countTags(fieldName);
    });
  }

  countTags(fieldName) {
    // console.log('countTags for:', fieldName);
    let counts = {};
    this.data.forEach((item) => {
      // console.log('item:', item);
      if (item[fieldName] == null) {
        return;
      }
      if (typeof item[fieldName] == 'string') {
        item[fieldName] = [item[fieldName]];
      }
      item[fieldName].forEach((tag) => {
        if (counts[tag] == null) {
          counts[tag] = 1;
        } else {
          counts[tag] += 1;
        }
      });
    });
    this.tagCounts[fieldName] = counts;
  }

  getFacetsByType(type) {
    let facets = [];
    this.schema.fields.forEach((facet) => {
      if (
        facet.type == type &&
        (facet.displayFacet == null || facet.displayFacet == true)
      ) {
        facets.push(facet.field);
      }
    });
    return facets;
  }
  getTextFacetNames() {
    return this.getFacetsByType('string');
  }
  getNumberFacetNames() {
    return this.getFacetsByType('int');
  }
  getTagFacetNames() {
    return this.getFacetsByType('tag');
  }

  /* sorting */

  getFacetByFieldName(fieldName) {
    return this.schema.fields.find((facet) => facet.field == fieldName);
  }

  getSortableFields() {
    let sortableFields = [];
    this.schema.fields.forEach((facet) => {
      if (facet.sortable == true) {
        sortableFields.push(facet.field);
      }
    });
    return sortableFields;
  }

  sortDataByFacet(fieldName) {
    const facet = this.getFacetByFieldName(fieldName);
    if (facet.type == 'int') {
      this.data.sort((a, b) => a[fieldName] - b[fieldName]);
      // console.log(ff.data);
    } else {
      // console.log('not an int');
      this.data.sort((a, b) => {
        let aCopy = a[fieldName];
        let bCopy = b[fieldName];
        if (a[fieldName] == null) {
          aCopy = '';
        }
        if (b[fieldName] == null) {
          bCopy = '';
        }
        aCopy = aCopy.toUpperCase() || '';
        bCopy = bCopy.toUpperCase() || '';
        if (aCopy < bCopy) {
          return -1;
        }
        if (aCopy > bCopy) {
          return 1;
        }
        return 0;
      });
    }
  }

  /* generate Facet HTML */

  generateTextFacet(fieldName) {
    const values = this.getKnownValues(fieldName, 'text');
    let options = values.map((value) => {
      let id = fieldName + '-' + value;
      return `<span class="checkbox-set"><label for="${id}">${value}</label><input type="checkbox" class="form-check-inline" id="${id}" value="${value}" data-field="${fieldName}" checked /></span>`;
    });
    return `<fieldset class="facet" id="facet-${fieldName}" data-facet="${fieldName}" data-type="text"><legend class="facet-name">${fieldName}</legend><div class="facet-options">${options.join(
      ''
    )}</div></fieldset>`;
  }

  generateNumberFacet(fieldName) {
    const values = this.getKnownValues(fieldName, 'number');
    let min = values[0];
    let max = values[values.length - 1];
    let id = fieldName;
    return `<fieldset class="facet form-group" id="facet-${fieldName}" data-facet="${fieldName}" data-type="number">
    <legend class="facet-name">${fieldName}</legend>
    <label for="${id}-min">Minimum</label><input class="form-control" type="number" id="${id}-min" data-field="${fieldName}" value="${min}" />
    <label for="${id}-max">Maximum</label><input class="form-control" type="number" id="${id}-max" data-field="${fieldName}" value="${max}" /></div>
    </fieldset>`;
  }

  generateTagFacet(fieldName) {
    const values = this.getKnownValues(fieldName, 'tag').filter((item) => item);
    let html = '';
    let addClass, itemCount, removeButton;
    values.map((value) => {
      addClass = '';
      removeButton = '';
      if (
        this.filters.hasOwnProperty(fieldName) &&
        this.filters[fieldName].includes(value)
      ) {
        addClass = 'fw-bold';
        removeButton = `<a href="#" class="remove-tag" data-facet="${fieldName}" data-value="${value}"><i class="bi bi-x-circle text-danger"></i></a>`;
      }
      itemCount = this.tagCounts[fieldName][value];
      html += `<li class="${addClass}"><a href="#" class="facet-tag" data-facet="${fieldName}" data-value="${value}">${value} (${itemCount})</a> ${removeButton}</li>`;
    });
    return `<fieldset class="facet" id="facet-${fieldName}" data-facet="${fieldName}" data-type="tag"><legend class="facet-name">${fieldName}</legend>${html}</fieldset>`;
    // let options = values.map((value) => {
    //   let id = fieldName + '-' + value;
    //   return `<span class="checkbox-set"><label for="${id}">${value}</label><input type="checkbox" class="form-check-inline" id="${id}" value="${value}" data-field="${fieldName}" checked /></span>`;
    // });
    // return `<fieldset class="facet" id="facet-${fieldName}" data-facet="${fieldName}" data-type="tag"><legend class="facet-name">${fieldName}</legend><div class="facet-options">${options.join(
    //   ''
    // )}</div></fieldset>`;
  }
}
module.exports = FacetFilter;

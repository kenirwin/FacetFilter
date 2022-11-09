class FacetFilter {
  constructor(schema, data) {
    this.schema = schema;
    this.data = data;
    this.originalData = data;
    this.filters = {};
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
  }

  addTagFilter(fieldName, value) {
    if (this.filters[fieldName] == null) {
      this.filters[fieldName] = [];
    }
    this.filters[fieldName].push(value);
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
    let addClass;
    let options = values.map((value) => {
      addClass = '';
      if (
        this.filters.hasOwnProperty(fieldName) &&
        this.filters[fieldName].includes(value)
      ) {
        addClass = 'fw-bold';
      }
      html += `<li class="${addClass}"><a href="#" class="facet-tag" data-facet="${fieldName}" data-value="${value}">${value}</a></li>`;
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

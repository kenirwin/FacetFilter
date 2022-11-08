class FacetFilter {
  constructor(schema, data) {
    this.schema = schema;
    this.data = data;
    this.originalData = data;
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
      console.log(field);
      format += `<div class="datum">${field.field}: <%= ${field.field} %></div>`;
    });
    format = `<li class="object default">${format}</li>`;
    return format;
  }

  reset() {
    this.data = this.originalData;
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
    // if (typeof values == 'string') {
    //   values = [values];
    // }
    // this.data = this.data.filter((item) => {
    //   return values.every((value) => {
    //     return item[filterName].includes(value);
    //   });
    // });
  }

  compareNumbers(a, b) {
    return a - b;
  }

  getKnownValues(filterName, type) {
    let values = this.data.map((item) => {
      return item[filterName];
    });
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

  generateTextFacet(fieldName) {
    const values = this.getKnownValues(fieldName, 'text');
    let options = values.map((value) => {
      let id = fieldName + '-' + value;
      return `<span class="checkbox-set"><label for="${id}">${value}</label><input type="checkbox" id="${id}" value="${value}" data-field="${fieldName}" checked /></span>`;
    });
    return `<div class="facet" id="facet-${fieldName}" data-facet="${fieldName}" data-type="text"><h3>${fieldName}</h3><div class="facet-options">${options.join(
      ''
    )}</div></div>`;
  }

  generateNumberFacet(fieldName) {
    const values = this.getKnownValues(fieldName, 'number');
    let min = values[0];
    let max = values[values.length - 1];
    let id = fieldName;
    return `<div class="facet" id="facet-${fieldName}" data-facet="${fieldName}" data-type="number"><h3>${fieldName}</h3>
    <label for="${id}-min">Minimum</label><input type="number" id="${id}-min" data-field="${fieldName}" value="${min}" /></div>
    <label for="${id}-max">Maximum</label><input type="number" id="${id}-max" data-field="${fieldName}" value="${max}" /></div>
    </div>`;
  }
}
module.exports = FacetFilter;

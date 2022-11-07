class FacetFilter {
  constructor(schema, data) {
    this.schema = schema;
    this.data = data;
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
}

module.exports = FacetFilter;

# FacetFilter

**FacetFilter** is a client-side tool for creating a facet-based sorting/limiting interface for exploring web-based content based on an array of JSON objects. The content format is customizable.

## Dependencies

FacetFiter uses jQuery, Bootstrap, and EJS.

## Setup

### Data Setup

The interfaces is built on a JSON object with two main properties: schema and data. The schema defines the allowed data attributes and interface setup. The data describes each individual entry, and is used to create the main content.

The schema has a "fields" array; that array holds one object for each data field used in by the data objects:

1. field: the name of the field; fieldName should use letters and numbers only (e.g. "address1" or "fieldName") with no spaces or dashes. Do _not_ use "field name" or "field-name".
2. type: can be "int", "string", or "tag" -- tags are arrays, e.g. ["propOne","propTwo"]
3. sortable: true/false; should this field appear in the list of sort options? If data are sorted by tag, only the first tag value will be used in the sorting process.
4. displayFacet: true/false; should a facet be displayed for this value. Facets should typically be use on fields where multiple objects will have the same values (e.g. "color" or "shape") rather than more-or-less unique properties like "name, "address", etc.

A very simple JSON object for configuring the interface might look like:

```
{
    "schema": {
        "fields": [
            {
                "field": "letter",
                "type": "string",
                "sortable": true,
                "displayFacet": false
            },
            {
                "field": "number",
                "type": "int",
                "sortable": true
            },
            {
                "field": "letterType",
                "type": "tag",
                "options": [
                    "vowel",
                    "consonant"
                ],
                "sortable": false
            }
        ]
    },
    "data": [
        {
            "label": "Q1",
            "letter": "Q",
            "number": 1,
            "letterType": "consonant"
        },
        {
            "label": "P14",
            "letter": "P",
            "number": 14,
            "letterType": "consonant"
        },
        {
            "label": "N4",
            "letter": "N",
            "number": 4,
            "letterType": "consonant"
        }
    ]
}
```

### Interface Setup

When setting up the interface, put the `FacetFilter.js` and `RenderFacet.js` into a web-available directory and use code similar to the following to include the relevant dependencies and the two scripts.

```
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Facet Demo: Faces</title>
    <script src="https://code.jquery.com/jquery-3.6.1.min.js" integrity="sha256-o88AwQnZB+VDvE9tvIXrMQaPlFFSUTR+nldQm1LuPXQ=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.min.js" integrity="sha384-IDwe1+LCz02ROU9k972gdyvl+AESN10+x7tBKgc9I5HFtuNz0wWnPclzo6p9vxnk" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/ejs@3.1.8/ejs.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.9.1/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/faces.css">
    <script src="FacetFilter.js"></script>
    <script>
        const itemFormat = '<a href="<%= url %>"><li class="card object"><img class="card-img-top" src="<%= photo %>""><div class="card-body"><%= firstName %> <%= lastName %><br><%= decades %></div></li></a><li>'
        const dataFile = 'data/faces.json';
    </script>
    <script src="RenderFacets.js"></script>
</head>
<body class="">
    <h1>Facet Demo</h1>
    <div class="row">
        <div id="facets" class="col-md-3 form">
        </div>
        <ul id="objects" class="col-md-9">
        </ul>
    </div>
</body>
</html>
```

Once you have copied this code, there are two elements to configure: `itemFormat` and `dataFile`. The `dataFile` should point to the JSON object described above. `itemFormat` defines an EJS-compatible string referencing fieldnames to be included in a template, e.g. the follwing, which creates a Bootstrap card for each entry based on the data for `url`,`photo`,`firstName`,`lastName`:

```
const itemFormat = '<a href="<%= url %>"><li class="card object"><img class="card-img-top" src="<%= photo %>""><div class="card-body"><%= firstName %> <%= lastName %></div></li></a><li>'
```

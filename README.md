# FacetFilter

**FacetFilter** is a client-side tool for creating a facet-based sorting/limiting interface for exploring web-based content based on an array of JSON objects. The content format is customizable. It is ideal guiding users to content for small sets of data (e.g. dozens or hundreds of entries) that can be represented in a static JSON file.

## Dependencies

FacetFiter uses jQuery, Bootstrap, and EJS.

## Setup

### Data Setup

The interfaces is built on a JSON object with two main properties: schema and data. The schema defines the allowed data attributes and interface setup. The data describes each individual entry, and is used to create the main content.

The schema has a "fields" array; that array holds one object for each data field used in by the data objects:

1. fieldName: the name of the field; fieldName should use letters and numbers only (e.g. "address1" or "firstName") with no spaces or dashes. Do _not_ use "first name" or "first-name".
2. fieldLabel (optional): how the field should be labeled for the user. If fieldLabel isn't present, the fieldName will be presented to the user instead. fieldLabels are useful if you have a multiword fieldName like "firstName" that you'd like to present as "First Name".
3. fieldType: can be "number", "string", or "tag" -- tags are arrays, e.g. ["propOne","propTwo"]
4. sortable: true/false; should this field appear in the list of sort options? If data are sorted by tag, only the first tag value will be used in the sorting process.
5. filterable: true/false; should a facet be displayed for this value. Facets should typically be use on fields where multiple objects will have the same values (e.g. "color" or "shape") rather than more-or-less unique properties like "name, "address", etc.

A very simple JSON object for configuring the interface might look like:

```
{
    "schema": [
        {
            "fieldName": "letter",
            "fieldType": "string",
            "sortable": true,
            "filterable": false
        },
        {
            "fieldName": "number",
            "fieldType": "int",
            "sortable": true
        },
        {
            "fieldName": "letterType",
            "fieldLabel": "Letter Type"
            "fieldType": "tag",
            "sortable": false
        }
    ],
    "data": [
        {
            "letter": "Q",
            "number": 1,
            "letterType": "consonant"
        },
        {
            "letter": "P",
            "number": 14,
            "letterType": "consonant"
        },
        {
            "letter": "N",
            "number": 4,
            "letterType": "consonant"
        }
    ]
}
```

### Interface Setup

When setting up the interface, put the `FacetFilter.js` and `RenderFacet.js` into a web-available directory and use code similar to the following to include the relevant dependencies and the two scripts, as well as the configuration script followed by the command to create the facets and display the content: `facets(conf);`.

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
    <script src="RenderFacets.js"></script>
    <script>
        conf = {
            itemFormat: '<a href="<%= url %>"><li class="card object"><img class="card-img-top" src="<%= photo %>""><div class="card-body"><%= firstName %> <%= lastName %><br><%= decades %></div></li></a><li>',
            dataFile: 'data/faces.json',
            facetDivId: '#facets',
            contentDivId: '#content'
            }
            facets(conf);
    </script>
</head>
<body class="">
    <h1>Facet Demo</h1>
    <div class="row">
        <div id="facets" class="col-md-3 form">
        </div>
        <ul id="content" class="col-md-9">
        </ul>
    </div>
</body>
</html>
```

Once you have copied this code, there are several options to configure

#### Required elements

- `facetDivId` is the selector for the div where you want the facets to display, e.g. `'#facets'`
- `contentDivId` is the selector for the div where you want the main content to display, e.g. `'objects'`

#### Semi-required: must include EITHER `dataFile` OR `data` & `schema` objects

- `dataFile`: should point to the JSON object described above, including both a `data` and a `schema` object.
- `data`: pass a JavaScript object instead of a data file. if used, must also pass a `schema` object.
- `schema`: pass a JavaScript object instead of a data file. if used, must also pass a `data` object.

#### Optional Formatter

- `itemFormat` defines an EJS-compatible string referencing fieldnames to be included in a template, e.g. the follwing, which creates a Bootstrap card for each entry based on the data for `url`,`photo`,`firstName`,`lastName`:

```
const itemFormat = '<a href="<%= url %>"><li class="card object"><img class="card-img-top" src="<%= photo %>""><div class="card-body"><%= firstName %> <%= lastName %></div></li></a><li>'
```

If `itemFormat` is left undefined, the object will be listed as a list of text attributes. See the [Unformatted](https://kenirwin.github.io/FacetFilter/unformatted.html) demo for an example.

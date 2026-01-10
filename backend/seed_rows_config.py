# -----------------------------
# Metadata Definitions
# -----------------------------
ENTITIES = [
    # Schema Form A
    {
        "id": "A",
        "title": "Schema Form A",
        "api": "/api/entity/a",
        "form_type": "schema",
        "columns": [
            {"header": "Name", "field": "name"},
            {"header": "Age", "field": "age"},
            {"header": "Country", "field": "country"},
            {"header": "State", "field": "state"},
            {"header": "BirthDate", "field": "birthDate"},
            {"header": "Salary", "field": "salary", "renderer": "price", "rendererParams": {"currencyField": "currency"}},
            {"header": "Currency", "field": "currency", "hidden": True},
        ],
        "fields": [
            {"name": "name", "label": "Name", "type": "text", "required": True},
            {"name": "age", "label": "Age", "type": "number"},
            {"name": "country", "label": "Country", "type": "dynamic-select", "optionsAPI": "/api/countries", "optionLabel": "name", "optionValue": "code"},
            {"name": "state", "label": "State", "type": "dynamic-select", "dependsOn": "country", "optionsAPI": "/api/states?country={country}", "optionLabel": "name", "optionValue": "code"},
            {"name": "birthDate", "label": "Birth Date", "type": "date"},
            {"name": "salary", "label": "Salary", "type": "number"},
            {"name": "currency", "label": "Currency", "type": "select", "options": [
                {"label": "USD", "value": "USD"},
                {"label": "EUR", "value": "EUR"},
                {"label": "GBP", "value": "GBP"},
                {"label": "INR", "value": "INR"},
            ], "optionLabel": "label", "optionValue": "value"},
        ],
        "rows": [
            {"name": "John Doe", "age": 30, "country": "US", "state": "NY", "birthDate": "1993-05-15", "salary": 60000, "currency": "USD"},
            {"name": "Jane Smith", "age": 25, "country": "US", "state": "NJ", "birthDate": "1998-08-22", "salary": 75000, "currency": "USD"},
            {"name": "Alice Johnson", "age": 28, "country": "US", "state": "NC", "birthDate": "1995-12-03", "salary": 80000, "currency": "USD"},
            {"name": "Bob Brown", "age": 41, "country": "IN", "state": "KA", "birthDate": "1982-11-11", "salary": 1200000, "currency": "INR"},
        ],
        "actions": [
            {
                "id": "viewDetails",
                "label": "View Details",
                "tooltip": "View detailed information",
                "type": "form",
                "icon": "info",
                "icon_color": "primary",
                "form": {
                    "type": "schema",
                    "fields": [
                        {"name": "name", "label": "Name", "type": "text", "readOnly": True},
                        {"name": "age", "label": "Age", "type": "number", "readOnly": True},
                    ],
                },
            },
            {
                "id": "deactivate",
                "label": "Deactivate",
                "tooltip": "Deactivate this record",
                "icon": "block",
                "icon_color": "error",
                "type": "api",
                "api": "/api/entity/a/deactivate",
                "dialogOptions": {"title": "Deactivate Item", "content": "Are you sure you want to deactivate this item?"},
                "method": "POST",
                "confirm": True,
            },
            {
                "id": "export",
                "label": "Export",
                "tooltip": "Export this record's data",
                "icon": "download",
                "icon_color": "primary",
                "type": "custom",
                "handler": "exportRow",
            },
            {
                "id": "auditLog",
                "label": "Audit Log",
                "tooltip": "View the audit log for this record",
                "type": "custom",
                "icon": "article",
                "icon_color": "secondary",
                "handler": "openAuditLog",
            },
        ],
    },

    # Schema Form 2
    {
        "id": "schemaForm2",
        "title": "Schema Form 2",
        "api": "/api/entity/schemaForm2",
        "form_type": "schema",
        "columns": [
            {"header": "Title", "field": "title"},
            {"header": "Type", "field": "type"},
            {"header": "Active Status", "field": "isActive", "renderer": "checkbox"},
        ],
        "fields": [
            {"name": "title", "label": "Title", "type": "text", "required": True},
            {"name": "type", "label": "Type", "type": "select"},
            {"name": "isActive", "label": "Active Status", "type": "checkbox"},
        ],
        "rows": [
            {"title": "Sample Title 1", "type": "A", "isActive": True},
            {"title": "Sample Title 2", "type": "B", "isActive": False},
            {"title": "Sample Title 3", "type": "A", "isActive": True},
        ],
    },

    # Custom Form B
    {
        "id": "B",
        "title": "Custom Form B",
        "api": "/api/entity/b",
        "form_type": "component",
        "component": "FormB",
        "columns": [
            {"header": "Title", "field": "title"},
            {"header": "Active Status", "field": "isActive"},
        ],
        "rows": [
            {"title": "Sample Title", "isActive": True},
            {"title": "Another Title", "isActive": False},
            {"title": "Third Title", "isActive": True},
        ],
    },

    # Custom Form C
    {
        "id": "C",
        "title": "Custom Form C",
        "api": "/api/entity/c",
        "form_type": "component",
        "component": "FormC",
        "columns": [
            {"header": "Description", "field": "description"},
            {"header": "Quantity", "field": "quantity"},
        ],
        "rows": [
            {"description": "This is a sample description.", "quantity": 100},
            {"description": "Another description here.", "quantity": 250},
            {"description": "More descriptions.", "quantity": 75},
        ],
    },

    # Schema Form D
    {
        "id": "D",
        "title": "Schema Form D with Dynamic Select",
        "api": "/api/entity/d",
        "form_type": "schema",
        "columns": [
            {"header": "Item Name", "field": "itemName"},
            {"header": "Category", "field": "category"},
        ],
        "fields": [
            {"name": "itemName", "label": "Item Name", "type": "text", "required": True},
            {"name": "category", "label": "Category", "type": "dynamic-select", "optionsAPI": "/api/categories", "optionLabel": "name", "optionValue": "id"},
        ],
        "rows": [
            {"itemName": "Item 1", "category": "Category A"},
            {"itemName": "Item 2", "category": "Category B"},
            {"itemName": "Item 3", "category": "Category A"},
        ],
    },

    # Schema Form E
    {
        "id": "E",
        "title": "Schema Form E with Dependent Fields",
        "api": "/api/entity/e",
        "form_type": "schema",
        "columns": [
            {"header": "Country", "field": "country"},
            {"header": "State", "field": "state"},
        ],
        "fields": [
            {"name": "country", "label": "Country", "type": "dynamic-select", "optionsAPI": "/api/countries", "optionLabel": "name", "optionValue": "code"},
            {"name": "state", "label": "State", "type": "dynamic-select", "dependsOn": "country", "optionsAPI": "/api/states?country={country}", "optionLabel": "name", "optionValue": "code"},
        ],
        "rows": [
            {"country": "US", "state": "NY"},
            {"country": "US", "state": "CA"},
            {"country": "CA", "state": "ON"},
        ],
    },
]

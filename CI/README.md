# Sandbox setup

The CI needs to connect with the sandboxes using OCAPIs
You can find below the setup to insert in all the sandboxes which needs to be used in the CI

## WebDAV Client Application Permissions
Insert the following
```
{
      "clients":
      [
        {
          "client_id": "3614ff29-2407-438b-8966-5a03a08a8028",
          "permissions":
          [
            {
              "path": "/impex",
              "operations": [
                "read_write"
              ]
            },
            {
              "path": "/cartridges",
              "operations": [
                "read_write"
              ]
            }
          ]
        }
      ]
    }
```

## WebDAV Client Application Permissions
Insert the following client on "Data" OCAPI for the Global context
```
{
			"client_id": "3614ff29-2407-438b-8966-5a03a08a8028",
			"resources": [
				{
					"resource_id": "/code_versions",
					"methods": [
						"get"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/code_versions/*",
					"methods": [
						"patch",
						"delete"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/jobs/*/executions",
					"methods": [
						"post"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/jobs/*/executions/*",
					"methods": [
						"get"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/sites/*/cartridges",
					"methods": [
						"post"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/role_search",
					"methods": [
						"post"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/roles/*",
					"methods": [
						"get"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/roles/*/user_search",
					"methods": [
						"post"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/roles/*/users/*",
					"methods": [
						"put",
						"delete"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/user_search",
					"methods": [
						"post"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/users",
					"methods": [
						"get"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				},
				{
					"resource_id": "/users/*",
					"methods": [
						"put",
						"get",
						"patch",
						"delete"
					],
					"read_attributes": "(**)",
					"write_attributes": "(**)"
				}
			]
		}
```
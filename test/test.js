const Immutable = require("immutable");
const assert = require("assert");
const transformErrors = require("../utils/errorUtils");

describe("Running ImmutableJS error tests", () => {
  it("should reduce errors to single string split into sentences", () => {
    const errors = Immutable.fromJS({
      email: ["Invalid email format"],
      password: [
        "Must include both lowercase and uppercase characters",
        "Must be at least 8 characters long",
        "This field is required"
      ]
    });

    const result = transformErrors(errors);

    // each field should return flattened errors
    assert.deepEqual(result.toJS(), {
      email: "Invalid email format.",
      password:
        "Must include both lowercase and uppercase characters. " +
        "Must be at least 8 characters long. This field is required."
    });
  });

  it("should flatten nested errors", () => {
    const errors = Immutable.fromJS({
      tags: [
        {},
        {
          non_field_errors: ["Only alphanumeric characters are allowed"],
          another_error: ["Only alphanumeric characters are allowed"],
          third_error: ["Third error"]
        },
        {},
        {
          non_field_errors: [
            "Minumum length of 10 characters is required",
            "Only alphanumeric characters are allowed"
          ]
        }
      ],
      tag: {
        nested: {
          non_field_errors: ["Only alphanumeric characters are allowed"]
        }
      }
    });

    const result = transformErrors(errors);

    assert.deepEqual(result.toJS(), {
      tags:
        "Only alphanumeric characters are allowed. Third error. " +
        "Minumum length of 10 characters is required.",
      tag: "Only alphanumeric characters are allowed."
    });
  });

  it("should nest errors with fields included", () => {
    const errors = Immutable.fromJS({
      tags: [
        {},
        {
          non_field_errors: ["Only alphanumeric characters are allowed"],
          another_error: ["Only alphanumeric characters are allowed"],
          third_error: ["Third error"]
        },
        {},
        {
          non_field_errors: [
            "Minumum length of 10 characters is required",
            "Only alphanumeric characters are allowed"
          ]
        }
      ],
      tag: {
        nested: {
          non_field_errors: ["Only alphanumeric characters are allowed"]
        }
      }
    });

    const result = transformErrors(errors, "tags", "tag");

    assert.deepEqual(result.toJS(), {
      tags: [
        {},
        {
          non_field_errors: "Only alphanumeric characters are allowed.",
          another_error: "Only alphanumeric characters are allowed.",
          third_error: "Third error."
        },
        {},
        {
          non_field_errors:
            "Minumum length of 10 characters is required. " +
            "Only alphanumeric characters are allowed."
        }
      ],
      tag: {
        nested: {
          non_field_errors: "Only alphanumeric characters are allowed."
        }
      }
    });
  });

  it("should nest correct errors if field is included on deep object", () => {
    // example error object returned from API converted to Immutable.Map
    const errors = Immutable.fromJS({
      name: ["This field is required"],
      age: ["This field is required", "Only numeric characters are allowed"],
      urls: [
        {},
        {},
        {
          site: {
            code: ["This site code is invalid"],
            id: ["Unsupported id"]
          }
        }
      ],
      url: {
        site: {
          code: ["This site code is invalid"],
          id: ["Unsupported id"]
        }
      },
      tags: [
        {},
        {
          non_field_errors: ["Only alphanumeric characters are allowed"],
          another_error: ["Only alphanumeric characters are allowed"],
          third_error: ["Third error"]
        },
        {},
        {
          non_field_errors: [
            "Minumum length of 10 characters is required",
            "Only alphanumeric characters are allowed"
          ]
        }
      ],
      tag: {
        nested: {
          non_field_errors: ["Only alphanumeric characters are allowed"]
        }
      }
    });

    // in this specific case,
    // errors for `url` and `urls` keys should be nested
    // see expected object below
    const result = transformErrors(errors, "urls", "url");

    assert.deepEqual(result.toJS(), {
      name: "This field is required.",
      age: "This field is required. Only numeric characters are allowed.",
      urls: [
        {},
        {},
        {
          site: {
            code: "This site code is invalid.",
            id: "Unsupported id."
          }
        }
      ],
      url: {
        site: {
          code: "This site code is invalid.",
          id: "Unsupported id."
        }
      },
      tags:
        "Only alphanumeric characters are allowed. Third error. " +
        "Minumum length of 10 characters is required.",
      tag: "Only alphanumeric characters are allowed."
    });
  });
});

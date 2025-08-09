/* eslint-disable */
/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * You may import it to create a `graphql()` tag function with `gql.tada`
 * by importing it and passing it to `initGraphQLTada<>()`.
 *
 * @example
 * ```
 * import { initGraphQLTada } from 'gql.tada';
 * import type { introspection } from './introspection';
 *
 * export const graphql = initGraphQLTada<{
 *   introspection: typeof introspection;
 *   scalars: {
 *     DateTime: string;
 *     Json: any;
 *   };
 * }>();
 * ```
 */
const introspection = {
  "__schema": {
    "queryType": {
      "name": "RootQueryType"
    },
    "mutationType": {
      "name": "RootMutationType"
    },
    "subscriptionType": {
      "name": "RootSubscriptionType"
    },
    "types": [
      {
        "kind": "ENUM",
        "name": "AnalyticsMetric",
        "enumValues": [
          {
            "name": "BOUNCE_RATE",
            "isDeprecated": false
          },
          {
            "name": "PAGEVIEWS",
            "isDeprecated": false
          },
          {
            "name": "VIEWS_PER_VISIT",
            "isDeprecated": false
          },
          {
            "name": "VISIT_DURATION",
            "isDeprecated": false
          },
          {
            "name": "VISITORS",
            "isDeprecated": false
          },
          {
            "name": "VISITS",
            "isDeprecated": false
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "AnalyticsMetrics",
        "fields": [
          {
            "name": "bounceRate",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "pageviews",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "viewsPerVisit",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "visitDuration",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "visitors",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "visits",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "AnalyticsPeriod"
      },
      {
        "kind": "ENUM",
        "name": "AnalyticsProperty",
        "enumValues": [
          {
            "name": "EVENT_GOAL",
            "isDeprecated": false
          },
          {
            "name": "EVENT_HOSTNAME",
            "isDeprecated": false
          },
          {
            "name": "EVENT_PAGE",
            "isDeprecated": false
          },
          {
            "name": "VISIT_BROWSER",
            "isDeprecated": false
          },
          {
            "name": "VISIT_BROWSER_VERSION",
            "isDeprecated": false
          },
          {
            "name": "VISIT_CITY",
            "isDeprecated": false
          },
          {
            "name": "VISIT_COUNTRY",
            "isDeprecated": false
          },
          {
            "name": "VISIT_DEVICE",
            "isDeprecated": false
          },
          {
            "name": "VISIT_ENTRY_PAGE",
            "isDeprecated": false
          },
          {
            "name": "VISIT_EXIT_PAGE",
            "isDeprecated": false
          },
          {
            "name": "VISIT_OS",
            "isDeprecated": false
          },
          {
            "name": "VISIT_OS_VERSION",
            "isDeprecated": false
          },
          {
            "name": "VISIT_REFERRER",
            "isDeprecated": false
          },
          {
            "name": "VISIT_REGION",
            "isDeprecated": false
          },
          {
            "name": "VISIT_SOURCE",
            "isDeprecated": false
          },
          {
            "name": "VISIT_UTM_CAMPAIGN",
            "isDeprecated": false
          },
          {
            "name": "VISIT_UTM_CONTENT",
            "isDeprecated": false
          },
          {
            "name": "VISIT_UTM_MEDIUM",
            "isDeprecated": false
          },
          {
            "name": "VISIT_UTM_SOURCE",
            "isDeprecated": false
          },
          {
            "name": "VISIT_UTM_TERM",
            "isDeprecated": false
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "Article",
        "fields": [
          {
            "name": "category",
            "type": {
              "kind": "OBJECT",
              "name": "Category"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "contentModules",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "ContentModule"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "groups",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "UserGroup"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isPinnedToTop",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isReactionsEnabled",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "preview",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "previewImageFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "published",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "reactionCounts",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "ArticleReactionCount"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "readyToPublish",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "tags",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "title",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "users",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "User"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "ArticleFilter",
        "inputFields": [
          {
            "name": "first",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            }
          },
          {
            "name": "updatedBefore",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "ArticleInput",
        "inputFields": [
          {
            "name": "category",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectCategoryInput"
            }
          },
          {
            "name": "contentModules",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INPUT_OBJECT",
                "name": "ContentModuleInput"
              }
            }
          },
          {
            "name": "groups",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INPUT_OBJECT",
                "name": "SelectUserGroupInput"
              }
            }
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            }
          },
          {
            "name": "isReactionsEnabled",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "preview",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "previewImageFile",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectFileInput"
            }
          },
          {
            "name": "published",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "readyToPublish",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "tags",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            }
          },
          {
            "name": "title",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            }
          },
          {
            "name": "users",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INPUT_OBJECT",
                "name": "SelectUserInput"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "ArticleReactionCount",
        "fields": [
          {
            "name": "count",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "type",
            "type": {
              "kind": "ENUM",
              "name": "ArticleReactionType"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "ENUM",
        "name": "ArticleReactionType",
        "enumValues": [
          {
            "name": "FACE_FLUSHED",
            "isDeprecated": false
          },
          {
            "name": "FACE_SMILE",
            "isDeprecated": false
          },
          {
            "name": "HEART",
            "isDeprecated": false
          },
          {
            "name": "HEART_CRACK",
            "isDeprecated": false
          },
          {
            "name": "LEMON",
            "isDeprecated": false
          },
          {
            "name": "PEPPER",
            "isDeprecated": false
          },
          {
            "name": "SKULL",
            "isDeprecated": false
          },
          {
            "name": "THUMB_UP",
            "isDeprecated": false
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "Authresult",
        "fields": [
          {
            "name": "accessToken",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "refreshToken",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "AvailableFormat",
        "fields": [
          {
            "name": "availability",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "FormatAvailability"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "mimeType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "ConversionFormat"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "type",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "FileType"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "url",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "Boolean"
      },
      {
        "kind": "OBJECT",
        "name": "BreakdownMetrics",
        "fields": [
          {
            "name": "metrics",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "MetricResult"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "property",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Calendar",
        "fields": [
          {
            "name": "color",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "events",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "CalendarEvent"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isPubliclyAvailable",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "subscriptionUrl",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "CalendarEvent",
        "fields": [
          {
            "name": "calendar",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Calendar"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "description",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "end",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isFullDay",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "recurrence",
            "type": {
              "kind": "OBJECT",
              "name": "CalendarEventRecurrence"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "start",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "summary",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "CalendarEventInput",
        "inputFields": [
          {
            "name": "calendarId",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            }
          },
          {
            "name": "description",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "end",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            }
          },
          {
            "name": "isFullDay",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean"
              }
            }
          },
          {
            "name": "recurrence",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "RecurrenceInput"
            }
          },
          {
            "name": "start",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            }
          },
          {
            "name": "summary",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          },
          {
            "name": "timezone",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "CalendarEventRecurrence",
        "fields": [
          {
            "name": "daysOfMonth",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "Int"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "daysOfWeek",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "frequency",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "CalendarEventRecurrenceFrequency"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "interval",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "occurrences",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "until",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "ENUM",
        "name": "CalendarEventRecurrenceFrequency",
        "enumValues": [
          {
            "name": "DAILY",
            "isDeprecated": false
          },
          {
            "name": "MONTHLY",
            "isDeprecated": false
          },
          {
            "name": "WEEKLY",
            "isDeprecated": false
          },
          {
            "name": "YEARLY",
            "isDeprecated": false
          }
        ]
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "CalendarInput",
        "inputFields": [
          {
            "name": "color",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "isPubliclyAvailable",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean"
              }
            },
            "defaultValue": "false"
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "Category",
        "fields": [
          {
            "name": "bannerImageFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "category",
            "type": {
              "kind": "OBJECT",
              "name": "Category"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "groups",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "UserGroup"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "hideArticlesFromHomepage",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isHomepage",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isSidenav",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "layoutName",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "redirect",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "sortKey",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "title",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "widgets",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "Widget"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "ContentModule",
        "fields": [
          {
            "name": "configuration",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "content",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "files",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "File"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "sortKey",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "type",
            "type": {
              "kind": "ENUM",
              "name": "ContentModuleType"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "ContentModuleInput",
        "inputFields": [
          {
            "name": "configuration",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            }
          },
          {
            "name": "content",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            }
          },
          {
            "name": "files",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INPUT_OBJECT",
                "name": "SelectFileInput"
              }
            }
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            }
          },
          {
            "name": "sortKey",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            }
          },
          {
            "name": "type",
            "type": {
              "kind": "ENUM",
              "name": "ContentModuleType"
            },
            "defaultValue": "TEXT"
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "ContentModuleResult",
        "fields": [
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "result",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "user",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "ENUM",
        "name": "ContentModuleType",
        "enumValues": [
          {
            "name": "AUDIO",
            "isDeprecated": false
          },
          {
            "name": "DIVIDER",
            "isDeprecated": false
          },
          {
            "name": "DOWNLOAD",
            "isDeprecated": false
          },
          {
            "name": "FORM",
            "isDeprecated": false
          },
          {
            "name": "IMAGE",
            "isDeprecated": false
          },
          {
            "name": "IMAGE_COLLECTION",
            "isDeprecated": false
          },
          {
            "name": "TABLE",
            "isDeprecated": false
          },
          {
            "name": "TEXT",
            "isDeprecated": false
          },
          {
            "name": "TITLE",
            "isDeprecated": false
          },
          {
            "name": "VIDEO",
            "isDeprecated": false
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "Conversation",
        "fields": [
          {
            "name": "groups",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "UserGroup"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "messages",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "Message"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "unreadMessages",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "users",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "User"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "ENUM",
        "name": "ConversionFormat",
        "enumValues": [
          {
            "name": "ARTICLEPREVIEW_165",
            "isDeprecated": false
          },
          {
            "name": "ARTICLEPREVIEW_330",
            "isDeprecated": false
          },
          {
            "name": "ARTICLEPREVIEW_660",
            "isDeprecated": false
          },
          {
            "name": "ARTICLEPREVIEW_99",
            "isDeprecated": false
          },
          {
            "name": "ARTICLEPREVIEW_990",
            "isDeprecated": false
          },
          {
            "name": "AUDIOPLAY_AAC",
            "isDeprecated": false
          },
          {
            "name": "AUDIOPLAY_OGG",
            "isDeprecated": false
          },
          {
            "name": "AVATAR_100",
            "isDeprecated": false
          },
          {
            "name": "AVATAR_1000",
            "isDeprecated": false
          },
          {
            "name": "AVATAR_250",
            "isDeprecated": false
          },
          {
            "name": "AVATAR_50",
            "isDeprecated": false
          },
          {
            "name": "AVATAR_500",
            "isDeprecated": false
          },
          {
            "name": "BANNER_1320",
            "isDeprecated": false
          },
          {
            "name": "BANNER_330",
            "isDeprecated": false
          },
          {
            "name": "BANNER_660",
            "isDeprecated": false
          },
          {
            "name": "BANNER_990",
            "isDeprecated": false
          },
          {
            "name": "ICON_128",
            "isDeprecated": false
          },
          {
            "name": "ICON_256",
            "isDeprecated": false
          },
          {
            "name": "ICON_64",
            "isDeprecated": false
          },
          {
            "name": "LOGO_300",
            "isDeprecated": false
          },
          {
            "name": "LOGO_600",
            "isDeprecated": false
          },
          {
            "name": "ORIGINAL",
            "isDeprecated": false
          },
          {
            "name": "PAGEBG_1024",
            "isDeprecated": false
          },
          {
            "name": "PAGEBG_1280",
            "isDeprecated": false
          },
          {
            "name": "PAGEBG_1920",
            "isDeprecated": false
          },
          {
            "name": "PAGEBG_2560",
            "isDeprecated": false
          },
          {
            "name": "POSTER_1080P",
            "isDeprecated": false
          },
          {
            "name": "PRESENT_1200",
            "isDeprecated": false
          },
          {
            "name": "PRESENT_1600",
            "isDeprecated": false
          },
          {
            "name": "PRESENT_2400",
            "isDeprecated": false
          },
          {
            "name": "PRESENT_3200",
            "isDeprecated": false
          },
          {
            "name": "PREVIEW_200",
            "isDeprecated": false
          },
          {
            "name": "PREVIEW_400",
            "isDeprecated": false
          },
          {
            "name": "PREVIEW_800",
            "isDeprecated": false
          },
          {
            "name": "VIDEOPLAY_1080P_MP4",
            "isDeprecated": false
          },
          {
            "name": "VIDEOPLAY_1080P_WEBM",
            "isDeprecated": false
          },
          {
            "name": "VIDEOPLAY_200P_MP4",
            "isDeprecated": false
          },
          {
            "name": "VIDEOPLAY_200P_WEBM",
            "isDeprecated": false
          },
          {
            "name": "VIDEOPLAY_480P_MP4",
            "isDeprecated": false
          },
          {
            "name": "VIDEOPLAY_480P_WEBM",
            "isDeprecated": false
          },
          {
            "name": "VIDEOPLAY_720P_MP4",
            "isDeprecated": false
          },
          {
            "name": "VIDEOPLAY_720P_WEBM",
            "isDeprecated": false
          }
        ]
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "CreateCategoryInput",
        "inputFields": [
          {
            "name": "category",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectCategoryInput"
            }
          },
          {
            "name": "isSidenav",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "defaultValue": "false"
          },
          {
            "name": "title",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "CreateFeedbackInput",
        "inputFields": [
          {
            "name": "content",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          },
          {
            "name": "metadata",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "topic",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "CustomDomain",
        "fields": [
          {
            "name": "host",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isMainDomain",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "Date"
      },
      {
        "kind": "SCALAR",
        "name": "DateTime"
      },
      {
        "kind": "OBJECT",
        "name": "DeleteUserGroupResult",
        "fields": [
          {
            "name": "unpublishedArticles",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Article"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "userGroup",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "UserGroup"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Device",
        "fields": [
          {
            "name": "customName",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "deviceType",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "lastUsed",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "modelName",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "operatingSystem",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "platformId",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Directory",
        "fields": [
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "parentDirectory",
            "type": {
              "kind": "OBJECT",
              "name": "Directory"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "path",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Directory"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "user",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "ExternalCalendarEvent",
        "fields": [
          {
            "name": "description",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "end",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "start",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "summary",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "uid",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Feedback",
        "fields": [
          {
            "name": "content",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isForwarded",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isNew",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isResponded",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "metadata",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "topic",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "user",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "File",
        "fields": [
          {
            "name": "fileType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "FileType"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "filename",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "filesize",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "formats",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "AvailableFormat"
                  }
                }
              }
            },
            "args": [
              {
                "name": "availability",
                "type": {
                  "kind": "ENUM",
                  "name": "FormatAvailabilityStatus"
                }
              },
              {
                "name": "category",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "metadata",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "mimeType",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "parentDirectory",
            "type": {
              "kind": "OBJECT",
              "name": "Directory"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "path",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Directory"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "remoteLocation",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "usage",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "UNION",
                    "name": "FileUsageLocation"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "user",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "userId",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "FileArticleUsageLocation",
        "fields": [
          {
            "name": "article",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Article"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "usage",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "FileCategoryUsageLocation",
        "fields": [
          {
            "name": "category",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Category"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "usage",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "FileContentModuleUsageLocation",
        "fields": [
          {
            "name": "article",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Article"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "contentModule",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "ContentModule"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "usage",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "FileSystemUsageLocation",
        "fields": [
          {
            "name": "usage",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "ENUM",
        "name": "FileType",
        "enumValues": [
          {
            "name": "AUDIO",
            "isDeprecated": false
          },
          {
            "name": "BINARY",
            "isDeprecated": false
          },
          {
            "name": "IMAGE",
            "isDeprecated": false
          },
          {
            "name": "MISC",
            "isDeprecated": false
          },
          {
            "name": "PDF",
            "isDeprecated": false
          },
          {
            "name": "VIDEO",
            "isDeprecated": false
          }
        ]
      },
      {
        "kind": "UNION",
        "name": "FileUsageLocation",
        "possibleTypes": [
          {
            "kind": "OBJECT",
            "name": "FileArticleUsageLocation"
          },
          {
            "kind": "OBJECT",
            "name": "FileCategoryUsageLocation"
          },
          {
            "kind": "OBJECT",
            "name": "FileContentModuleUsageLocation"
          },
          {
            "kind": "OBJECT",
            "name": "FileSystemUsageLocation"
          },
          {
            "kind": "OBJECT",
            "name": "FileUserUsageLocation"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "FileUserUsageLocation",
        "fields": [
          {
            "name": "usage",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "user",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "User"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "Float"
      },
      {
        "kind": "OBJECT",
        "name": "FormatAvailability",
        "fields": [
          {
            "name": "error",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "progress",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "status",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "FormatAvailabilityStatus"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "ENUM",
        "name": "FormatAvailabilityStatus",
        "enumValues": [
          {
            "name": "AVAILABLE",
            "isDeprecated": false
          },
          {
            "name": "FAILED",
            "isDeprecated": false
          },
          {
            "name": "PROCESSING",
            "isDeprecated": false
          },
          {
            "name": "READY",
            "isDeprecated": false
          },
          {
            "name": "REQUESTABLE",
            "isDeprecated": false
          }
        ]
      },
      {
        "kind": "SCALAR",
        "name": "ID"
      },
      {
        "kind": "SCALAR",
        "name": "Int"
      },
      {
        "kind": "SCALAR",
        "name": "Json"
      },
      {
        "kind": "OBJECT",
        "name": "MediaUsage",
        "fields": [
          {
            "name": "mediaConversionCurrentPeriod",
            "type": {
              "kind": "SCALAR",
              "name": "Float"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "mediaFilesTotal",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "mediaFilesTotalDuration",
            "type": {
              "kind": "SCALAR",
              "name": "Float"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Message",
        "fields": [
          {
            "name": "content",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "conversation",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Conversation"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "files",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "File"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "user",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "MessageInput",
        "inputFields": [
          {
            "name": "content",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "files",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "INPUT_OBJECT",
                  "name": "SelectFileInput"
                }
              }
            }
          },
          {
            "name": "recipientGroup",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectUserGroupInput"
            }
          },
          {
            "name": "recipientUser",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectUserInput"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "MetricResult",
        "fields": [
          {
            "name": "metric",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "AnalyticsMetric"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "value",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "RecurrenceInput",
        "inputFields": [
          {
            "name": "daysOfMonth",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "Int"
                }
              }
            }
          },
          {
            "name": "daysOfWeek",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            }
          },
          {
            "name": "frequency",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "CalendarEventRecurrenceFrequency"
              }
            }
          },
          {
            "name": "interval",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            }
          },
          {
            "name": "occurrences",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            }
          },
          {
            "name": "until",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "RegisterDeviceInput",
        "inputFields": [
          {
            "name": "customName",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "deviceType",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "modelName",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "operatingSystem",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "platformId",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          },
          {
            "name": "pushToken",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "RegisterUserParams",
        "inputFields": [
          {
            "name": "email",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          },
          {
            "name": "hideFullName",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          },
          {
            "name": "nickname",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "RootMutationType",
        "fields": [
          {
            "name": "createArticle",
            "type": {
              "kind": "OBJECT",
              "name": "Article"
            },
            "args": [
              {
                "name": "article",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "ArticleInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createCalendar",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Calendar"
              }
            },
            "args": [
              {
                "name": "data",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "CalendarInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createCalendarEvent",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "CalendarEvent"
              }
            },
            "args": [
              {
                "name": "data",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "CalendarEventInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createCategory",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Category"
              }
            },
            "args": [
              {
                "name": "category",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "CreateCategoryInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createDirectory",
            "type": {
              "kind": "OBJECT",
              "name": "Directory"
            },
            "args": [
              {
                "name": "isPublic",
                "type": {
                  "kind": "SCALAR",
                  "name": "Boolean"
                }
              },
              {
                "name": "name",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              },
              {
                "name": "parentDirectoryId",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createFeedback",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Feedback"
              }
            },
            "args": [
              {
                "name": "feedback",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "CreateFeedbackInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createLottaFeedback",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean"
              }
            },
            "args": [
              {
                "name": "message",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              },
              {
                "name": "subject",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createMessage",
            "type": {
              "kind": "OBJECT",
              "name": "Message"
            },
            "args": [
              {
                "name": "message",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "MessageInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createUserGroup",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "UserGroup"
              }
            },
            "args": [
              {
                "name": "group",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "UserGroupInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "createWidget",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Widget"
              }
            },
            "args": [
              {
                "name": "title",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              },
              {
                "name": "type",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "WidgetType"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteArticle",
            "type": {
              "kind": "OBJECT",
              "name": "Article"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteCalendarEvent",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "CalendarEvent"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteCategory",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Category"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteDevice",
            "type": {
              "kind": "OBJECT",
              "name": "Device"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteDirectory",
            "type": {
              "kind": "OBJECT",
              "name": "Directory"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteFeedback",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Feedback"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteMessage",
            "type": {
              "kind": "OBJECT",
              "name": "Message"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteUserGroup",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "DeleteUserGroupResult"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "deleteWidget",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Widget"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "destroyAccount",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [
              {
                "name": "transferFileIds",
                "type": {
                  "kind": "LIST",
                  "ofType": {
                    "kind": "NON_NULL",
                    "ofType": {
                      "kind": "SCALAR",
                      "name": "ID"
                    }
                  }
                }
              },
              {
                "name": "userId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "login",
            "type": {
              "kind": "OBJECT",
              "name": "Authresult"
            },
            "args": [
              {
                "name": "password",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              },
              {
                "name": "username",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "logout",
            "type": {
              "kind": "OBJECT",
              "name": "Authresult"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "reactToArticle",
            "type": {
              "kind": "OBJECT",
              "name": "Article"
            },
            "args": [
              {
                "name": "articleId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "type",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "ArticleReactionType"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "register",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [
              {
                "name": "groupKey",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              },
              {
                "name": "user",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "RegisterUserParams"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "registerDevice",
            "type": {
              "kind": "OBJECT",
              "name": "Device"
            },
            "args": [
              {
                "name": "device",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "RegisterDeviceInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "requestFileConversion",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [
              {
                "name": "category",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "requestHisecToken",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [
              {
                "name": "password",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "requestPasswordReset",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [
              {
                "name": "email",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "resetPassword",
            "type": {
              "kind": "OBJECT",
              "name": "Authresult"
            },
            "args": [
              {
                "name": "email",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              },
              {
                "name": "password",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              },
              {
                "name": "token",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "respondToFeedback",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Feedback"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "message",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              },
              {
                "name": "subject",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "sendFeedbackToLotta",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Feedback"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "message",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "sendFormResponse",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [
              {
                "name": "contentModuleId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "response",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Json"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "toggleArticlePin",
            "type": {
              "kind": "OBJECT",
              "name": "Article"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateArticle",
            "type": {
              "kind": "OBJECT",
              "name": "Article"
            },
            "args": [
              {
                "name": "article",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "ArticleInput"
                  }
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateCalendar",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Calendar"
              }
            },
            "args": [
              {
                "name": "data",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "CalendarInput"
                  }
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateCalendarEvent",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "CalendarEvent"
              }
            },
            "args": [
              {
                "name": "data",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "CalendarEventInput"
                  }
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateCategory",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Category"
              }
            },
            "args": [
              {
                "name": "category",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "UpdateCategoryInput"
                  }
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateDevice",
            "type": {
              "kind": "OBJECT",
              "name": "Device"
            },
            "args": [
              {
                "name": "device",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "UpdateDeviceInput"
                  }
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateDirectory",
            "type": {
              "kind": "OBJECT",
              "name": "Directory"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "name",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              },
              {
                "name": "parentDirectoryId",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateEmail",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [
              {
                "name": "newEmail",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [
              {
                "name": "filename",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "parentDirectoryId",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updatePassword",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [
              {
                "name": "newPassword",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateProfile",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [
              {
                "name": "user",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "UpdateUserParams"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateTenant",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Tenant"
              }
            },
            "args": [
              {
                "name": "tenant",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "TenantInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateUser",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [
              {
                "name": "groups",
                "type": {
                  "kind": "LIST",
                  "ofType": {
                    "kind": "NON_NULL",
                    "ofType": {
                      "kind": "INPUT_OBJECT",
                      "name": "SelectUserGroupInput"
                    }
                  }
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateUserGroup",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "UserGroup"
              }
            },
            "args": [
              {
                "name": "group",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "UserGroupInput"
                  }
                }
              },
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "updateWidget",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Widget"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "widget",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "WidgetInput"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "uploadFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [
              {
                "name": "file",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Upload"
                  }
                }
              },
              {
                "name": "parentDirectoryId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "RootQueryType",
        "fields": [
          {
            "name": "aggregateAnalytics",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "AnalyticsMetrics"
              }
            },
            "args": [
              {
                "name": "date",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date"
                  }
                }
              },
              {
                "name": "period",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "AnalyticsPeriod"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "article",
            "type": {
              "kind": "OBJECT",
              "name": "Article"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "articles",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "Article"
              }
            },
            "args": [
              {
                "name": "categoryId",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              },
              {
                "name": "filter",
                "type": {
                  "kind": "INPUT_OBJECT",
                  "name": "ArticleFilter"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "articlesByTag",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "Article"
                }
              }
            },
            "args": [
              {
                "name": "tag",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "articlesByUser",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "Article"
                }
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "articlesWithUserFiles",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "Article"
              }
            },
            "args": [
              {
                "name": "userId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "breakdownAnalytics",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "BreakdownMetrics"
                  }
                }
              }
            },
            "args": [
              {
                "name": "date",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date"
                  }
                }
              },
              {
                "name": "metrics",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "LIST",
                    "ofType": {
                      "kind": "NON_NULL",
                      "ofType": {
                        "kind": "ENUM",
                        "name": "AnalyticsMetric"
                      }
                    }
                  }
                }
              },
              {
                "name": "period",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "AnalyticsPeriod"
                  }
                }
              },
              {
                "name": "property",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "AnalyticsProperty"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "calendarEvents",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "CalendarEvent"
                  }
                }
              }
            },
            "args": [
              {
                "name": "calendarId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "from",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "DateTime"
                  }
                }
              },
              {
                "name": "latest",
                "type": {
                  "kind": "SCALAR",
                  "name": "DateTime"
                }
              },
              {
                "name": "limit",
                "type": {
                  "kind": "SCALAR",
                  "name": "Int"
                }
              },
              {
                "name": "timezone",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "calendars",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Calendar"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "categories",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Category"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "contentModuleResults",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "ContentModuleResult"
              }
            },
            "args": [
              {
                "name": "contentModuleId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "conversation",
            "type": {
              "kind": "OBJECT",
              "name": "Conversation"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "markAsRead",
                "type": {
                  "kind": "SCALAR",
                  "name": "Boolean"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "conversations",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "Conversation"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "currentUser",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "devices",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Device"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "directories",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Directory"
                  }
                }
              }
            },
            "args": [
              {
                "name": "parentDirectoryId",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "directory",
            "type": {
              "kind": "OBJECT",
              "name": "Directory"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "externalCalendarEvents",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "ExternalCalendarEvent"
                  }
                }
              }
            },
            "args": [
              {
                "name": "days",
                "type": {
                  "kind": "SCALAR",
                  "name": "Int"
                }
              },
              {
                "name": "url",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "feedbacks",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Feedback"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "file",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "files",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "File"
                  }
                }
              }
            },
            "args": [
              {
                "name": "parentDirectoryId",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "getReactionUsers",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "User"
              }
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              },
              {
                "name": "type",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "ArticleReactionType"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "group",
            "type": {
              "kind": "OBJECT",
              "name": "UserGroup"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "ownArticles",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "Article"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "realtimeAnalytics",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "relevantFilesInUsage",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "File"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "schedule",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            },
            "args": [
              {
                "name": "date",
                "type": {
                  "kind": "SCALAR",
                  "name": "Date"
                }
              },
              {
                "name": "widgetId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "search",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "Article"
              }
            },
            "args": [
              {
                "name": "options",
                "type": {
                  "kind": "INPUT_OBJECT",
                  "name": "SearchOptions"
                }
              },
              {
                "name": "searchText",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "searchDirectories",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Directory"
                  }
                }
              }
            },
            "args": [
              {
                "name": "searchterm",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "searchFiles",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "File"
                  }
                }
              }
            },
            "args": [
              {
                "name": "searchterm",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "searchUsers",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "User"
                  }
                }
              }
            },
            "args": [
              {
                "name": "groups",
                "type": {
                  "kind": "LIST",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "SelectUserGroupInput"
                  }
                }
              },
              {
                "name": "lastSeen",
                "type": {
                  "kind": "SCALAR",
                  "name": "Int"
                }
              },
              {
                "name": "searchtext",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "tags",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "tenant",
            "type": {
              "kind": "OBJECT",
              "name": "Tenant"
            },
            "args": [
              {
                "name": "slug",
                "type": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "timeseriesAnalytics",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "TimeseriesMetrics"
                  }
                }
              }
            },
            "args": [
              {
                "name": "date",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date"
                  }
                }
              },
              {
                "name": "metric",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "AnalyticsMetric"
                  }
                }
              },
              {
                "name": "period",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "AnalyticsPeriod"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "unpublishedArticles",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "Article"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "usage",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Usage"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "user",
            "type": {
              "kind": "OBJECT",
              "name": "User"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "userGroups",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "UserGroup"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "users",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "User"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "widgets",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Widget"
                  }
                }
              }
            },
            "args": [
              {
                "name": "categoryId",
                "type": {
                  "kind": "SCALAR",
                  "name": "ID"
                }
              }
            ],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "RootSubscriptionType",
        "fields": [
          {
            "name": "articleIsUpdated",
            "type": {
              "kind": "OBJECT",
              "name": "Article"
            },
            "args": [
              {
                "name": "id",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "conversionProgress",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [
              {
                "name": "fileId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID"
                  }
                }
              }
            ],
            "isDeprecated": false
          },
          {
            "name": "receiveMessage",
            "type": {
              "kind": "OBJECT",
              "name": "Message"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "SearchOptions",
        "inputFields": [
          {
            "name": "categoryId",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "SelectCategoryInput",
        "inputFields": [
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "SelectFileInput",
        "inputFields": [
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "SelectUserGroupInput",
        "inputFields": [
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "SelectUserInput",
        "inputFields": [
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "SelectWidgetInput",
        "inputFields": [
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "StorageUsage",
        "fields": [
          {
            "name": "filesTotal",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "usedTotal",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "String"
      },
      {
        "kind": "OBJECT",
        "name": "Tenant",
        "fields": [
          {
            "name": "address",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "backgroundImageFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "configuration",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "TenantConfiguration"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "customDomains",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "CustomDomain"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "eduplacesId",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "host",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "identifier",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "logoImageFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "slug",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "stats",
            "type": {
              "kind": "OBJECT",
              "name": "TenantStats"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "title",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "type",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "TenantConfiguration",
        "fields": [
          {
            "name": "backgroundImageFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "customTheme",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "logoImageFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "userMaxStorageConfig",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "TenantConfigurationInput",
        "inputFields": [
          {
            "name": "customTheme",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            }
          },
          {
            "name": "userMaxStorageConfig",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "TenantInput",
        "inputFields": [
          {
            "name": "backgroundImageFileId",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            }
          },
          {
            "name": "configuration",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "TenantConfigurationInput"
            }
          },
          {
            "name": "logoImageFileId",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            }
          },
          {
            "name": "title",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "TenantStats",
        "fields": [
          {
            "name": "articleCount",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "categoryCount",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "fileCount",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "userCount",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "TimeseriesMetrics",
        "fields": [
          {
            "name": "date",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "value",
            "type": {
              "kind": "SCALAR",
              "name": "Float"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "UpdateCategoryInput",
        "inputFields": [
          {
            "name": "bannerImageFile",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectFileInput"
            }
          },
          {
            "name": "category",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectCategoryInput"
            }
          },
          {
            "name": "groups",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INPUT_OBJECT",
                "name": "SelectUserGroupInput"
              }
            }
          },
          {
            "name": "hideArticlesFromHomepage",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "isSidenav",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "layoutName",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "redirect",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "sortKey",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            }
          },
          {
            "name": "title",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "widgets",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INPUT_OBJECT",
                "name": "SelectWidgetInput"
              }
            },
            "defaultValue": "[]"
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "UpdateDeviceInput",
        "inputFields": [
          {
            "name": "customName",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "deviceType",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "pushToken",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "UpdateUserParams",
        "inputFields": [
          {
            "name": "avatarImageFile",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectFileInput"
            }
          },
          {
            "name": "class",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "enrollmentTokens",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            }
          },
          {
            "name": "hideFullName",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "name",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          },
          {
            "name": "nickname",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "SCALAR",
        "name": "Upload"
      },
      {
        "kind": "OBJECT",
        "name": "Usage",
        "fields": [
          {
            "name": "media",
            "type": {
              "kind": "OBJECT",
              "name": "MediaUsage"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "periodEnd",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "periodStart",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "storage",
            "type": {
              "kind": "OBJECT",
              "name": "StorageUsage"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "User",
        "fields": [
          {
            "name": "articles",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Article"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "assignedGroups",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "UserGroup"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "avatarImageFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "class",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "email",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "enrollmentTokens",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "groups",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "UserGroup"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "hasChangedDefaultPassword",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "hideFullName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "lastSeen",
            "type": {
              "kind": "SCALAR",
              "name": "DateTime"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "name",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "nickname",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "unreadMessages",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "UserGroup",
        "fields": [
          {
            "name": "canReadFullName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "enrollmentTokens",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String"
                  }
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "insertedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "isAdminGroup",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "sortKey",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "updatedAt",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "DateTime"
              }
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "UserGroupInput",
        "inputFields": [
          {
            "name": "canReadFullName",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "enrollmentTokens",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "SCALAR",
                  "name": "String"
                }
              }
            }
          },
          {
            "name": "isAdminGroup",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean"
            }
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          },
          {
            "name": "sortKey",
            "type": {
              "kind": "SCALAR",
              "name": "Int"
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "OBJECT",
        "name": "Widget",
        "fields": [
          {
            "name": "calendarEvents",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "CalendarEvent"
                }
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "configuration",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "groups",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "UserGroup"
              }
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "iconImageFile",
            "type": {
              "kind": "OBJECT",
              "name": "File"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "id",
            "type": {
              "kind": "SCALAR",
              "name": "ID"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "title",
            "type": {
              "kind": "SCALAR",
              "name": "String"
            },
            "args": [],
            "isDeprecated": false
          },
          {
            "name": "type",
            "type": {
              "kind": "ENUM",
              "name": "WidgetType"
            },
            "args": [],
            "isDeprecated": false
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "WidgetInput",
        "inputFields": [
          {
            "name": "configuration",
            "type": {
              "kind": "SCALAR",
              "name": "Json"
            }
          },
          {
            "name": "groups",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "INPUT_OBJECT",
                  "name": "SelectUserGroupInput"
                }
              }
            }
          },
          {
            "name": "iconImageFile",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "SelectFileInput"
            }
          },
          {
            "name": "title",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String"
              }
            }
          }
        ],
        "isOneOf": false
      },
      {
        "kind": "ENUM",
        "name": "WidgetType",
        "enumValues": [
          {
            "name": "CALENDAR",
            "isDeprecated": false
          },
          {
            "name": "IFRAME",
            "isDeprecated": false
          },
          {
            "name": "SCHEDULE",
            "isDeprecated": false
          },
          {
            "name": "TAGCLOUD",
            "isDeprecated": false
          }
        ]
      }
    ],
    "directives": []
  }
} as const;

export { introspection };

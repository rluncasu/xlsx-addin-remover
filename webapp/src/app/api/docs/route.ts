import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Excel Addin Remover API',
      description: 'API for removing addins from Excel (.xlsx) files',
      version: '1.0.0',
      contact: {
        name: 'Excel Addin Remover',
        url: 'https://github.com/your-repo/excel-addin-remover'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    paths: {
      '/api/analyze-excel': {
        post: {
          summary: 'Analyze Excel file',
          description: 'Analyze an Excel file and return information about its addins',
          tags: ['Excel Analysis'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Excel (.xlsx) file to analyze'
                    }
                  },
                  required: ['file']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successful analysis',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      fileName: {
                        type: 'string',
                        description: 'Name of the analyzed file'
                      },
                      addins: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              description: 'Unique identifier of the addin'
                            },
                            name: {
                              type: 'string',
                              description: 'Name of the addin'
                            },
                            version: {
                              type: 'string',
                              description: 'Version of the addin'
                            },
                            store: {
                              type: 'string',
                              description: 'Store where the addin is from'
                            },
                            storeType: {
                              type: 'string',
                              description: 'Type of store'
                            }
                          }
                        }
                      },
                      addinCount: {
                        type: 'number',
                        description: 'Total number of addins found'
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - invalid file or missing file',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        get: {
          summary: 'Get analyze endpoint info',
          description: 'Get information about the analyze endpoint',
          tags: ['Excel Analysis'],
          responses: {
            '200': {
              description: 'Endpoint information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      },
                      description: {
                        type: 'string'
                      },
                      method: {
                        type: 'string'
                      },
                      body: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/process-excel': {
        post: {
          summary: 'Process Excel file',
          description: 'Process an Excel file by removing selected addins and return the modified file',
          tags: ['Excel Processing'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Excel (.xlsx) file to process'
                    },
                    selectedAddinIds: {
                      type: 'string',
                      description: 'JSON array of addin IDs to remove'
                    }
                  },
                  required: ['file']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successfully processed file',
              content: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                  schema: {
                    type: 'string',
                    format: 'binary',
                    description: 'Processed Excel file with addins removed'
                  }
                }
              },
              headers: {
                'Content-Disposition': {
                  description: 'Filename for download',
                  schema: {
                    type: 'string'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - invalid file or missing file',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        get: {
          summary: 'Get process endpoint info',
          description: 'Get information about the process endpoint',
          tags: ['Excel Processing'],
          responses: {
            '200': {
              description: 'Endpoint information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      },
                      endpoints: {
                        type: 'object'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Excel Analysis',
        description: 'Endpoints for analyzing Excel files'
      },
      {
        name: 'Excel Processing',
        description: 'Endpoints for processing Excel files'
      }
    ],
    components: {
      schemas: {
        ExcelAddin: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier of the addin'
            },
            name: {
              type: 'string',
              description: 'Name of the addin'
            },
            version: {
              type: 'string',
              description: 'Version of the addin'
            },
            store: {
              type: 'string',
              description: 'Store where the addin is from'
            },
            storeType: {
              type: 'string',
              description: 'Type of store'
            }
          }
        }
      }
    }
  };

  return NextResponse.json(swaggerDocument);
}

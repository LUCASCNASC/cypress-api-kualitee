const PATH_API = '/Requirement/List';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

const validStatus = 'open';
const validCreatedBy = [123, 456];
const validExport = 'yes';
const validExportType = 'CSV';

describe('Requirements List - /requirements/list', () => {

  it('Status Code are 200', () => {
    requirementsList({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 200', () => {
    requirementsList({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId,
      status: validStatus
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });

  it('Status Code are 200', () => {
    requirementsList({
      token: validToken,
      project_id: validProjectId,
      created_by: validCreatedBy
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });

  it('Status Code are 200', () => {
    requirementsList({
      token: validToken,
      project_id: validProjectId,
      export: validExport,
      export_type: validExportType
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });
  
  it('Status Code are 400, 401, 403', () => {
    requirementsList({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    requirementsList({ token: 'token_invalido', project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 401, 403', () => {
    requirementsList({ token: 'token_expirado', project_id: validProjectId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    requirementsList({ token: null, project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });
  
  it('Status Code are 400, 422, 404', () => {
    requirementsList({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422, 404', () => {
    requirementsList({ token: validToken, project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    requirementsList({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    requirementsList({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Status Code are 429', () => {
    requirementsList({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      requirementsList({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    requirementsList({ token: validToken, project_id: validProjectId })
      .then(() => requirementsList({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});
const PATH_API = '/Requirement/BulkUpdate';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

const validRequirementIds = [101, 102, 103];

describe('Requirements Bulk Update - /requirements/bulkupdate', () => {

  it('Status Code is 200', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 200, 400, 422', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      'requirement_id[2]': validRequirementIds[2],
      module_id: validModuleId
    }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    bulkUpdate({
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url:`/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'requirement_id[0]': validRequirementIds[0],
        'requirement_id[1]': validRequirementIds[1],
        module_id: validModuleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    bulkUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      bulkUpdate({
        token: validToken,
        project_id: validProjectId,
        'requirement_id[0]': validRequirementIds[0],
        'requirement_id[1]': validRequirementIds[1],
        module_id: validModuleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    })
      .then(() => bulkUpdate({
        token: validToken,
        project_id: validProjectId,
        'requirement_id[0]': validRequirementIds[0],
        'requirement_id[1]': validRequirementIds[1],
        module_id: validModuleId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});
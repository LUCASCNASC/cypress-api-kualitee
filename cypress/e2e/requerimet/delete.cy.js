const PATH_API = '/Requirement/delete';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validRequirementId = 123;

describe('Requirements Delete - /requirements/delete', () => {

  it('Status Code are 200', () => {
    requirementsDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validRequirementId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    requirementsDelete({
      project_id: validProjectId,
      'id[0]': validRequirementId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Deleta múltiplos requisitos com id[0], id[1], ...', () => {
    requirementsDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validRequirementId,
      'id[1]': validRequirementId + 1
    }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    requirementsDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validRequirementId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'id[0]': validRequirementId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    requirementsDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'id[0]': validRequirementId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    requirementsDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validRequirementId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      requirementsDelete({
        token: validToken,
        project_id: validProjectId,
        'id[0]': validRequirementId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    requirementsDelete({
      token: validToken,
      project_id: validProjectId,
      'id[0]': validRequirementId
    })
      .then(() => requirementsDelete({
        token: validToken,
        project_id: validProjectId,
        'id[0]': validRequirementId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});
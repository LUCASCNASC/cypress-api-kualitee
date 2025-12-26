const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/Delete';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validDefectId = 101;

describe('API rest - Cycle - Defects Delete - /defects/delete', () => {

  it('Status Code is 200', () => {
    defectsDelete({
      token: validToken,
      project_id: validProjectId,
      id: [validDefectId]
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    defectsDelete({
      project_id: validProjectId,
      id: [validDefectId]
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    defectsDelete({
      token: validToken,
      project_id: validProjectId,
      id: [validDefectId],
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        id: [validDefectId]
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: [validDefectId]
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    defectsDelete({
      token: validToken,
      project_id: validProjectId,
      id: [validDefectId]
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsDelete({
        token: validToken,
        project_id: validProjectId,
        id: [validDefectId]
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    defectsDelete({
      token: validToken,
      project_id: validProjectId,
      id: [validDefectId]
    }).then(() =>
      defectsDelete({
        token: validToken,
        project_id: validProjectId,
        id: [validDefectId]
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});
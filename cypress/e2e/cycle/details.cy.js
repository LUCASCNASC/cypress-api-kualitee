const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/stagingdetail';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validDefectId = 101;

describe('Cycle - Defects Details - /defects/details', () => {

  it('Status Code is 200', () => {
    defectsDetails({
      token: validToken,
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    defectsDetails({
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    defectsDetails({
      token: validToken,
      project_id: validProjectId,
      defect_id: validDefectId,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: {
        token: validToken,
        project_id: validProjectId,
        defect_id: validDefectId
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsDetails({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Status Code is 429', () => {
    defectsDetails({
      token: validToken,
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsDetails({
        token: validToken,
        project_id: validProjectId,
        defect_id: validDefectId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    defectsDetails({
      token: validToken,
      project_id: validProjectId,
      defect_id: validDefectId
    }).then(() =>
      defectsDetails({
        token: validToken,
        project_id: validProjectId,
        defect_id: validDefectId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});
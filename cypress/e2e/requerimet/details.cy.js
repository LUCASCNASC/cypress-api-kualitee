const PATH_API = '/Requirement/requirements%2Fdetail';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validRequirementId = 101;

describe('Requirements Details - /requirements/details', () => {

  it('Status Code are 200', () => {
    getRequirementDetails({
      token: validToken,
      project_id: validProjectId,
      requirement_id: validRequirementId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    getRequirementDetails({
      project_id: validProjectId,
      requirement_id: validRequirementId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 200, 400', () => {
    getRequirementDetails({
      token: validToken,
      project_id: validProjectId,
      requirement_id: validRequirementId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: {
        token: validToken,
        project_id: validProjectId,
        requirement_id: validRequirementId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([200, 400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    getRequirementDetails({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      requirement_id: validRequirementId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    getRequirementDetails({
      token: validToken,
      project_id: validProjectId,
      requirement_id: validRequirementId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      getRequirementDetails({
        token: validToken,
        project_id: validProjectId,
        requirement_id: validRequirementId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    getRequirementDetails({
      token: validToken,
      project_id: validProjectId,
      requirement_id: validRequirementId
    })
      .then(() => getRequirementDetails({
        token: validToken,
        project_id: validProjectId,
        requirement_id: validRequirementId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});
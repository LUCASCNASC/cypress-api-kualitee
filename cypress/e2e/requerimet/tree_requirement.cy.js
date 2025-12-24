const PATH_API = '/Requirement/tree_requirements';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validRequirementId = 101;

describe('API rest - Requirements Tree Requirements - /requirements/tree_requirements', () => {


  it('Status Code is 200', () => {

    treeRequirements({
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

  it('Falha sem token', () => {

    treeRequirements({
      project_id: validProjectId,
      requirement_id: validRequirementId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {

    treeRequirements({
      token: validToken,
      project_id: validProjectId,
      requirement_id: validRequirementId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  it('Falha com Content-Type application/json', () => {

    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        requirement_id: validRequirementId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {

    treeRequirements({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      requirement_id: validRequirementId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {

    treeRequirements({
      token: validToken,
      project_id: validProjectId,
      requirement_id: validRequirementId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {

    const requests = Array(10).fill(0).map(() =>
      treeRequirements({
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

  it('Permite requisições duplicadas rapidamente', () => {

    treeRequirements({
      token: validToken,
      project_id: validProjectId,
      requirement_id: validRequirementId
    })
      .then(() => treeRequirements({
        token: validToken,
        project_id: validProjectId,
        requirement_id: validRequirementId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});
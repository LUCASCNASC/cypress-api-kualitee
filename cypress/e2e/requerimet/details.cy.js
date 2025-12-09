const PATH_API = '/Requirement/requirements%2Fdetail';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validRequirementId = 101;

describe('API rest - Requirements Details - /requirements/details', () => {

  // Função utilitária para chamada da API
  function getRequirementDetails(query, options = {}) {
    return cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: query,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Status Code 200', () => {
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

  
  it('Falha sem token', () => {
    getRequirementDetails({
      project_id: validProjectId,
      requirement_id: validRequirementId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      getRequirementDetails({
        token,
        project_id: validProjectId,
        requirement_id: validRequirementId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  
  ['project_id', 'requirement_id'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const query = {
        token: validToken,
        project_id: validProjectId,
        requirement_id: validRequirementId
      };
      delete query[field];
      getRequirementDetails(query).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];

  [
    { field: 'project_id', valid: validProjectId },
    { field: 'requirement_id', valid: validRequirementId }
  ].forEach(({ field, valid }) => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const query = {
          token: validToken,
          project_id: validProjectId,
          requirement_id: validRequirementId
        };
        query[field] = value;
        getRequirementDetails(query).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  
  it('Ignora campo extra na query', () => {
    getRequirementDetails({
      token: validToken,
      project_id: validProjectId,
      requirement_id: validRequirementId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        qs: {
          token: validToken,
          project_id: validProjectId,
          requirement_id: validRequirementId
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado (não afeta GET normalmente, mas cobre o cenário) ---
  it('Falha com Content-Type application/json', () => {
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

  
  it('Headers devem conter CORS e content-type', () => {
    getRequirementDetails({
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

  
  it('Permite requisições duplicadas rapidamente', () => {
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
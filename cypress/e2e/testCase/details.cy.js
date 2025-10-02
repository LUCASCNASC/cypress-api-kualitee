// Testes automatizados para API: GET /test_case/details
// Segue o padrão dos testes Cypress do projeto
const PATH_API = '/TestCase/Detail'

describe('API - Test Case Details - /test_case/details', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validTcId = 1001;    // Substitua por um tc_id válido do seu ambiente

  // Função utilitária para chamada da API
  function testCaseDetails(query, options = {}) {
    return cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: query,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO: todos os campos obrigatórios válidos ---
  it('Retorna detalhes do caso de teste com token, project_id e tc_id válidos', () => {
    testCaseDetails({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    testCaseDetails({
      project_id: validProjectId,
      tc_id: validTcId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      testCaseDetails({
        token,
        project_id: validProjectId,
        tc_id: validTcId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campo obrigatório ausente ---
  ['project_id', 'tc_id'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const query = {
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId
      };
      delete query[field];
      testCaseDetails(query).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'tc_id'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const query = {
          token: validToken,
          project_id: validProjectId,
          tc_id: validTcId
        };
        query[field] = value;
        testCaseDetails(query).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra na query', () => {
    testCaseDetails({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  // --- HTTP Method errado ---
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        qs: {
          token: validToken,
          project_id: validProjectId,
          tc_id: validTcId
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    testCaseDetails({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      tc_id: validTcId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    testCaseDetails({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const queries = Array(10).fill(0).map(() => ({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId
    }));
    const requests = queries.map(q => testCaseDetails(q));
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    testCaseDetails({
      token: validToken,
      project_id: validProjectId,
      tc_id: validTcId
    })
      .then(() => testCaseDetails({
        token: validToken,
        project_id: validProjectId,
        tc_id: validTcId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});
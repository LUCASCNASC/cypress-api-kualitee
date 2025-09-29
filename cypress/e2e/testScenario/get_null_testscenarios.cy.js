// Testes automatizados para API: POST /test_scenario/get_null_testscenarios
// Segue o padrão dos testes Cypress do projeto
const PATH_API = '/Test%20Scenario/GetNullTestScenario'

describe('API - Get Null TestScenario - /test_scenario/get_null_testscenarios', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente
  const validBuildId = 12;   // Opcional, se aplicável

  // Função utilitária para chamada da API
  function getNullTestScenarios(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // POSITIVO: obrigatórios apenas
  it('Retorna cenários nulos com campos obrigatórios válidos', () => {
    getNullTestScenarios({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // NEGATIVO: AUTH
  it('Falha sem token', () => {
    getNullTestScenarios({
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      getNullTestScenarios({
        token,
        project_id: validProjectId,
        build_id: validBuildId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // Campo obrigatório ausente
  it('Falha sem project_id', () => {
    getNullTestScenarios({
      token: validToken,
      build_id: validBuildId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  // Campos obrigatórios inválidos
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  ['project_id', 'build_id'].forEach(field => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          build_id: validBuildId
        };
        body[field] = value;
        getNullTestScenarios(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // Campos extras
  it('Ignora campo extra no body', () => {
    getNullTestScenarios({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
    });
  });

  // HTTP Method errado
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url:`/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          build_id: validBuildId
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // Content-Type errado
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // Contrato: Não vazar informações sensíveis
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    getNullTestScenarios({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // Headers
  it('Headers devem conter CORS e content-type', () => {
    getNullTestScenarios({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // Rate limit (se aplicável)
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      getNullTestScenarios({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // Duplicidade: aceita chamadas idênticas sequenciais
  it('Permite chamadas idênticas rapidamente', () => {
    getNullTestScenarios({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId
    })
      .then(() => getNullTestScenarios({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});
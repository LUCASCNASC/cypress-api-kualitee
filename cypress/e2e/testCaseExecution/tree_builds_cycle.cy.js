// Testes automatizados para API: POST /test_case_execution/tree_builds_cycle
// Segue o padrão completo do exemplo fornecido, cobrindo todos os cenários possíveis.
const PATH_API = '/Test%20Case%20Execution/TreeBuildsCycle'

describe('API - Test Case Execution Tree Builds Cycle - /test_case_execution/tree_builds_cycle', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validBuildId = Cypress.env('VALID_BUILD_ID');

  function treeBuildsCycle(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Retorna ciclos da build do projeto com token, project_id e build_id válidos', () => {
    treeBuildsCycle({ token: validToken, project_id: validProjectId, build_id: validBuildId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    treeBuildsCycle({ project_id: validProjectId, build_id: validBuildId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      treeBuildsCycle({ token, project_id: validProjectId, build_id: validBuildId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    treeBuildsCycle({ token: validToken, build_id: validBuildId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      treeBuildsCycle({ token: validToken, project_id, build_id: validBuildId }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- build_id inválido, ausente, tipos errados, limites ---
  it('Falha sem build_id', () => {
    treeBuildsCycle({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(build_id => {
    it(`Falha com build_id inválido (${JSON.stringify(build_id)})`, () => {
      treeBuildsCycle({ token: validToken, project_id: validProjectId, build_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    treeBuildsCycle({ token: validToken, project_id: validProjectId, build_id: validBuildId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken, project_id: validProjectId, build_id: validBuildId },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, build_id: validBuildId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeBuildsCycle({ token: "' OR 1=1 --", project_id: validProjectId, build_id: validBuildId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    treeBuildsCycle({ token: validToken, project_id: validProjectId, build_id: validBuildId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      treeBuildsCycle({ token: validToken, project_id: validProjectId, build_id: validBuildId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    treeBuildsCycle({ token: validToken, project_id: validProjectId, build_id: validBuildId })
      .then(() => treeBuildsCycle({ token: validToken, project_id: validProjectId, build_id: validBuildId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});
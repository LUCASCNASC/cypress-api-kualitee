// Testes automatizados para API: POST /test_case_execution/tree_test_cases
// Padrão completo conforme arquivo de exemplo fornecido, cobrindo todos os cenários possíveis.

describe('API - Test Case Execution Tree Test Cases - /test_case_execution/tree_test_cases', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validCycleId = 1001;

  function treeTestCases(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Test%20Case%20Execution/TreeTestCases`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Retorna árvore de test cases com token, project_id e cycle_id válidos', () => {
    treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    treeTestCases({ project_id: validProjectId, cycle_id: validCycleId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345, '😀🔥💥', "' OR 1=1 --"].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      treeTestCases({ token, project_id: validProjectId, cycle_id: validCycleId }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    treeTestCases({ token: validToken, cycle_id: validCycleId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      treeTestCases({ token: validToken, project_id, cycle_id: validCycleId }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- cycle_id inválido, ausente, tipos errados, limites ---
  it('Falha sem cycle_id', () => {
    treeTestCases({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(cycle_id => {
    it(`Falha com cycle_id inválido (${JSON.stringify(cycle_id)})`, () => {
      treeTestCases({ token: validToken, project_id: validProjectId, cycle_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/Test%20Case%20Execution/TreeTestCases`,
        form: true,
        body: { token: validToken, project_id: validProjectId, cycle_id: validCycleId },
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
      url: `${BASE_URL}/Test%20Case%20Execution/TreeTestCases`,
      body: { token: validToken, project_id: validProjectId, cycle_id: validCycleId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeTestCases({ token: "' OR 1=1 --", project_id: validProjectId, cycle_id: validCycleId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId })
      .then(() => treeTestCases({ token: validToken, project_id: validProjectId, cycle_id: validCycleId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});